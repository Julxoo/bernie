"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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

interface Comment {
  id: number;
  comment: string;
  created_at: string;
}

export default function VideoPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isStatusChanging, setIsStatusChanging] = useState<boolean>(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(true);
  const [errorComments, setErrorComments] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const data = await fetchVideoDetails(params.id);
        setVideo(data);
      } catch (err: unknown) {
        console.error("Erreur lors du chargement de la vidéo :", err);
        setError(
          err instanceof Error
            ? "Impossible de charger les détails de la vidéo"
            : "Erreur inconnue lors du chargement de la vidéo"
        );
      } finally {
        setIsLoading(false);
      }
    };
    loadVideo();
  }, [params.id]);

  const handleTitleUpdate = async (newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    try {
      if (!session?.user?.id) throw new Error("Utilisateur non authentifié");
      await updateTitle(session.user.id, params.id, trimmed);
      setVideo((prev) => (prev ? { ...prev, title: trimmed } : null));
    } catch (err: unknown) {
      console.error("Erreur lors de la mise à jour du titre :", err);
      setError(
        err instanceof Error
          ? "Impossible de mettre à jour le titre"
          : "Erreur inconnue lors de la mise à jour du titre"
      );
    }
  };

  const handleDescriptionUpdate = async (newDescription: string) => {
    try {
      await updateDescription(params.id, newDescription);
      setVideo((prev) =>
        prev ? { ...prev, description: newDescription } : null
      );
    } catch (err: unknown) {
      console.error("Erreur lors de la mise à jour de la description :", err);
      setError(
        err instanceof Error
          ? "Impossible de mettre à jour la description"
          : "Erreur inconnue lors de la mise à jour de la description"
      );
    }
  };

  const handleInstructionsUpdate = async (newInstructions: string) => {
    try {
      await updateInstructions(params.id, newInstructions);
      setVideo((prev) =>
        prev ? { ...prev, instructions_miniature: newInstructions } : null
      );
    } catch (err: unknown) {
      console.error("Erreur lors de la mise à jour des instructions :", err);
      setError(
        err instanceof Error
          ? "Impossible de mettre à jour les instructions"
          : "Erreur inconnue lors de la mise à jour des instructions"
      );
    }
  };

  const handleLinkUpdate = async (
    newValue: string,
    dbField: "rush_link" | "video_link" | "miniature_link"
  ) => {
    try {
      await updateLink(params.id, dbField, newValue);
      setVideo((prev) => (prev ? { ...prev, [dbField]: newValue } : null));
    } catch (err: unknown) {
      console.error(`Erreur lors de la mise à jour du lien ${dbField} :`, err);
      setError(
        err instanceof Error
          ? `Impossible de mettre à jour le lien ${dbField}`
          : "Erreur inconnue lors de la mise à jour du lien"
      );
    }
  };

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
    } catch (err: unknown) {
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

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/videos/${params.id}/comments`);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des commentaires");
      }
      const data = (await response.json()) as Comment[];
      setComments(data);
    } catch (err: unknown) {
      console.error("Erreur lors du chargement des commentaires", err);
      setErrorComments(
        err instanceof Error
          ? "Impossible de charger les commentaires"
          : "Erreur inconnue lors du chargement des commentaires"
      );
    } finally {
      setLoadingComments(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (video) {
      fetchComments();
    }
  }, [video, fetchComments]);

  const postComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const response = await fetch(`/api/videos/${params.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: newComment }),
      });
      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi du commentaire");
      }
      setNewComment("");
      fetchComments();
    } catch (err: unknown) {
      console.error("Erreur lors de l'ajout du commentaire", err);
      alert("Impossible d'ajouter le commentaire");
    }
  };

  const handleDeleteVideo = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/videos/${params.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Échec de la suppression");
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Erreur lors de la suppression de la vidéo :", err);
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de supprimer la vidéo"
      );
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
              <span>{video.fullIdentifier}</span>
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
                } ${(() => {
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
                })()}`}
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
              >
                <Trash2 size={16} />
                Supprimer
              </button>
            </div>
          </div>
        </header>

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
              onSave={(newVal: string) => handleLinkUpdate(newVal, "rush_link")}
              isLink={true}
            />
            <EditableItem
              label="Montage final"
              value={video.video_link || ""}
              placeholder="Ajouter le lien de la vidéo montée"
              onSave={(newVal: string) => handleLinkUpdate(newVal, "video_link")}
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
              onSave={(newVal: string) => handleLinkUpdate(newVal, "miniature_link")}
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

          <section className="bg-[#171717] p-4 md:p-6 rounded-lg border border-gray-700 shadow-sm mt-6">
            <h2 className="text-lg md:text-xl font-medium mb-4">
              Commentaires internes
            </h2>
            <form onSubmit={postComment} className="mb-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ajouter un commentaire..."
                className="w-full p-2 bg-[#212121] border border-[#424242] rounded-lg text-[#ECECEC] focus:outline-none"
                rows={3}
              />
              <button
                type="submit"
                className="mt-2 px-4 py-2 bg-[#424242] text-[#ECECEC] rounded-lg hover:bg-[#171717] transition-colors duration-200"
              >
                Ajouter
              </button>
            </form>
            {loadingComments ? (
              <div>Chargement des commentaires...</div>
            ) : errorComments ? (
              <div className="text-red-500">{errorComments}</div>
            ) : comments.length === 0 ? (
              <div>Aucun commentaire pour le moment.</div>
            ) : (
              <ul className="space-y-3">
                {comments.map((c: Comment) => (
                  <li key={c.id} className="p-3 bg-[#212121] rounded-lg">
                    <p className="text-sm">{c.comment}</p>
                    <span className="text-xs text-gray-400">
                      {new Date(c.created_at).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#171717] p-6 rounded-lg shadow-xl border border-[#424242] max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4 text-[#ECECEC]">
              Confirmer la suppression
            </h2>
            <p className="mb-6 text-gray-300">
              Êtes-vous sûr de vouloir supprimer la vidéo{" "}
              <strong>{video.title}</strong> ?
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
                onClick={handleDeleteVideo}
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
