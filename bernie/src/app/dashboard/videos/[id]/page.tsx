"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { EditableField } from "../../../../components/EditableField";
import { StatusProgress } from "../../../../components/StatusProgress";
import { ArrowLeft } from "react-feather";

export default function VideoPage({ params }: { params: { id: string } }) {
  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStatusChanging, setIsStatusChanging] = useState(false);
  const router = useRouter();

  // États locaux pour l'édition
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newInstructions, setNewInstructions] = useState("");
  const [newRushLink, setNewRushLink] = useState("");
  const [newVideoLink, setNewVideoLink] = useState("");
  const [newMiniatureLink, setNewMiniatureLink] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingInstructions, setEditingInstructions] = useState(false);
  const [editingRushLink, setEditingRushLink] = useState(false);
  const [editingVideoLink, setEditingVideoLink] = useState(false);
  const [editingMiniatureLink, setEditingMiniatureLink] = useState(false);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const data = await fetchVideoDetails(params.id);
        setVideo(data);
      } catch (err) {
        console.error("Erreur lors du chargement de la vidéo :", err);
        setError("Impossible de charger les détails de la vidéo");
      } finally {
        setIsLoading(false);
      }
    };
    loadVideo();
  }, [params.id]);

  useEffect(() => {
    if (video) {
      setNewTitle(video.title);
      setNewDescription(video.description || "");
      setNewInstructions(video.instructions_miniature || "");
      setNewRushLink(video.rush_link || "");
      setNewVideoLink(video.video_link || "");
      setNewMiniatureLink(video.miniature_link || "");
    }
  }, [video]);

  const handleTitleUpdate = async () => {
    if (!newTitle.trim()) return;
    try {
      await updateTitle(params.id, newTitle);
      setVideo((prev) => (prev ? { ...prev, title: newTitle } : null));
      setEditingTitle(false);
    } catch (err) {
      console.error("Erreur lors de la mise à jour du titre :", err);
      setError("Impossible de mettre à jour le titre");
    }
  };

  const handleDescriptionUpdate = async () => {
    try {
      await updateDescription(params.id, newDescription);
      setVideo((prev) => (prev ? { ...prev, description: newDescription } : null));
      setEditingDescription(false);
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la description :", err);
      setError("Impossible de mettre à jour la description");
    }
  };

  const handleInstructionsUpdate = async () => {
    try {
      await updateInstructions(params.id, newInstructions);
      setVideo((prev) =>
        prev ? { ...prev, instructions_miniature: newInstructions } : null
      );
      setEditingInstructions(false);
    } catch (err) {
      console.error("Erreur lors de la mise à jour des instructions :", err);
      setError("Impossible de mettre à jour les instructions");
    }
  };

  const handleLinkUpdate = async (
    field: string,
    value: string,
    setEditing: (val: boolean) => void
  ) => {
    try {
      await updateLink(params.id, field, value);
      setVideo((prev) => (prev ? { ...prev, [field]: value } : null));
      setEditing(false);
    } catch (err) {
      console.error(`Erreur lors de la mise à jour du lien ${field} :`, err);
      setError(`Impossible de mettre à jour le lien ${field}`);
    }
  };

  const handleStatusUpdate = async (newStatus: typeof VIDEO_STATUS[keyof typeof VIDEO_STATUS]) => {
    if (!video) return;
    setIsStatusChanging(true);
    try {
      const newStatusIndex = STATUS_STEPS.findIndex((step) => step.value === newStatus);
      const currentStatusIndex = STATUS_STEPS.findIndex(
        (step) => step.value === video.production_status
      );
      if (Math.abs(newStatusIndex - currentStatusIndex) > 1) {
        throw new Error("Vous ne pouvez changer que vers le statut suivant ou précédent");
      }
      await updateStatus(params.id, newStatus);
      setVideo((prev) => (prev ? { ...prev, production_status: newStatus } : null));
    } catch (err) {
      console.error("Erreur lors de la mise à jour du statut :", err);
      setError(err instanceof Error ? err.message : "Impossible de mettre à jour le statut");
    } finally {
      setIsStatusChanging(false);
    }
  };

  const getStepStatus = (
    stepValue: typeof VIDEO_STATUS[keyof typeof VIDEO_STATUS],
    currentStatus: typeof VIDEO_STATUS[keyof typeof VIDEO_STATUS] | null
  ) => {
    if (!currentStatus) return "upcoming";
    const stepIndex = STATUS_STEPS.findIndex((step) => step.value === stepValue);
    const currentIndex = STATUS_STEPS.findIndex((step) => step.value === currentStatus);
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "upcoming";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case VIDEO_STATUS.TO_DO:
        return "bg-yellow-600";
      case VIDEO_STATUS.IN_PROGRESS:
        return "bg-blue-600";
      case VIDEO_STATUS.READY_TO_PUBLISH:
        return "bg-green-600";
      case VIDEO_STATUS.FINISHED:
        return "bg-purple-600";
      default:
        return "bg-[#424242]";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case VIDEO_STATUS.TO_DO:
        return "À faire";
      case VIDEO_STATUS.IN_PROGRESS:
        return "En cours";
      case VIDEO_STATUS.READY_TO_PUBLISH:
        return "Prêt à publier";
      case VIDEO_STATUS.FINISHED:
        return "Terminé";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#212121] text-[#ECECEC] flex items-center justify-center">
        Chargement...
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-[#212121] text-[#ECECEC] p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
            {error || "Vidéo non trouvée"}
          </div>
            <button
              onClick={() => router.back()}
              className="text-[#ECECEC] hover:text-gray-300 transition-colors duration-200 flex items-center gap-1.5"
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
        {/* En-tête avec titre et statut */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 text-[#ECECEC] hover:text-gray-300 transition-colors duration-200"
          >
            ← Retour
          </button>
          <div className="flex items-start justify-between">
            <h1 className="text-3xl font-semibold flex items-center gap-4">
              <span className="text-[#424242]">#{video.id}</span>
              {editingTitle ? (
                <EditableField
                  value={newTitle}
                  onSave={handleTitleUpdate}
                  inputType="text"
                  placeholder="Titre de la vidéo..."
                />
              ) : (
                <span onClick={() => setEditingTitle(true)} className="cursor-pointer hover:text-gray-300">
                  {video.title}
                </span>
              )}
            </h1>
            <div className={`transition-opacity duration-200 ${isStatusChanging ? "opacity-50" : "opacity-100"}`}>
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                video.production_status.toString()
              )}`}>
                {getStatusText(video.production_status.toString())}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {/* 1. Contenu de la vidéo */}
          <div className="bg-[#171717] p-6 rounded-lg border border-[#424242]">
            <h2 className="text-xl font-medium mb-4">Contenu de la vidéo</h2>
            <div className="grid gap-4">
              {/* Titre */}
              <div className="flex justify-between items-start">
                <span className="text-gray-400">Titre</span>
                {editingTitle ? (
                  <EditableField
                    value={newTitle}
                    onSave={handleTitleUpdate}
                    inputType="text"
                    placeholder="Titre de la vidéo..."
                  />
                ) : (
                  <span onClick={() => setEditingTitle(true)} className="cursor-pointer hover:text-gray-300 text-right flex-1 ml-4">
                    {video.title}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="flex justify-between items-start">
                <span className="text-gray-400">Description</span>
                {editingDescription ? (
                  <EditableField
                    value={newDescription}
                    onSave={handleDescriptionUpdate}
                    inputType="textarea"
                    placeholder="Description de la vidéo pour YouTube..."
                  />
                ) : (
                  <span onClick={() => setEditingDescription(true)} className="cursor-pointer hover:text-gray-300 text-right flex-1 ml-4">
                    {video.description || "Ajouter une description"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 2. Ressources de production */}
          <div className="bg-[#171717] p-6 rounded-lg border border-[#424242]">
            <h2 className="text-xl font-medium mb-4">Ressources de production</h2>
            <div className="grid gap-4">
              {/* Rush Link */}
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Rush brut</span>
                {editingRushLink ? (
                  <EditableField
                    value={newRushLink}
                    onSave={() => handleLinkUpdate("rush_link", newRushLink, setEditingRushLink)}
                    inputType="text"
                    placeholder="Lien vers les rushes..."
                  />
                ) : (
                  <span onClick={() => setEditingRushLink(true)} className="text-blue-400 hover:text-blue-300 cursor-pointer">
                    {video.rush_link || "Ajouter le lien des rushes"}
                  </span>
                )}
              </div>

              {/* Video Link */}
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Montage final</span>
                {editingVideoLink ? (
                  <EditableField
                    value={newVideoLink}
                    onSave={() => handleLinkUpdate("video_link", newVideoLink, setEditingVideoLink)}
                    inputType="text"
                    placeholder="Lien vers la vidéo montée..."
                  />
                ) : (
                  <span onClick={() => setEditingVideoLink(true)} className="text-blue-400 hover:text-blue-300 cursor-pointer">
                    {video.video_link || "Ajouter le lien de la vidéo montée"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 3. Miniature */}
          <div className="bg-[#171717] p-6 rounded-lg border border-[#424242]">
            <h2 className="text-xl font-medium mb-4">Miniature</h2>
            <div className="grid gap-4">
              <div className="flex justify-between items-start">
                <span className="text-gray-400">Instructions</span>
                {editingInstructions ? (
                  <EditableField
                    value={newInstructions}
                    onSave={handleInstructionsUpdate}
                    inputType="textarea"
                    placeholder="Instructions pour le graphiste..."
                  />
                ) : (
                  <span onClick={() => setEditingInstructions(true)} className="cursor-pointer hover:text-gray-300 flex-1 ml-4">
                    {video.instructions_miniature || "Ajouter les instructions pour la miniature"}
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Fichier miniature</span>
                {editingMiniatureLink ? (
                  <EditableField
                    value={newMiniatureLink}
                    onSave={() =>
                      handleLinkUpdate("miniature_link", newMiniatureLink, setEditingMiniatureLink)
                    }
                    inputType="text"
                    placeholder="Lien vers la miniature..."
                  />
                ) : (
                  <span onClick={() => setEditingMiniatureLink(true)} className="text-blue-400 hover:text-blue-300 cursor-pointer">
                    {video.miniature_link || "Ajouter le lien de la miniature"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 4. Progression */}
          <div className="bg-[#171717] p-6 rounded-lg border border-[#424242]">
            <h2 className="text-xl font-medium mb-4">Progression</h2>
            <StatusProgress
              currentStatus={video.production_status}
              onStatusChange={handleStatusUpdate}
              isDisabled={isStatusChanging}
            />
          </div>

          {/* 5. Informations système */}
          <div className="bg-[#171717] p-6 rounded-lg border border-[#424242]">
            <h2 className="text-xl font-medium mb-4">Informations système</h2>
            <div className="grid gap-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Créée le</span>
                <span>{new Date(video.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Dernière mise à jour</span>
                <span>{new Date(video.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
