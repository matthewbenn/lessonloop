import { createHash, randomBytes } from "crypto";

export const createMagicToken = () => randomBytes(32).toString("base64url");

export const hashMagicToken = (token: string) => createHash("sha256").update(token).digest("hex");

export const daysFromNow = (days: number) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt.toISOString();
};
