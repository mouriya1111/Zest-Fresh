const STATIC_CACHE = "public, max-age=31536000, immutable";
const HTML_CACHE = "no-store";

function withHeaders(response, headers) {
  const nextHeaders = new Headers(response.headers);
  for (const [key, value] of Object.entries(headers)) {
    nextHeaders.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: nextHeaders,
  });
}

function assetPath(pathname) {
  if (pathname === "/" || pathname === "") {
    return "/index.html";
  }
  if (pathname === "/order" || pathname === "/order/") {
    return "/order/index.html";
  }
  return pathname;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = assetPath(url.pathname);
    const assetUrl = new URL(pathname, request.url);
    const response = await env.ASSETS.fetch(new Request(assetUrl, request));

    if (response.status !== 404) {
      const isHtml = pathname.endsWith(".html");
      return withHeaders(response, {
        "cache-control": isHtml ? HTML_CACHE : STATIC_CACHE,
        "x-content-type-options": "nosniff",
      });
    }

    const fallbackUrl = new URL("/index.html", request.url);
    const fallback = await env.ASSETS.fetch(new Request(fallbackUrl, request));
    return withHeaders(fallback, {
      "cache-control": HTML_CACHE,
      "x-content-type-options": "nosniff",
    });
  },
};
