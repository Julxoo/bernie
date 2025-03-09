"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function ProfilePage() {
  const { data: session } = useSession();
  const supabase = createClientComponentClient();
  const [profile, setProfile] = useState<{
    name: string | null;
    email: string;
    role: string;
    created_at: string;
  } | null>(null);
  const [name, setName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Récupération des informations actuelles depuis la table profiles
  useEffect(() => {
    if (session?.user?.id) {
      (async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("name, email, role, created_at")
          .eq("id", session.user.id)
          .single();
        if (error) {
          console.error("Erreur lors de la récupération du profil :", error);
        } else if (data) {
          setProfile(data);
          setName(data.name || "");
        }
      })();
    }
  }, [session, supabase]);

  // Mise à jour du nom/pseudonyme
  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ name })
        .eq("id", session?.user.id);
      if (error) throw error;
      setMessage("Nom mis à jour !");
      setProfile((prev) => (prev ? { ...prev, name } : prev));
    } catch (err) {
      console.error("Erreur lors de la mise à jour du nom :", err);
      setMessage("Erreur lors de la mise à jour du nom.");
    } finally {
      setLoading(false);
    }
  };

  // Mise à jour du mot de passe via Supabase Auth
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      setMessage("Mot de passe mis à jour !");
      setNewPassword("");
    } catch (err) {
      console.error("Erreur lors de la mise à jour du mot de passe :", err);
      setMessage("Erreur lors de la mise à jour du mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#212121] text-[#ECECEC] flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-[#171717] rounded-lg shadow-xl border border-[#424242]">
        <h2 className="text-2xl font-semibold mb-6">Mon Profil</h2>

        {/* Affichage des informations actuelles */}
        {profile && (
          <div className="mb-6 p-4 bg-[#212121] rounded border border-[#424242]">
            <p className="mb-2">
              <strong>Email :</strong> {profile.email}
            </p>
            <p className="mb-2">
              <strong>Rôle :</strong> {profile.role}
            </p>
            <p className="mb-2">
              <strong>Date d&apos;inscription :</strong>{" "}
              {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 rounded bg-green-500/10 border border-green-500 text-green-500">
            {message}
          </div>
        )}

        {/* Formulaire de mise à jour du nom/pseudonyme */}
        <form onSubmit={handleUpdateName} className="mb-8">
          <label className="block mb-2">Nom d&apos;utilisateur</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Entrez votre nom d'utilisateur..."
            className="w-full p-3 bg-[#212121] border border-[#424242] rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full p-3 bg-[#424242] text-[#ECECEC] rounded hover:bg-[#171717] transition-colors"
          >
            Mettre à jour le nom
          </button>
        </form>

        {/* Formulaire de mise à jour du mot de passe */}
        <form onSubmit={handleUpdatePassword}>
          <label className="block mb-2">Nouveau mot de passe</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Entrez votre nouveau mot de passe..."
            className="w-full p-3 bg-[#212121] border border-[#424242] rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full p-3 bg-[#424242] text-[#ECECEC] rounded hover:bg-[#171717] transition-colors"
          >
            Mettre à jour le mot de passe
          </button>
        </form>
      </div>
    </div>
  );
}
