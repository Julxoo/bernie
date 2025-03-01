"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Trash2, ArrowLeft } from "react-feather";
import CreateVideoModal from "@/components/CreateVideoModal";

interface Video {
  id: number;
  title: string;
  production_status: string; // Ex. "À monter", "En cours", "Prêt à publier", "Terminé"
  created_at: string;
  updated_at: string;
  identifier: number; // Identifiant numérique de la vidéo
}

interface Category {
  id: number;
  identifier: string; // Par ex. "A"
  title: string;
  videos: Video[];
}

export default function CategoryPage({ params }: { params: { id: string } }) {
  const [category, setCategory] = useState<Category | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchCategoryDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  useEffect(() => {
    if (category) {
      setNewTitle(category.title);
    }
  }, [category]);

  const fetchCategoryDetails = async () => {
    try {
      // 1. Récupérer la catégorie
      const { data: categoryData, error: categoryError } = await supabase
        .from("video_categories")
        .select("*")
        .eq("id", params.id)
        .single();
      if (categoryError) throw categoryError;

      // 2. Récupérer les vidéos associées à la catégorie
      const { data: videosData, error: videosError } = await supabase
        .from("category_videos")
        .select("id, identifier, title, production_status, created_at, updated_at")
        .eq("category_id", params.id)
        .order("id", { ascending: true });
      if (videosError) throw videosError;

      // 3. Mettre à jour le state local
      setCategory({
        ...categoryData,
        videos: videosData || [],
      });
    } catch (err) {
      console.error("Erreur lors du chargement de la catégorie:", err);
      setError("Impossible de charger les détails de la catégorie");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTitleUpdate = async () => {
    try {
      const { error } = await supabase
        .from("video_categories")
        .update({ title: newTitle })
        .eq("id", params.id);
      if (error) throw error;

      setCategory((prev) => (prev ? { ...prev, title: newTitle } : null));
      setEditingTitle(false);
    } catch (err) {
      console.error("Erreur lors de la mise à jour du titre:", err);
      setError("Impossible de mettre à jour le titre");
    }
  };

  const handleDeleteCategory = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/categories/${params.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Échec de la suppression");
      }
      router.push("/dashboard");
    } catch (err) {
      console.error("Erreur lors de la suppression de la catégorie:", err);
      setError("Impossible de supprimer la catégorie");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Fonctions pour l'affichage du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case "À monter":
        return "bg-yellow-600";
      case "En cours":
        return "bg-blue-600";
      case "Prêt à publier":
        return "bg-green-600";
      case "Terminé":
        return "bg-purple-600";
      default:
        return "bg-[#424242]";
    }
  };

  const getStatusText = (status: string) => {
    return status;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#212121] text-[#ECECEC] flex items-center justify-center">
        Chargement...
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-[#212121] text-[#ECECEC] p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
            {error || "Catégorie non trouvée"}
          </div>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-[#424242] text-[#ECECEC] rounded-lg hover:bg-[#171717] transition-colors duration-200 flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#212121] text-[#ECECEC]">
      <div className="max-w-6xl mx-auto p-8">
        {/* En-tête de la catégorie */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => router.back()}
              className="text-[#ECECEC] hover:text-gray-300 transition-colors duration-200 flex items-center gap-1.5"
            >
              <ArrowLeft size={16} /> Retour
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-black/20 text-red-500 rounded-md transition-colors duration-200 text-sm"
              disabled={isDeleting}
            >
              <Trash2 size={16} />
              {isDeleting ? "Suppression..." : "Supprimer"}
            </button>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold flex items-center gap-2 md:gap-4 flex-wrap w-full">
            <span className="break-all">{category.identifier}</span>
            {editingTitle ? (
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleTitleUpdate();
                    }
                  }}
                  className="bg-transparent border-b border-[#424242] focus:border-[#ECECEC] outline-none px-1 w-full sm:w-auto min-w-0"
                  autoFocus
                />
                <button
                  onClick={handleTitleUpdate}
                  className="text-sm px-2 py-1 bg-[#424242] rounded flex items-center gap-1 whitespace-nowrap mt-2 sm:mt-0"
                >
                  Sauvegarder
                </button>
              </div>
            ) : (
              <span
                onClick={() => setEditingTitle(true)}
                className="cursor-pointer hover:text-gray-300 break-all"
              >
                {category.title}
              </span>
            )}
          </h1>
        </div>

        {/* Modale de confirmation de suppression */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#171717] p-6 rounded-lg shadow-xl max-w-md w-full border border-gray-200 dark:border-[#424242]">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-[#ECECEC]">
                Confirmer la suppression
              </h2>
              <p className="mb-6 text-gray-700 dark:text-gray-300">
                Êtes-vous sûr de vouloir supprimer la catégorie{" "}
                <strong>{category.title}</strong> ?{" "}
                {category.videos.length > 0 && (
                  <span className="block mt-2 text-red-500 dark:text-red-400">
                    Cette catégorie contient {category.videos.length} vidéo
                    {category.videos.length > 1 ? "s" : ""} qui ne sera/seront
                    plus associée(s) à aucune catégorie.
                  </span>
                )}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-[#424242] dark:hover:bg-[#535353] text-gray-800 dark:text-[#ECECEC] rounded-md transition-colors duration-200 text-sm"
                  disabled={isDeleting}
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteCategory}
                  className="px-3 py-1.5 flex items-center gap-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-md transition-colors duration-200 text-sm"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Suppression...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Confirmer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liste des vidéos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Carte spéciale pour ajouter une nouvelle vidéo */}
          <div
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#171717] p-6 rounded-lg border-2 border-dashed border-[#424242] hover:border-[#ECECEC] transition-colors duration-200 cursor-pointer flex items-center justify-center min-h-[160px] group"
          >
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-2 border-[#424242] group-hover:border-[#ECECEC] flex items-center justify-center mx-auto mb-3 transition-colors duration-200">
                <span className="text-2xl text-[#424242] group-hover:text-[#ECECEC] transition-colors duration-200">
                  +
                </span>
              </div>
              <div className="text-[#424242] group-hover:text-[#ECECEC] transition-colors duration-200">
                Ajouter une vidéo
              </div>
            </div>
          </div>

          {/* Cartes des vidéos existantes */}
          {category.videos.map((video) => {
            // Construire l'identifiant complet : ex. "A-2"
            const fullIdentifier = `${category.identifier}-${video.identifier}`;
            return (
              <div
                key={video.id}
                onClick={() => router.push(`/dashboard/videos/${video.id}`)}
                className="relative bg-[#171717] p-6 rounded-lg border border-[#424242] hover:border-[#ECECEC] transition-colors duration-200 cursor-pointer"
              >
                {/* Badge du statut */}
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(
                      video.production_status
                    )}`}
                  >
                    {getStatusText(video.production_status)}
                  </span>
                </div>
                <div className="flex flex-col h-full">
                  <h3 className="text-xl font-medium mb-2">
                    {fullIdentifier} {video.title}
                  </h3>
                  <div className="mt-auto text-sm text-gray-400">
                    Dernière mise à jour :{" "}
                    {new Date(video.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}

          {category.videos.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              Aucune vidéo dans cette catégorie
            </div>
          )}
        </div>

        {/* Modale de création d'une nouvelle vidéo */}
        <CreateVideoModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={fetchCategoryDetails}
          categoryId={params.id}
          categoryIdentifier={category.identifier} // Pour générer l'identifiant complet, ex. "A-1"
          categoryTitle={category.title} // Pour afficher le nom complet de la catégorie
        />
      </div>
    </div>
  );
}
