import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/schemas";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  useSecureCookies: process.env.NODE_ENV === "production",
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Kata sandi", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await db.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });
        if (!user || !(await compare(parsed.data.password, user.passwordHash))) {
          return null;
        }

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      if (typeof token.id === "string") {
        const currentUser = await db.user.findUnique({
          where: { id: token.id },
          select: { name: true, email: true },
        });
        if (currentUser) {
          token.name = currentUser.name;
          token.email = currentUser.email;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && typeof token.id === "string") session.user.id = token.id;
      return session;
    },
  },
});
