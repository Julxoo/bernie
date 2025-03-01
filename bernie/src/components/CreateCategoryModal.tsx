"use client";

import { useState, useEffect, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface CreateVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const getNextLetter = (existingIdentifiers: string[]): string => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const usedLetters = new Set(
    existingIdentifiers.map((id) => id.toUpperCase())
  );
  for (const letter of alphabet) {
    if (!usedLetters.has(letter)) {
      return letter;
    }
  }
  return "Z"; // Retourne 'Z' si tous les identifiants sont utilisés
};

export default function CreateVideoModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateVideoModalProps) {
  const [identifier, setIdentifier] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();

  const fetchNextVideoIdentifier = useCallback(async () => {
    if (isOpen) {
      try {
        const { data: categories, error } = await supabase
          .from("video_categories")
          .select("identifier");

        if (error) throw error;

        const existingIdentifiers =
          categories?.map((cat: { identifier: string }) => cat.identifier) ||
          [];
        const nextLetter = getNextLetter(existingIdentifiers);
        setIdentifier(nextLetter);
      } catch (err: unknown) {
        console.error("Erreur lors de la récupération de l'identifiant :", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Erreur inconnue lors de la récupération de l'identifiant");
        }
      }
    }
  }, [isOpen, supabase]);

  useEffect(() => {
    fetchNextVideoIdentifier();
  }, [fetchNextVideoIdentifier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("video_categories")
        .insert([{ identifier, title }]);

      if (error) throw error;

      setIdentifier("");
      setTitle("");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error("Erreur lors de la création de la vidéo :", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur inconnue lors de la création de la vidéo");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="
        fixed inset-0 bg-black bg-opacity-50 
        flex items-center justify-center z-50 
        px-4 py-4
      "
    >
      <div
        className="
          bg-[#171717] 
          p-4 sm:p-8
          rounded-lg 
          w-full max-w-md 
          border border-[#424242]
        "
      >
        <h2 className="text-2xl font-semibold mb-6 text-[#ECECEC]">
          Nouvelle vidéo
        </h2>
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 text-red-500 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="identifier"
              className="block mb-2 text-sm font-medium text-[#ECECEC]"
            >
              Identifiant
            </label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              readOnly
              disabled
              className="
                w-full p-3 rounded-lg bg-[#212121] 
                border border-[#424242] 
                text-[#ECECEC] 
                focus:outline-none focus:border-[#ECECEC] 
                cursor-not-allowed opacity-50
              "
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="title"
              className="block mb-2 text-sm font-medium text-[#ECECEC]"
            >
              Titre
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="
                w-full p-3 rounded-lg bg-[#212121] 
                border border-[#424242] 
                text-[#ECECEC] 
                focus:outline-none focus:border-[#ECECEC]
              "
              required
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="
                px-4 py-2 text-[#ECECEC] rounded-lg 
                hover:bg-[#212121] transition-colors duration-200
              "
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="
                px-4 py-2 bg-[#424242] text-[#ECECEC] rounded-lg 
                hover:bg-[#171717] transition-colors duration-200 
                border border-[#424242] disabled:opacity-50
              "
              disabled={isLoading}
            >
              {isLoading ? "Création..." : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
