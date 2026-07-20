export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const origin = url.origin;

  const manifest = {
    "url": origin + "/",
    "name": "StorkCrypto",
    "iconUrl": origin + "/logo.jpg"
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "access-control-allow-origin": "*",
      "cache-control": "no-store, no-cache, must-revalidate, proxy-revalidate"
    }
  });
}
