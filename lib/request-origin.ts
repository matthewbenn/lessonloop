export const requestOrigin = (request: Request, fallback: URL) => {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? fallback.host;
  const protocol = request.headers.get("x-forwarded-proto") ?? fallback.protocol.replace(":", "");

  return `${protocol}://${host}`;
};
