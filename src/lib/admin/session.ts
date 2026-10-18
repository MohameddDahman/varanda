// Stateless admin sessions: an expiry time signed with a key derived from the server's secrets,
// kept in an httpOnly cookie. Changing ADMIN_PASSWORD or ADMIN_TOKEN signs everyone out. Uses Web
// Crypto, so the same code runs in the proxy and on the server.

export const ADMIN_COOKIE = "varanda_admin";
export const SESSION_SECONDS = 14 * 24 * 60 * 60;

const encoder = new TextEncoder();

/** Everything the dashboard needs: the database, the shared password and the server token. */
export const adminConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_CONVEX_URL && process.env.ADMIN_PASSWORD && process.env.ADMIN_TOKEN);

async function signingKey() {
  const secret = `varanda-admin:${process.env.ADMIN_TOKEN}:${process.env.ADMIN_PASSWORD}`;
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(secret));
  return crypto.subtle.importKey("raw", digest, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

const toBase64Url = (bytes: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const fromBase64Url = (text: string) => {
  const binary = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
};

export async function createSessionValue() {
  const expires = Date.now() + SESSION_SECONDS * 1000;
  const signature = await crypto.subtle.sign("HMAC", await signingKey(), encoder.encode(`v1.${expires}`));
  return `v1.${expires}.${toBase64Url(signature)}`;
}

export async function isValidSession(value: string | undefined) {
  if (!value || !adminConfigured()) return false;
  const [version, expires, signature] = value.split(".");
  if (version !== "v1" || !expires || !signature || Number(expires) < Date.now()) return false;
  try {
    // verify() compares in constant time.
    return await crypto.subtle.verify("HMAC", await signingKey(), fromBase64Url(signature), encoder.encode(`v1.${expires}`));
  } catch {
    return false;
  }
}

/** Compares a typed password with ADMIN_PASSWORD without leaking timing. */
export async function passwordMatches(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const key = await signingKey();
  // HMAC both so the comparison runs over equal-length digests, then look at every byte.
  const [a, b] = await Promise.all([input, expected].map((text) => crypto.subtle.sign("HMAC", key, encoder.encode(text))));
  const x = new Uint8Array(a);
  const y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}
