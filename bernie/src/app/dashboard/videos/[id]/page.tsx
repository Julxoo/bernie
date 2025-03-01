"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  fetchVideoDetails,
  updateTitle,
  updateDescription,
  updateInstructions,
  updateLink,
  updateStatus,
} from "../../../../services/videoService";
import { Video, VIDEO_STATUS } from "../../../../types/video";
import { STATUS_STEPS } from "../../../../constants/videoConstants";
import EditableItem from "../../../../components/EditableItem";
import { StatusProgress } from "../../../../components/StatusProgress";
import { ArrowLeft, Trash2 } from "react-feather";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section = ({ title, children }: SectionProps) => (
  <section className="bg-[#171717] p-4 md:p-6 rounded-lg border border-gray-700 shadow-sm">
    <h2 className="text-lg md:text-xl font-medium mb-4">{title}</h2>
    <div className="grid gap-4">{children}</div>
  </section>
);

interface ErrorStateProps {
  error: string | null;
  onBack: () => void;
}

const ErrorState = ({ error, onBack }: ErrorStateProps) => (
  <div className="min-h-screen bg-[#212121] text-[#ECECEC] p-4">
    <div className="max-w-4xl mx-auto">
      <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-4">
        {error || "Vidéo non trouvée"}
      </div>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-[#ECECEC] hover:text-gray-300 transition-colors"
      >
        <ArrowLeft size={16} /> Retour
      </button>
    </div>
  </div>
);

export default function VideoPage({ params }: { params: { id: string } }) {
  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isStatusChanging, setIsStatusChanging] = useState<boolean>(false);
  const router = useRouter();

  // État pour la suppression
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const data = await fetchVideoDetails(params.id);
        setVideo(data);
      } catch (err: any) {
        console.error("Erreur lors du chargement de la vidéo :", err);
        setError("Impossible de charger les détails de la vidéo");
      } finally {
        setIsLoading(false);
      }
    };
    loadVideo();
  }, [params.id]);

  // Mise à jour du titre
  const handleTitleUpdate = async (newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    try {
      await updateTitle(params.id, trimmed);
      setVideo((prev) => (prev ? { ...prev, title: trimmed } : null));
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du titre :", err);
      setError("Impossible de mettre à jour le titre");
    }
  };

  // Mise à jour de la description
  const handleDescriptionUpdate = async (newDescription: string) => {
    try {
      await updateDescription(params.id, newDescription);
      setVideo((prev) =>
        prev ? { ...prev, description: newDescription } : null
      );
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour de la description :", err);
      setError("Impossible de mettre à jour la description");
    }
  };

  // Mise à jour des instructions
  const handleInstructionsUpdate = async (newInstructions: string) => {
    try {
      await updateInstructions(params.id, newInstructions);
      setVideo((prev) =>
        prev ? { ...prev, instructions_miniature: newInstructions } : null
      );
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour des instructions :", err);
      setError("Impossible de mettre à jour les instructions");
    }
  };

  // Mise à jour d'un lien (rush, vidéo montée, miniature)
  const handleLinkUpdate = async (
    newValue: string,
    dbField: "rush_link" | "video_link" | "miniature_link"
  ) => {
    try {
      await updateLink(params.id, dbField, newValue);
      setVideo((prev) => (prev ? { ...prev, [dbField]: newValue } : null));
    } catch (err: any) {
      console.error(`Erreur lors de la mise à jour du lien ${dbField} :`, err);
      setError(`Impossible de mettre à jour le lien ${dbField}`);
    }
  };

  // Mise à jour du statut sans restriction de saut, avec toast en cas d'erreur
  const handleStatusUpdate = async (
    newStatus: (typeof VIDEO_STATUS)[keyof typeof VIDEO_STATUS]
  ) => {
    if (!video) return;
    setIsStatusChanging(true);
    try {
      await updateStatus(params.id, newStatus);
      setVideo((prev) =>
        prev ? { ...prev, production_status: newStatus } : null
      );
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du statut :", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Impossible de mettre à jour le statut"
      );
    } finally {
      setIsStatusChanging(false);
    }
  };

  // Suppression de la vidéo
  const handleDeleteVideo = async () => {
    setIsDeleting(true);
    setDeleteError("");
    try {
      const response = await fetch(`/api/videos/${params.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Échec de la suppression");
      }
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Erreur lors de la suppression de la vidéo :", error);
      setDeleteError(error.message);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#212121] text-[#ECECEC] flex items-center justify-center p-4">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-48 bg-gray-700 rounded mb-4"></div>
          <div className="h-32 w-full max-w-md bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return <ErrorState error={error} onBack={() => router.back()} />;
  }

  return (
    <div className="min-h-screen bg-[#212121] text-[#ECECEC]">
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        {/* ------------------ Header (Bouton Retour + Titre en gros + Statut + Bouton Supprimer) ------------------ */}
        <header className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-[#ECECEC] hover:text-gray-300 transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft size={18} />
            <span className="ml-2">Retour</span>
          </button>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mt-4">
            <h1 className="text-2xl md:text-3xl font-semibold flex flex-wrap items-center gap-3">
              <span className="text-gray-500">#{video.id}</span>
              <EditableItem
                label=""
                value={video.title}
                placeholder="Titre de la vidéo..."
                onSave={handleTitleUpdate}
                isLink={false}
              />
            </h1>
            <div className="flex items-center gap-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold transition-opacity duration-200 ${
                  isStatusChanging ? "opacity-50" : "opacity-100"
                } ${
                  (() => {
                    switch (video.production_status) {
                      case VIDEO_STATUS.TO_DO:
                        return "bg-yellow-600";
                      case VIDEO_STATUS.IN_PROGRESS:
                        return "bg-blue-600";
                      case VIDEO_STATUS.READY_TO_PUBLISH:
                        return "bg-green-600";
                      case VIDEO_STATUS.FINISHED:
                        return "bg-purple-600";
                      default:
                        return "bg-gray-600";
                    }
                  })()
                }`}
              >
                {(() => {
                  switch (video.production_status) {
                    case VIDEO_STATUS.TO_DO:
                      return "À faire";
                    case VIDEO_STATUS.IN_PROGRESS:
                      return "En cours";
                    case VIDEO_STATUS.READY_TO_PUBLISH:
                      return "Prêt à publier";
                    case VIDEO_STATUS.FINISHED:
                      return "Terminé";
                    default:
                      return video.production_status;
                  }
                })()}
              </span>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-black/20 text-red-500 rounded-md transition-colors duration-200 text-sm"
                disabled={isDeleting}
              >
                <Trash2 size={16} />
                {isDeleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </header>

        {/* ------------------ Contenu principal ------------------ */}
        <main className="grid gap-6">
          <Section title="Contenu de la vidéo">
            <EditableItem
              label="Titre"
              value={video.title}
              placeholder="Ajouter un titre"
              onSave={handleTitleUpdate}
              copyable={true}
            />
            <EditableItem
              label="Description"
              value={video.description || ""}
              placeholder="Ajouter une description"
              onSave={handleDescriptionUpdate}
              inputType="textarea"
              copyable={true}
            />
          </Section>

          <Section title="Ressources de production">
            <EditableItem
              label="Rush brut"
              value={video.rush_link || ""}
              placeholder="Ajouter le lien des rushes"
              onSave={(newVal) => handleLinkUpdate(newVal, "rush_link")}
              isLink={true}
            />
            <EditableItem
              label="Montage final"
              value={video.video_link || ""}
              placeholder="Ajouter le lien de la vidéo montée"
              onSave={(newVal) => handleLinkUpdate(newVal, "video_link")}
              isLink={true}
            />
          </Section>

          <Section title="Miniature">
            <EditableItem
              label="Instructions"
              value={video.instructions_miniature || ""}
              placeholder="Ajouter les instructions pour la miniature"
              onSave={handleInstructionsUpdate}
              inputType="textarea"
            />
            <EditableItem
              label="Fichier miniature"
              value={video.miniature_link || ""}
              placeholder="Ajouter le lien de la miniature"
              onSave={(newVal) => handleLinkUpdate(newVal, "miniature_link")}
              isLink={true}
            />
          </Section>

          <Section title="Progression">
            <StatusProgress
              currentStatus={video.production_status}
              onStatusChange={handleStatusUpdate}
              isDisabled={isStatusChanging}
            />
          </Section>

          <Section title="Informations système">
            <div className="grid gap-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Créée le</span>
                <span>{new Date(video.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Dernière mise à jour</span>
                <span>{new Date(video.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </Section>

          {deleteError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500 text-red-500 rounded">
              {deleteError}
            </div>
          )}
        </main>
      </div>

      {/* ------------------ Modale de confirmation de suppression ------------------ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#171717] p-6 rounded-lg shadow-xl max-w-md w-full border border-gray-200 dark:border-[#424242]">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-[#ECECEC]">
              Confirmer la suppression
            </h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Êtes-vous sûr de vouloir supprimer la vidéo{" "}
              <strong>{video.title}</strong> ?
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
                onClick={handleDeleteVideo}
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
    </div>
  );
}
