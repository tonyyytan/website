// GET/POST /api/views?path=/some/page/
// GET returns the count, POST increments it. Needs a KV namespace bound as VIEWS.

const ALLOWED = new Set(["/", "/writing/", "/writing/gpu-vs-cpu/"]);

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

async function views(request, env) {
  if (!env.VIEWS) return json({ error: "counter not configured" }, 503);
  if (request.method !== "GET" && request.method !== "POST") return json({ error: "method not allowed" }, 405);

  let path = new URL(request.url).searchParams.get("path") || "/";
  if (!path.endsWith("/")) path += "/";
  if (!ALLOWED.has(path)) return json({ error: "unknown page" }, 404);

  const key = "views:" + path;
  let count = parseInt((await env.VIEWS.get(key)) || "0", 10);
  if (request.method === "POST") {
    count += 1;
    await env.VIEWS.put(key, String(count));
  }
  return json({ path, views: count });
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/views") return views(request, env);
    return env.ASSETS.fetch(request);
  },
};
