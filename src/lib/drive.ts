// Low-level Google Drive client for cloud sync.
//
// Uses Google Identity Services (the browser token model) so there is NO
// client secret and nothing sensitive is ever stored in this open-source code.
// All data lives in the Drive "appDataFolder": a hidden, per-user folder that
// only this app can see. The user's own Google account owns the data.

import { GOOGLE_CLIENT_ID } from './syncConfig'

const SCOPE = 'https://www.googleapis.com/auth/drive.appdata'
const FILE_NAME = 'techo-planner.json'
const GIS_SRC = 'https://accounts.google.com/gsi/client'
const API = 'https://www.googleapis.com/drive/v3'
const UPLOAD = 'https://www.googleapis.com/upload/drive/v3'

// --- Minimal typings for the Google Identity Services global ---------------

interface TokenResponse {
  access_token?: string
  expires_in?: string | number
  error?: string
}
interface TokenClient {
  requestAccessToken: (opts?: { prompt?: string }) => void
}
interface GoogleOAuth2 {
  initTokenClient: (cfg: {
    client_id: string
    scope: string
    callback: (resp: TokenResponse) => void
    error_callback?: (err: { type?: string }) => void
  }) => TokenClient
  revoke: (token: string, done?: () => void) => void
}
declare global {
  interface Window {
    google?: { accounts?: { oauth2?: GoogleOAuth2 } }
  }
}

// --- Auth ------------------------------------------------------------------

let gisPromise: Promise<void> | null = null
function loadGis(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  if (gisPromise) return gisPromise
  gisPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = GIS_SRC
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error("Couldn't load Google sign-in"))
    document.head.appendChild(s)
  })
  return gisPromise
}

let tokenClient: TokenClient | null = null
let pending: { resolve: (t: string) => void; reject: (e: Error) => void } | null = null
let cached: { value: string; exp: number } | null = null

async function ensureClient(): Promise<TokenClient> {
  await loadGis()
  const oauth2 = window.google?.accounts?.oauth2
  if (!oauth2) throw new Error('Google sign-in unavailable')
  if (!tokenClient) {
    tokenClient = oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPE,
      callback: (resp) => {
        if (resp.error || !resp.access_token) {
          pending?.reject(new Error(resp.error || 'Authorization failed'))
        } else {
          const ttl = (Number(resp.expires_in) || 3600) * 1000
          cached = { value: resp.access_token, exp: Date.now() + ttl - 60_000 }
          pending?.resolve(resp.access_token)
        }
        pending = null
      },
      error_callback: (err) => {
        pending?.reject(new Error(err?.type || 'Authorization failed'))
        pending = null
      },
    })
  }
  return tokenClient
}

/**
 * Get a usable access token.
 * - interactive=true: may show Google's account/consent popup (use on Connect).
 * - interactive=false: silent; reuses the cached token or tries a no-prompt
 *   refresh. Rejects if the user must interact again.
 */
async function getToken(interactive: boolean): Promise<string> {
  if (cached && cached.exp > Date.now()) return cached.value
  const client = await ensureClient()
  return new Promise<string>((resolve, reject) => {
    pending = { resolve, reject }
    try {
      client.requestAccessToken({ prompt: interactive ? '' : 'none' })
    } catch (e) {
      pending = null
      reject(e as Error)
    }
  })
}

/** Force the interactive sign-in / consent flow. Resolves once granted. */
export async function connect(): Promise<void> {
  await getToken(true)
}

export function disconnect(): void {
  const token = cached?.value
  cached = null
  if (token) {
    try {
      window.google?.accounts?.oauth2?.revoke(token)
    } catch {
      // best effort
    }
  }
}

/** True if we hold (or can silently obtain) a token without a popup. */
export async function hasSilentAccess(): Promise<boolean> {
  try {
    await getToken(false)
    return true
  } catch {
    return false
  }
}

// --- Drive file I/O --------------------------------------------------------

function bearer(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` }
}

async function fail(action: string, r: Response): Promise<never> {
  let detail = ''
  try {
    detail = (await r.text()).slice(0, 200)
  } catch {
    /* ignore */
  }
  throw new Error(`Drive ${action} failed (${r.status})${detail ? ': ' + detail : ''}`)
}

async function findFileId(token: string): Promise<string | null> {
  const q = encodeURIComponent(`name='${FILE_NAME}' and trashed=false`)
  const url = `${API}/files?spaces=appDataFolder&q=${q}&fields=files(id)&pageSize=1`
  const r = await fetch(url, { headers: bearer(token) })
  if (!r.ok) await fail('list', r)
  const j = (await r.json()) as { files?: { id: string }[] }
  return j.files?.[0]?.id ?? null
}

export interface RemoteFile {
  id: string | null
  /** Parsed JSON contents, or null if no file exists yet. */
  content: unknown | null
}

/** Read the planner file from the cloud (silent token). */
export async function read(): Promise<RemoteFile> {
  const token = await getToken(false)
  const id = await findFileId(token)
  if (!id) return { id: null, content: null }
  const r = await fetch(`${API}/files/${id}?alt=media`, { headers: bearer(token) })
  if (!r.ok) await fail('download', r)
  const text = await r.text()
  try {
    return { id, content: JSON.parse(text) }
  } catch {
    return { id, content: null }
  }
}

/** Write the planner file to the cloud, creating it if needed (silent token). */
export async function write(json: string, knownId?: string | null): Promise<string> {
  const token = await getToken(false)
  const id = knownId ?? (await findFileId(token))
  if (id) {
    const r = await fetch(`${UPLOAD}/files/${id}?uploadType=media&fields=id`, {
      method: 'PATCH',
      headers: { ...bearer(token), 'Content-Type': 'application/json' },
      body: json,
    })
    if (!r.ok) await fail('update', r)
    return id
  }
  const boundary = 'techo-' + Math.random().toString(36).slice(2)
  const meta = JSON.stringify({ name: FILE_NAME, parents: ['appDataFolder'] })
  const body =
    `--${boundary}\r\n` +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    meta +
    `\r\n--${boundary}\r\n` +
    'Content-Type: application/json\r\n\r\n' +
    json +
    `\r\n--${boundary}--`
  const r = await fetch(`${UPLOAD}/files?uploadType=multipart&fields=id`, {
    method: 'POST',
    headers: { ...bearer(token), 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  })
  if (!r.ok) await fail('create', r)
  const j = (await r.json()) as { id: string }
  return j.id
}

/** Delete the planner file from the cloud (silent token). No-op if absent. */
export async function remove(knownId?: string | null): Promise<void> {
  const token = await getToken(false)
  const id = knownId ?? (await findFileId(token))
  if (!id) return
  const r = await fetch(`${API}/files/${id}`, {
    method: 'DELETE',
    headers: bearer(token),
  })
  // 204 = deleted, 404 = already gone; both are fine.
  if (!r.ok && r.status !== 404) await fail('delete', r)
}
