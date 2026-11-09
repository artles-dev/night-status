const FEED = "https://hq.mega.dev/challenges/status-for-the-night/api/incidents/2b04e228c66a";

// R-M2H: the boards pull at least this often.
const CACHE = "public, max-age=60";

async function readFeed() {
  // R-L6H: read live on every request, never a stored copy.
  const res = await fetch(FEED, { headers: { accept: "application/json" }, cf: { cacheTtl: 0 } });
  if (!res.ok) throw new Error(`ops feed answered ${res.status}`);
  const feed = await res.json();
  const incidents = [...feed.incidents].sort((a, b) => Date.parse(b.opened) - Date.parse(a.opened));
  return { updatedAt: feed.updatedAt, incidents };
}

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Dates stay ISO (YYYY-MM-DD) while R-K6L / R-M6X wait for product.
const day = (iso) => iso.slice(0, 10);
const time = (iso) => iso.slice(11, 16);

function page({ updatedAt, incidents }) {
  const rows = incidents
    .map(
      (i) => `<tr>
        <td>${esc(i.line)}</td>
        <td><time datetime="${esc(i.opened)}">${esc(day(i.opened))} ${esc(time(i.opened))}</time></td>
        <td>${i.closed ? `<time datetime="${esc(i.closed)}">${esc(day(i.closed))} ${esc(time(i.closed))}</time>` : "open"}</td>
        <td>${esc(i.what)}</td>
        <td>${esc(i.author)}</td>
      </tr>`
    )
    .join("");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>status for the night</title>
<style>
  body { margin: 0; font: 16px/1.5 system-ui, sans-serif; color: #1a1a1a; background: #fff; }
  .banner { background: #6f55c9; color: #fff; padding: 1rem 1.5rem; }
  h1 { margin: 0; font-size: 1.6rem; }
  .banner p { margin: .25rem 0 0; }
  main { padding: 1rem 1.5rem; }
  table { border-collapse: collapse; width: 100%; }
  th, td { text-align: left; padding: .4rem .6rem; border-bottom: 1px solid #ddd; }
  footer { padding: 1rem 1.5rem; color: #555; font-size: .9rem; }
</style>
</head>
<body>
<header class="banner">
  <h1>status for the night</h1>
  <p>read on every tram 3 board</p>
</header>
<main>
  <p>Updated <time datetime="${esc(updatedAt)}">${esc(day(updatedAt))} ${esc(time(updatedAt))}</time>. Data: <a href="status.json">status.json</a></p>
  <table>
    <thead><tr><th>Line</th><th>Opened</th><th>Closed</th><th>What it touched</th><th>Who ran it</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</main>
<footer>all times UTC</footer>
</body>
</html>`;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: { "access-control-allow-origin": "*", "access-control-allow-methods": "GET, HEAD, OPTIONS" },
      });
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("method not allowed", { status: 405, headers: { allow: "GET, HEAD, OPTIONS" } });
    }

    let data;
    try {
      data = await readFeed();
    } catch {
      return new Response("ops feed unavailable", { status: 502, headers: { "cache-control": "no-store" } });
    }

    if (url.pathname === "/status.json") {
      return new Response(JSON.stringify(data, null, 2), {
        headers: {
          "content-type": "application/json; charset=utf-8",
          "access-control-allow-origin": "*",
          "cache-control": CACHE,
        },
      });
    }
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(page(data), {
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": CACHE },
      });
    }
    return new Response("not found", { status: 404 });
  },
};
