import "server-only";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET || "a_very_long_secret_key_that_is_at_least_32_chars";
const encoder = new TextEncoder();

// Helpers for base64url encoding/decoding without standard Node.js Buffer
// to ensure complete compatibility with all Next.js runtimes (including Edge).
function base64urlEncode(str: string): string {
  return btoa(str)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return atob(base64);
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export type SessionPayload = {
  userId: string;
  email: string;
  role: string;
  exp: number;
};

/**
 * Creates a signed JWT using Web Crypto API.
 */
export async function encrypt(payload: Omit<SessionPayload, "exp"> & { exp?: number }) {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64urlEncode(JSON.stringify(header));
  
  // Set expiration time to 7 days from now if not present
  const exp = payload.exp || Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
  const fullPayload = { ...payload, exp };
  const encodedPayload = base64urlEncode(JSON.stringify(fullPayload));
  
  const tokenInput = `${encodedHeader}.${encodedPayload}`;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secretKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(tokenInput)
  );

  const encodedSignature = arrayBufferToBase64Url(signature);

  return `${tokenInput}.${encodedSignature}`;
}

/**
 * Verifies and decodes a signed JWT using Web Crypto API.
 */
export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const tokenInput = `${encodedHeader}.${encodedPayload}`;

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secretKey),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureBuffer = base64UrlToArrayBuffer(encodedSignature);

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBuffer,
      encoder.encode(tokenInput)
    );

    if (!isValid) return null;

    const payload = JSON.parse(base64urlDecode(encodedPayload)) as SessionPayload;

    // Check expiration
    if (payload.exp && Date.now() / 1000 >= payload.exp) {
      console.log("Session has expired");
      return null;
    }

    return payload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

/**
 * Creates a session cookie.
 */
export async function createSession(userId: string, email: string, role: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const exp = Math.floor(expiresAt.getTime() / 1000);
  const session = await encrypt({ userId, email, role, exp });
  
  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

/**
 * Deletes the session cookie.
 */
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

/**
 * Retrieves the current user session payload.
 */
export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;
  return decrypt(sessionCookie);
}
