const firstHeaderValue = (value: string | null) => value?.split(",")[0]?.trim() || null;

export const requestOrigin = (request: Request) => {
  const url = new URL(request.url);
  const forwardedHost = firstHeaderValue(request.headers.get("x-forwarded-host"));

  if (process.env.NODE_ENV !== "development" && forwardedHost) {
    const forwardedProtocol = firstHeaderValue(request.headers.get("x-forwarded-proto")) ?? "https";
    return `${forwardedProtocol}://${forwardedHost}`;
  }

  return url.origin;
};

export const safeNextPath = (next: string | null, fallback = "/dashboard") =>
  next?.startsWith("/") && !next.startsWith("//") ? next : fallback;
