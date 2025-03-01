"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("Résultat de signIn:", result);

      if (result?.error) {
        toast.error(result.error);
        setErrorMsg(result.error);
      } else if (result?.ok) {
        router.push("/dashboard");
      } else {
        // Cas non prévu
        toast.error("Connexion échouée");
        setErrorMsg("Connexion échouée");
      }
    } catch (error: unknown) {
      console.error("Erreur de connexion:", error);
      if (error instanceof Error) {
        toast.error(error.message);
        setErrorMsg(error.message);
      } else {
        toast.error("Une erreur inconnue est survenue lors de la connexion");
        setErrorMsg("Une erreur inconnue est survenue lors de la connexion");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#212121] text-[#ECECEC]">
      <Toaster />
      <form
        onSubmit={handleSubmit}
        className="w-96 p-8 bg-[#171717] rounded-lg shadow-xl border border-[#424242]"
      >
        <h2 className="text-2xl font-semibold mb-6">Connexion</h2>
        {errorMsg && <p className="text-red-500 mb-4">{errorMsg}</p>}
        <div className="mb-4">
          <label htmlFor="email" className="block mb-2 text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-[#212121] border border-[#424242] text-[#ECECEC]"
            required
            disabled={isLoading}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block mb-2 text-sm font-medium">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-[#212121] border border-[#424242] text-[#ECECEC]"
            required
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#424242] hover:bg-[#171717] text-[#ECECEC] py-3 px-4 rounded-lg border border-[#424242] disabled:opacity-50"
        >
          {isLoading ? "Connexion en cours..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
