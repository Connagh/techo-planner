# techo 手帳

A simple digital planner based on Japanese _techo_ (手帳) notebooks.

**Open planner:** [connagh.github.io/techo-planner](https://connagh.github.io/techo-planner/)

## Views

- **Day:** task list, journal note, and an hourly timeline (6am to 10pm). Today's current hour is highlighted.
- **Week:** seven day cards (Sunday first) plus a "this week" focus area.
- **Month:** calendar with task previews and a monthly intentions box. Click a day to open it.

Your planner saves in the browser (`localStorage`). It stays on your device. Use **Backup & data** in the header to download or restore a `.json` file.

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
