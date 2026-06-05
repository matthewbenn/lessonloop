const required = (name: string) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const requiredAny = (names: string[]) => {
  const name = names.find((candidate) => process.env[candidate]);

  if (!name) {
    throw new Error(`Missing required environment variable. Set one of: ${names.join(", ")}`);
  }

  return process.env[name]!;
};

const withProtocol = (url: string) => {
  const trimmed = url.trim().replace(/\/+$/, "");
  return trimmed.startsWith("http://") || trimmed.startsWith("https://") ? trimmed : `https://${trimmed}`;
};

export const env = {
  supabaseUrl: () => required("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: () => requiredAny(["NEXT_PUBLIC_SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"]),
  supabaseServiceRoleKey: () => requiredAny(["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY"]),
  appUrl: () => {
    if (process.env.NEXT_PUBLIC_APP_URL) return withProtocol(process.env.NEXT_PUBLIC_APP_URL);
    if (process.env.NEXT_PUBLIC_SITE_URL) return withProtocol(process.env.NEXT_PUBLIC_SITE_URL);
    if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
      return withProtocol(process.env.VERCEL_PROJECT_PRODUCTION_URL);
    }
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return withProtocol(process.env.VERCEL_PROJECT_PRODUCTION_URL);
    return "http://localhost:3002";
  }
};
