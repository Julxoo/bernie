// ./src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "@/utils/supabaseClient";

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET, // Clé secrète ajoutée pour signer les tokens JWT
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "john.doe@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("❌ Erreur: Email et mot de passe requis !");
          throw new Error("Email et mot de passe requis");
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password
        });

        if (error || !data.user) {
          console.error(`❌ Erreur de connexion: ${error?.message}`);
          throw new Error("Identifiants invalides");
        }

        console.log(`✅ Utilisateur connecté: ${data.user.email}`);

        return { ...data.user };
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login"
  }
});

export { handler as GET, handler as POST };
