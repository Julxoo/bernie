"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface CreateVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoryId: string;
  categoryIdentifier: string; // Exemple : "A"
}

export default function CreateVideoModal({
  isOpen,
  onClose,
  onSuccess,
  categoryId,
  categoryIdentifier,
}: CreateVideoModalProps) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const supabase = createClientComponentClient();

  // Statut de production par défaut (à adapter si besoin)
  const defaultProductionStatus = "À monter";

  // Au moment d'ouverture du modal, on récupère le nombre de vidéos existantes
  // pour générer le titre par défaut.
  useEffect(() => {
    if (isOpen) {
      const fetchCountAndSetTitle = async () => {
        try {
          const { count, error: countError } = await supabase
            .from("category_videos")
            .select("*", { count: "exact", head: true })
            .eq("category_id", Number(categoryId));

          if (countError) throw countError;

          const videoNumber = (count || 0) + 1;
          const generatedTitle = `${categoryIdentifier}-${videoNumber}`;
          setTitle(generatedTitle);
        } catch (err: any) {
          console.error("Erreur lors du comptage des vidéos:", err);
          setError(err.message);
        }
      };

      fetchCountAndSetTitle();
    }
  }, [isOpen, categoryId, categoryIdentifier, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const finalTitle = title.trim();
      if (!finalTitle) {
        throw new Error("Le titre ne peut être vide");
      }

      // Insertion dans la table category_videos
      const { data: categoryVideoData, error: categoryVideoError } = await supabase
        .from("category_videos")
        .insert([
          {
            category_id: Number(categoryId),
            title: finalTitle,
            production_status: defaultProductionStatus,
          },
        ])
        .select()
        .single();

      if (categoryVideoError) throw categoryVideoError;

      // Insertion dans la table video_details avec l'ID généré
      const { data: videoDetailsData, error: videoDetailsError } = await supabase
        .from("video_details")
        .insert([
          {
            category_video_id: categoryVideoData.id,
            title: finalTitle,
            production_status: defaultProductionStatus,
          },
        ])
        .select()
        .single();

      if (videoDetailsError) throw videoDetailsError;

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Erreur lors de l'ajout de la vidéo :", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-[#171717] p-8 rounded-lg w-full max-w-md border border-[#424242]">
        <h2 className="text-2xl font-semibold mb-6 text-[#ECECEC]">Nouvelle vidéo</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 text-red-500 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="category"
              className="block mb-2 text-sm font-medium text-[#ECECEC]"
            >
              Catégorie
            </label>
            <input
              id="category"
              type="text"
              value={categoryIdentifier}
              className="w-full p-3 rounded-lg bg-[#212121] border border-[#424242] text-[#ECECEC] focus:outline-none focus:border-[#ECECEC] cursor-not-allowed opacity-50"
              readOnly
              disabled
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block mb-2 text-sm font-medium text-[#ECECEC]"
            >
              Titre de la vidéo
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#212121] border border-[#424242] text-[#ECECEC] focus:outline-none focus:border-[#ECECEC]"
              placeholder="Titre de la vidéo..."
              required
              disabled={isLoading}
            />
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Vous pouvez modifier le titre si nécessaire. Par défaut, il est généré au format {categoryIdentifier}-X.
          </p>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#ECECEC] rounded-lg hover:bg-[#212121] transition-colors duration-200"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#424242] text-[#ECECEC] rounded-lg hover:bg-[#171717] transition-colors duration-200 border border-[#424242] disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Ajout en cours..." : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
