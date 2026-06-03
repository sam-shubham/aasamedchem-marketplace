import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "aasamedchem_session";
const SESSION_SECRET = process.env.SESSION_SECRET ?? "dev-secret-change-me";

function makeToken(userId: string, role: string): string {
 // Simple base64 encoded JSON token — replace with signed token in production
 return Buffer.from(JSON.stringify({ userId, role, exp: Date.now() + 86400000 })).toString("base64");
}

function parseToken(token: string): { userId: string; role: string } | null {
 try {
 const raw = Buffer.from(token, "base64").toString();
 const { userId, role, exp } = JSON.parse(raw);
 if (Date.now() > exp) return null;
 return { userId, role };
 } catch {
 return null;
 }
}

export async function login(email: string, password: string): Promise<{ id: string; name: string; email: string; role: string } | null> {
 const user = await prisma.user.findUnique({ where: { email } });
 if (!user) return null;
 const valid = await bcrypt.compare(password, user.password);
 if (!valid) return null;
 const token = makeToken(user.id, user.role);
 const c = await cookies();
 c.set(SESSION_COOKIE, token, {
 httpOnly: true,
 secure: process.env.NODE_ENV === "production",
 sameSite: "lax",
 maxAge: 86400,
 path: "/",
 });
 return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function logout(): Promise<void> {
 const c = await cookies();
 c.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<{ id: string; name: string; email: string; role: string } | null> {
 const cookieStore = await cookies();
 const token = cookieStore.get(SESSION_COOKIE)?.value;
 if (!token) return null;
 const parsed = parseToken(token);
 if (!parsed) return null;
 const user = await prisma.user.findUnique({ where: { id: parsed.userId } });
 if (!user) return null;
 return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export function requireRole(session: Awaited<ReturnType<typeof getSession>>, role: string) {
 if (!session) throw new Error("Unauthorized");
 if (session.role !== role) throw new Error("Forbidden");
}