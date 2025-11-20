export const config = {
  runtime: "edge",
};

export default async function handler(request) {
  const url = new URL(request.url);
  const imgUrl = url.searchParams.get("u");

  if (!imgUrl) {
    return new Response("Missing parameter ?u=", { status: 400 });
  }

  // Validate URL
  try {
    new URL(imgUrl);
  } catch (e) {
    return new Response("Invalid URL", { status: 400 });
  }

  // Fetch ảnh nguồn
  const resp = await fetch(imgUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      Referer: "https://www.google.com/",
    },
    redirect: "follow",
  });

  const contentType = resp.headers.get("Content-Type") || "image/jpeg";

  return new Response(resp.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
