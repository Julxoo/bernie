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
        email: {
          label: "Email",
          type: "text",
          placeholder: "john.doe@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error || !data.user) {
          throw new Error("Identifiants invalides");
        }

        let role = "user"; // rôle par défaut
        try {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.user.id)
            .single();
          if (!profileError && profileData?.role) {
            role = profileData.role;
          }
          console.log("[Authorize] Rôle récupéré :", role);
        } catch (e) {
          console.error("Impossible de récupérer le rôle:", e);
        }

        return { ...data.user, role };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? undefined;
        token.role = user.role ?? "user"; // Forcer une valeur par défaut si non défini
        console.log("[JWT] User:", user);
        console.log("[JWT] Token après ajout role:", token);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role ?? "user"; // Assurez-vous que role est toujours présent
        console.log("[Session] Session utilisateur:", session.user);
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
