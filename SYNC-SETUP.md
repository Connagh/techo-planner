# Cloud sync setup

techo can sync your planner across devices using **Google Drive**. This is
optional. If you skip it, techo works exactly as before (saved in your browser),
and the sync controls simply don't appear.

## Why this is safe for an open-source, GitHub Pages app

techo has no backend. Sync runs entirely in the browser using Google Identity
Services, which means:

- **No client secret.** Only a public OAuth *client ID* is used. It is meant to
  be public, so it is fine to commit it or ship it in the built site.
- **No server you pay for or maintain.** Each user signs in with their own
  Google account, and their data lives in *their* Drive, not yours.
- **Hidden, app-scoped storage.** Data is stored in Drive's `appDataFolder`: a
  private per-user folder that only techo can read or write. It does not appear
  in the user's normal Drive and techo cannot see any of their other files. The
  only permission requested is `drive.appdata`.

The data is a single `techo-planner.json` file. Sync uses **last-write-wins**:
the most recently edited copy wins, and before this device is ever overwritten
by a newer cloud copy, the previous local state is saved to a timestamped
backup in `localStorage` (the last 3 are kept).

## One-time setup (about 5 minutes)

You do this once. Your users do nothing but click "Connect Google Drive".

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and
   create a project (or reuse one).
2. **APIs & Services → Library →** enable **Google Drive API**.
3. **APIs & Services → OAuth consent screen:**
   - User type: **External**.
   - Add an app name, your support email, and a developer email.
   - **Scopes:** add `.../auth/drive.appdata` (the "appdata" scope). This is a
     non-sensitive scope, so verification is not required for it.
   - Add yourself (and anyone else) under **Test users**, or click **Publish**
     to make it available to everyone. Publishing with only the `appdata`
     scope does not require Google's app-review process.
4. **APIs & Services → Credentials → Create credentials → OAuth client ID:**
   - Application type: **Web application**.
   - **Authorized JavaScript origins** — add the origins techo runs on:
     - `https://connagh.github.io`
     - `http://localhost:5173` (for `npm run dev`)
   - You do **not** need a redirect URI for this token flow.
   - Create it and copy the **Client ID** (looks like
     `1234567890-abc123.apps.googleusercontent.com`).
5. Give techo the client ID, either way:
   - **Easiest:** paste it into `FALLBACK_CLIENT_ID` in
     [`src/lib/syncConfig.ts`](src/lib/syncConfig.ts) and commit. It is public,
     so this is fine.
   - **Or** set a build-time env var `VITE_GOOGLE_CLIENT_ID`. For the GitHub
     Pages deploy, add it as a repository **Variable** (Settings → Secrets and
     variables → Actions → Variables) and pass it in the workflow build step:

     ```yaml
     - run: npm run build
       env:
         VITE_GOOGLE_CLIENT_ID: ${{ vars.VITE_GOOGLE_CLIENT_ID }}
     ```

That's it. Reload techo, open **Backup & data** in the header, and you'll see
**Connect Google Drive**.

## How people use it

- Click **Connect Google Drive**, pick a Google account, approve once.
- Edits sync up automatically (debounced) and the menu shows "Synced just now".
- On another device, sign in to the same Google account and connect: techo
  pulls the latest planner down.
- **Disconnect** stops syncing on that device; the local copy stays put.

## Forks

Anyone who forks techo just creates their own OAuth client ID with their own
fork's origin and drops it in. Nothing is shared between forks, and there is no
shared backend to abuse.
