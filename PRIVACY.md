# Privacy

techo is a personal planner that runs entirely in your browser. This note
explains what data exists, where it lives, and how to delete it. Plain version:
your planner is yours, and it never goes to us.

## What we collect

Nothing. techo has no backend, no analytics, no tracking, and no accounts on
our side. The people who run techo never see your planner or receive any of
your data.

## Where your data lives

Your planner (tasks, notes, schedule, and intentions) is stored in two places,
both controlled by you:

1. **Your browser.** It's saved locally on your device (`localStorage`). It
   stays on that device and is never sent anywhere by default.
2. **Your Google Drive — only if you turn on sync.** If you connect Google
   Drive, your planner is saved as a single file in Drive's hidden
   `appDataFolder`. This is a private, app-only area of *your* Drive. techo
   cannot see any of your other Drive files, and the only permission it asks
   for is `drive.appdata`. The data lives in your Google account, not ours.

When you connect sync, Google handles the sign-in. That part is covered by
[Google's Privacy Policy](https://policies.google.com/privacy).

## How to delete your data

You're always in full control of every copy.

- **In the app:** open **Backup & data** in the header and choose
  **Delete all data**. This erases the copy in your browser and, if sync is on,
  deletes the file from your Google Drive too.
- **Revoke Google access (optional):** visit
  [your Google account permissions](https://myaccount.google.com/permissions),
  find techo, and remove it. Google then automatically deletes the hidden
  app-data file as well.
- **Manual browser clear:** clearing site data for techo in your browser also
  removes the local copy.

Because there is no server, there is nothing to request from us and no copy of
your data sitting anywhere you don't control.

## Changes

If this ever changes, it will be updated here in the repository so the history
is public.
