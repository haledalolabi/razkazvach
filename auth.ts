import NextAuth, { type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import EmailProvider from "next-auth/providers/nodemailer";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";
import type { JWT } from "next-auth/jwt";

const emailServer = process.env.EMAIL_SERVER;
const emailFrom = process.env.EMAIL_FROM;

const providers: NextAuthConfig["providers"] = [];

if (emailServer && emailFrom) {
  providers.push(
    EmailProvider({
      server: emailServer,
      from: emailFrom,
      maxAge: 10 * 60,
    }),
  );
}

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as User).role ?? "USER";
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.role = (token as JWT).role ?? "USER";
      return session;
    },
  },
  pages: { signIn: "/auth/signin" },
  secret: process.env.AUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
