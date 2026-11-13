export async function onRequest({ request, next }) {
  const response = await next();
  const url = new URL(request.url);
  const headers = new Headers(response.headers);
  const isBrandDomain = url.hostname === "mecopay.space" || url.hostname === "www.mecopay.space";

  if (isBrandDomain) {
    // Only the actual checkout and pay routes may be embedded.
    // Keep this aligned with the React routes in src/App.tsx.
    const isPaymentRoute = /^\/(?:checkout|pay)(?:\/[^/]+)?\/?$/.test(url.pathname);

    if (isPaymentRoute) {
      headers.delete("X-Frame-Options");
      headers.set("Content-Security-Policy", "frame-ancestors *");
    } else {
      headers.set("X-Frame-Options", "DENY");
      headers.set("Content-Security-Policy", "frame-ancestors 'none'");
    }
  }

  if (url.hostname === "mecopay.pages.dev") {
    headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
