// Configuration for cloud sync (Google Drive).
//
// The Google OAuth *client ID* is PUBLIC by design. It is safe to commit it
// here or to ship it in the built site, even though this repo is open source.
// There is no client secret: the app uses Google Identity Services in the
// browser-only token model, so nothing sensitive ever lives in the code.
//
// Two ways to set it (either works):
//   1. Hard-code it below, e.g. GOOGLE_CLIENT_ID = '1234-abc.apps.googleusercontent.com'
//   2. Provide it at build time via the VITE_GOOGLE_CLIENT_ID env var
//      (e.g. a GitHub Actions repository *variable*). The env var wins.
//
// If this is left blank, the app still works exactly as before (local only)
// and the Drive sync controls simply don't appear. See SYNC-SETUP.md.

const FALLBACK_CLIENT_ID = '134266198050-gn5qpveugvu18j69km0uv3ofp5nc29qq.apps.googleusercontent.com'

export const GOOGLE_CLIENT_ID: string =
  import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || FALLBACK_CLIENT_ID

export function isSyncConfigured(): boolean {
  return GOOGLE_CLIENT_ID.length > 0
}
