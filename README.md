# techo 手帳

A simple digital planner based on Japanese _techo_ (手帳) notebooks.

**Open planner:** [connagh.github.io/techo-planner](https://connagh.github.io/techo-planner/)

## Views

- **Day:** task list, journal note, and an hourly timeline (6am to 10pm). Today's current hour is highlighted.
- **Week:** seven day cards (Sunday first) plus a "this week" focus area.
- **Month:** calendar with task previews and a monthly intentions box. Click a day to open it.

Your planner saves in the browser (`localStorage`), so it stays on your device. Use **Backup & data** in the header to download or restore a `.json` file, or to turn on optional [Google Drive sync](SYNC-SETUP.md).

## Sync across devices (optional)

By default your planner stays in this browser. You can optionally turn on
**Google Drive sync** to share it across devices. It needs no backend and no
secrets, so it fits this project's open-source, GitHub Pages setup: each person
signs in with their own Google account and their data lives in a hidden,
app-only folder in *their* Drive. Sync is last-write-wins, and a local safety
backup is kept before the cloud ever overwrites a device.

It's off until you add a public OAuth client ID. See [`SYNC-SETUP.md`](SYNC-SETUP.md)
for the one-time, ~5-minute setup.

There's a one-click **Delete all data** option in the **Backup & data** menu
that clears your browser copy and the Google Drive copy. See [`PRIVACY.md`](PRIVACY.md)
for how data is stored and deleted.

## Keyboard shortcuts

| Key       | Action                         |
| --------- | ------------------------------ |
| `←` / `→` | Previous or next day/week/month |
| `t`       | Go to today                    |
| `d`       | Day view                       |
| `w`       | Week view                      |
| `m`       | Month view                     |

Shortcuts do not run while you are typing in a field.

## Develop

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check and build for production
npm run preview  # preview the production build (uses /techo-planner/ base)
```

## Stack

- React and TypeScript (Vite)
- MUI for UI and theme
- Fonts: Inter and Newsreader (from Google Fonts)

## Deploy

Every push to `main` builds and deploys to GitHub Pages. See [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). In the repo, open **Settings**, then **Pages**, and choose **GitHub Actions** as the source.

## License

[GNU AGPL v3](LICENSE)
