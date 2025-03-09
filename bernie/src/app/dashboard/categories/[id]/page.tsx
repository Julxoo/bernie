"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Trash2, ArrowLeft, Archive, Inbox } from "react-feather";
import CreateVideoModal from "@/components/CreateVideoModal";

interface Video {
  id: number;
  title: string;
  production_status: string;
  created_at: string;
  updated_at: string;
  identifier: number;
}

interface Category {
  id: number;
  identifier: string;
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
  const [showArchived, setShowArchived] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const fetchCategoryDetails = useCallback(async () => {
    try {
      const { data: categoryData, error: categoryError } = await supabase
        .from("video_categories")
        .select("*")
        .eq("id", params.id)
        .single();
      if (categoryError) throw categoryError;
  
      const { data: videosData, error: videosError } = await supabase
        .from("category_videos")
        .select("id, identifier, title, production_status, created_at, updated_at")
        .eq("category_id", params.id)
        .order("id", { ascending: true });
      if (videosError) throw videosError;
  
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
  }, [params.id, supabase]);

  // Appel initial du chargement des données
  useEffect(() => {
    fetchCategoryDetails();
  }, [fetchCategoryDetails]);

  useEffect(() => {
    if (category) {
      setNewTitle(category.title);
    }
  }, [category]);

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

  // Séparation des vidéos actives et archivées
  const activeVideos = category.videos.filter(
    (video) => video.production_status !== "Terminé"
  );
  const archivedVideos = category.videos.filter(
    (video) => video.production_status === "Terminé"
  );
  const hasArchivedVideos = archivedVideos.length > 0;

  return (
    <div className="min-h-screen bg-[#212121] text-[#ECECEC]">
      <div className="max-w-6xl mx-auto p-8">
        {/* Barre du haut (retour + supprimer) */}
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

        {/* Titre de la catégorie (modifiable) */}
        <h1 className="text-2xl md:text-3xl font-semibold flex items-center gap-2 flex-wrap">
          <span className="break-all">{category.identifier} - </span>
          {editingTitle ? (
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 mt-2">
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
                className="bg-transparent border-b border-[#424242] focus:border-[#ECECEC] outline-none px-1 w-full sm:w-auto"
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

        {/* Liste des vidéos actives */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
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

          {/* Cartes des vidéos actives */}
          {activeVideos.map((video) => {
            const fullIdentifier = `${category.identifier}-${video.identifier}`;
            return (
              <div
                key={video.id}
                onClick={() => router.push(`/dashboard/videos/${video.id}`)}
                className="relative bg-[#171717] p-6 rounded-lg border border-[#424242] hover:border-[#ECECEC] transition-all duration-200 cursor-pointer"
              >
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${
                      video.production_status === "À monter"
                        ? "bg-yellow-600"
                        : video.production_status === "En cours"
                        ? "bg-blue-600"
                        : video.production_status === "Prêt à publier"
                        ? "bg-green-600"
                        : "bg-[#424242]"
                    }`}
                  >
                    {video.production_status}
                  </span>
                </div>
                <div className="flex flex-col h-full">
                  <h3 className="text-xl font-medium mb-2 pr-24">
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

          {activeVideos.length === 0 && category.videos.length > 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400">
              Toutes les vidéos sont archivées
            </div>
          ) : activeVideos.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400">
              Aucune vidéo dans cette catégorie
            </div>
          ) : null}
        </div>

        {/* Section des vidéos archivées (avec toggle) */}
        {hasArchivedVideos && (
          <div className="mt-12">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center gap-2 text-[#ECECEC] bg-[#2b2b2b] hover:bg-[#333] px-4 py-2 rounded-lg mb-4 transition-colors duration-200"
            >
              {showArchived ? <Inbox size={18} /> : <Archive size={18} />}
              {showArchived
                ? "Masquer les vidéos terminées"
                : `Afficher les vidéos terminées (${archivedVideos.length})`}
            </button>

            {showArchived && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {archivedVideos.map((video) => {
                  const fullIdentifier = `${category.identifier}-${video.identifier}`;
                  return (
                    <div
                      key={video.id}
                      onClick={() => router.push(`/dashboard/videos/${video.id}`)}
                      className="relative bg-[#171717] p-6 rounded-lg border border-[#333] hover:border-[#ECECEC] transition-all duration-200 cursor-pointer opacity-75 hover:opacity-100"
                    >
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold text-white bg-purple-600">
                          {video.production_status}
                        </span>
                      </div>
                      <div className="flex flex-col h-full">
                        <h3 className="text-xl font-medium mb-2 pr-24">
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
              </div>
            )}
          </div>
        )}

        {/* Modale de création de vidéo */}
        <CreateVideoModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={fetchCategoryDetails}
          categoryId={params.id}
          categoryIdentifier={category.identifier}
          categoryTitle={category.title}
        />
      </div>

      {/* Fenêtre de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-[#171717] p-6 rounded-lg shadow-xl border border-[#424242] max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4 text-[#ECECEC]">
              Confirmer la suppression
            </h2>
            <p className="text-gray-300 mb-6">
              Êtes-vous sûr de vouloir supprimer la catégorie{" "}
              <strong>{category.title}</strong> ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 transition-colors"
                disabled={isDeleting}
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteCategory}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                disabled={isDeleting}
              >
                {isDeleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
