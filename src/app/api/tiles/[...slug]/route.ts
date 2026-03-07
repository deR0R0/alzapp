const CACHE_MAX_AGE = 60 * 60 * 24;

// Map of path prefixes to their upstream host
const UPSTREAM_HOSTS: [string, string][] = [
  ["vectortiles/", "https://tiles.basemaps.cartocdn.com"],
  ["vector/", "https://tiles.basemaps.cartocdn.com"],
  ["fonts/", "https://tiles.basemaps.cartocdn.com"],
  ["gl/", "https://basemaps.cartocdn.com"],
  ["sprite", "https://basemaps.cartocdn.com"],
];

function getUpstreamUrl(slug: string): string {
  for (const [prefix, host] of UPSTREAM_HOSTS) {
    if (slug.startsWith(prefix)) return `${host}/${slug}`;
  }
  return `https://basemaps.cartocdn.com/${slug}`;
}

function rewriteCartoUrls(text: string, origin: string): string {
  // Replace all CARTO domains with absolute proxy URLs
  return text
    .replace(/https:\/\/tiles-[a-z]\.basemaps\.cartocdn\.com/g, `${origin}/api/tiles`)
    .replace(/https:\/\/tiles\.basemaps\.cartocdn\.com/g, `${origin}/api/tiles`)
    .replace(/https:\/\/basemaps\.cartocdn\.com/g, `${origin}/api/tiles`);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug: slugParts } = await params;
  const slug = slugParts.join("/");
  const { origin } = new URL(request.url);
  const targetUrl = getUpstreamUrl(slug);

  let res: Response;
  try {
    res = await fetch(targetUrl, {
      headers: { Accept: request.headers.get("Accept") ?? "*/*" },
      next: { revalidate: CACHE_MAX_AGE },
    });
  } catch (err) {
    console.error("[tile-proxy] Fetch failed:", targetUrl, err);
    return new Response("Failed to fetch tile", { status: 502 });
  }

  if (!res.ok) {
    console.error("[tile-proxy] Upstream error:", targetUrl, res.status);
    return new Response(`Upstream error: ${res.statusText}`, { status: res.status });
  }

  const contentType = res.headers.get("Content-Type") ?? "application/octet-stream";

  if (contentType.includes("application/json")) {
    const text = await res.text();
    // Use absolute URLs everywhere so MapLibre never gets a relative URL
    const rewritten = rewriteCartoUrls(text, origin);
    return new Response(rewritten, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": `public, max-age=${CACHE_MAX_AGE}`,
      },
    });
  }

  const body = await res.arrayBuffer();
  return new Response(body, {
    headers: {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": `public, max-age=${CACHE_MAX_AGE}`,
      Vary: "Accept-Encoding",
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}