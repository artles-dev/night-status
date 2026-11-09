# night-status

This is the public status page for the night. It is a Cloudflare Worker that reads the ops feed live on every request.

- `/`: the page.
- `/status.json`: `{ updatedAt, incidents }`, with the same data as the page.

## Built from

| Tag | Requirement | Source |
| --- | --- | --- |
| R-R9M | Newest incident at the top | spec.pdf p1 |
| R-Z8H | `status.json` sends `Access-Control-Allow-Origin: *` | memo.m4a 0:06 |
| R-H2K | `updatedAt` in UTC, ends in `Z` | memo.m4a 0:19 |
| R-Z5K | Heading reads exactly "status for the night" | memo.m4a 0:27 |
| R-M2H | `Cache-Control: max-age` 60 or less | memo.m4a 0:34 |
| R-X3M | Every line gets its own row, tram 3 included | recording.mp4 0:07 |
| R-L6Z | Footer: all times UTC | recording.mp4 0:15 (on screen) |
| R-M6Z | Violet banner, exactly `#6f55c9` | screenshot.png |
| R-L6H | `updatedAt` is the ops feed's, read live, never a copy | whiteboard.jpg |
| R-H6M | Page says "read on every tram 3 board" | tram 3 board |
| R-L3R | Keep the whole week; older rows stay (product chose this over R-L8Z) | whiteboard.jpg |

Still open with product: date order (R-K6L day first vs R-M6X month first), so dates show as ISO `YYYY-MM-DD`; and the author of record 3715 (R-X9Z), so the page shows what the feed says.

## Deploy

```sh
npx wrangler deploy
```
