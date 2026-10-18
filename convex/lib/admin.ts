import { ConvexError, v } from "convex/values";

/**
 * Admin functions are public endpoints, so each one takes this token and checks it first. Only
 * the Next server knows it (ADMIN_TOKEN in both environments); browsers never see it, they talk
 * to the Next server, which checks the admin's session cookie before calling in.
 */
export const tokenArg = { token: v.string() };

export function assertAdmin(token: string) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) throw new ConvexError("admin-not-configured");
  if (!safeEqual(token, expected)) throw new ConvexError("unauthorized");
}

// Constant time, so the response time doesn't reveal how much of the token matched.
function safeEqual(a: string, b: string) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}
