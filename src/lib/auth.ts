import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getDatabase } from "@/lib/db/database";
import { UserService } from "@/lib/services/user.service";

if (process.env.NODE_ENV === "production" && !process.env.NEXTAUTH_SECRET) {
  console.error("CRITICAL: NEXTAUTH_SECRET is not set in production. Authentication will fail.");
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "2watcharr",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const db = await getDatabase();
        const userService = new UserService(db);
        const user = await userService.authenticate(
          credentials.username,
          credentials.password
        );

        if (user) {
          return {
            id: user.id,
            name: user.displayName || user.username,
            email: user.username,
            image: user.emoji,
            isAdmin: user.isAdmin,
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as { id: string; isAdmin?: boolean; image?: string | null };
        token.id = customUser.id;
        token.isAdmin = customUser.isAdmin;
        token.emoji = customUser.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        const user = session.user as { id: string; isAdmin?: unknown; emoji?: unknown; name?: string | null; email?: string | null; image?: string | null };
        user.id = token.id as string;
        user.isAdmin = token.isAdmin;
        user.emoji = token.emoji;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 15 * 24 * 60 * 60, // 15 days as requested
  },
};
