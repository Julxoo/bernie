"use client";

import { useState, useEffect, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface CreateVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoryId: string; // ID numérique de la catégorie
  categoryIdentifier: string; // Par ex. "A"
  categoryTitle: string; // Par ex. "Vidéo Grattage/Casino"
}

export default function CreateVideoModal({
  isOpen,
  onClose,
  onSuccess,
  categoryId,
  categoryIdentifier,
  categoryTitle,
}: CreateVideoModalProps) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Identifiant numérique de la vidéo (ex. 1, 2, 3...)
  const [videoIdentifier, setVideoIdentifier] = useState<number>(0);

  // Titre de la vidéo
  const [videoTitle, setVideoTitle] = useState("");

  const supabase = createClientComponentClient();

  const fetchNextVideoIdentifier = useCallback(async () => {
    try {
      setError("");

      // Récupérer le plus grand "identifier" existant dans la catégorie
      const { data, error } = await supabase
        .from("category_videos")
        .select("identifier")
        .eq("category_id", Number(categoryId))
        .order("identifier", { ascending: false })
        .limit(1);

      if (error) throw error;

      // S'il n'y a aucune vidéo, on part de 0
      const lastIdentifier = data && data.length > 0 ? data[0].identifier : 0;
      const nextIdentifier = lastIdentifier + 1;
      setVideoIdentifier(nextIdentifier);
    } catch (err: unknown) {
      console.error(
        "Erreur lors de la récupération de l'identifiant vidéo:",
        err
      );
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Erreur inconnue lors de la récupération de l'identifiant vidéo"
        );
      }
    }
  }, [supabase, categoryId]);

  useEffect(() => {
    if (isOpen) {
      fetchNextVideoIdentifier();
      setVideoTitle(""); // reset du champ titre
    }
  }, [isOpen, fetchNextVideoIdentifier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!videoTitle.trim()) {
        throw new Error("Le titre de la vidéo ne peut être vide.");
      }
      if (videoIdentifier <= 0) {
        throw new Error("L'identifiant de la vidéo est invalide.");
      }

      // Exemple de statut par défaut
      const defaultProductionStatus = "À monter";

      // 1. Insertion dans category_videos
      const { data: inserted, error: insertError } = await supabase
        .from("category_videos")
        .insert([
          {
            category_id: Number(categoryId),
            identifier: videoIdentifier, // On insère l'identifiant numérique
            title: videoTitle,
            production_status: defaultProductionStatus,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      // 2. Insertion dans video_details (optionnel, si vous l'utilisez)
      const { error: detailsError } = await supabase
        .from("video_details")
        .insert([
          {
            category_video_id: inserted.id,
            title: videoTitle,
            production_status: defaultProductionStatus,
          },
        ]);

      if (detailsError) throw detailsError;

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

  // Identifiant complet ex. "A-1"
  const fullIdentifier = `${categoryIdentifier}-${videoIdentifier}`;

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
          {/* Catégorie (en lecture seule) */}
          <div className="mb-4">
            <label
              htmlFor="categoryName"
              className="block mb-2 text-sm font-medium text-[#ECECEC]"
            >
              Catégorie
            </label>
            <input
              id="categoryName"
              type="text"
              value={categoryTitle}
              className="
                w-full p-3 rounded-lg bg-[#212121]
                border border-[#424242]
                text-[#ECECEC]
                cursor-not-allowed opacity-50
              "
              readOnly
              disabled
            />
          </div>

          {/* Identifiant complet (lecture seule, non modifiable) */}
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-[#ECECEC]">
              Identifiant complet
            </label>
            <div
              className="
                w-full p-3 rounded-lg bg-[#212121]
                border border-[#424242]
                text-[#ECECEC]
                cursor-not-allowed opacity-50
              "
            >
              {fullIdentifier}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Cet identifiant est généré automatiquement.
            </p>
          </div>

          {/* Titre de la vidéo */}
          <div className="mb-4">
            <label
              htmlFor="videoTitle"
              className="block mb-2 text-sm font-medium text-[#ECECEC]"
            >
              Titre de la vidéo
            </label>
            <input
              id="videoTitle"
              type="text"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              className="
                w-full p-3 rounded-lg bg-[#212121]
                border border-[#424242]
                text-[#ECECEC]
                focus:outline-none focus:border-[#ECECEC]
              "
              placeholder="Saisissez un titre pour la vidéo..."
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
              {isLoading ? "Ajout en cours..." : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
