"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface Video {
  id: number;
  title: string;
  status: 'pending' | 'finished' | 'ready_to_publish';
  created_at: string;
  updated_at: string;
  category_id: number;
  description?: string;
  video_url?: string;
  thumbnail_url?: string;
  instructions_miniature: string;
  rush_link: string;
  video_link: string;
  miniature_link: string;
  production_status: Status;
}

// Mettons à jour les constantes pour correspondre exactement aux valeurs de la base de données
const VIDEO_STATUS = {
  TO_DO: 'À monter',           // Valeur exacte dans la BDD
  IN_PROGRESS: 'En validation', // Valeur exacte dans la BDD
  READY_TO_PUBLISH: 'Prêt à publier',
  FINISHED: 'Terminé'
} as const;

type Status = typeof VIDEO_STATUS[keyof typeof VIDEO_STATUS];

interface StatusStep {
  value: Status;
  label: string;
  description: string;
}

const STATUS_STEPS: StatusStep[] = [
  {
    value: VIDEO_STATUS.TO_DO,
    label: 'À faire',
    description: 'La vidéo est en attente de montage'
  },
  {
    value: VIDEO_STATUS.IN_PROGRESS,
    label: 'En cours',
    description: 'Le montage est en cours'
  },
  {
    value: VIDEO_STATUS.READY_TO_PUBLISH,
    label: 'Prêt à publier',
    description: 'La vidéo est prête pour publication'
  },
  {
    value: VIDEO_STATUS.FINISHED,
    label: 'Terminé',
    description: 'La vidéo a été publiée'
  }
];

export default function VideoPage({ params }: { params: { id: string } }) {
  const [video, setVideo] = useState<Video | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingInstructions, setEditingInstructions] = useState(false);
  const [editingRushLink, setEditingRushLink] = useState(false);
  const [editingVideoLink, setEditingVideoLink] = useState(false);
  const [editingMiniatureLink, setEditingMiniatureLink] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [newRushLink, setNewRushLink] = useState('');
  const [newVideoLink, setNewVideoLink] = useState('');
  const [newMiniatureLink, setNewMiniatureLink] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStatusChanging, setIsStatusChanging] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchVideoDetails();
  }, [params.id]);

  useEffect(() => {
    if (video) {
      setNewTitle(video.title);
      setNewDescription(video.description || '');
      setNewInstructions(video.instructions_miniature || '');
      setNewRushLink(video.rush_link || '');
      setNewVideoLink(video.video_link || '');
      setNewMiniatureLink(video.miniature_link || '');
    }
  }, [video]);

  const fetchVideoDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('category_videos')
        .select(`
          *,
          video_details (
            title,
            instructions_miniature,
            rush_link,
            video_link,
            miniature_link,
            production_status
          )
        `)
        .eq('id', params.id)
        .single();

      if (error) throw error;

      setVideo({
        ...data,
        ...data.video_details[0]
      });
    } catch (err) {
      console.error('Erreur lors du chargement de la vidéo:', err);
      setError('Impossible de charger les détails de la vidéo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTitleUpdate = async () => {
    if (!newTitle.trim()) return;
    try {
      const updates = await Promise.all([
        supabase
          .from('category_videos')
          .update({ title: newTitle })
          .eq('id', params.id),
        supabase
          .from('video_details')
          .update({ title: newTitle })
          .eq('category_video_id', params.id)
      ]);

      if (updates.some(({ error }) => error)) {
        throw updates.find(({ error }) => error)?.error;
      }
      
      setVideo(prev => prev ? { ...prev, title: newTitle } : null);
      setEditingTitle(false);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du titre:', err);
      setError('Impossible de mettre à jour le titre');
    }
  };

  const handleDescriptionUpdate = async () => {
    try {
      const { error } = await supabase
        .from('video_details')
        .update({ description: newDescription })
        .eq('category_video_id', params.id);

      if (error) throw error;
      
      setVideo(prev => prev ? { ...prev, description: newDescription } : null);
      setEditingDescription(false);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la description:', err);
      setError('Impossible de mettre à jour la description');
    }
  };

  const handleInstructionsUpdate = async () => {
    try {
      const { error } = await supabase
        .from('video_details')
        .update({ instructions_miniature: newInstructions })
        .eq('category_video_id', params.id);

      if (error) throw error;
      
      setVideo(prev => prev ? { ...prev, instructions_miniature: newInstructions } : null);
      setEditingInstructions(false);
    } catch (err) {
      console.error('Erreur lors de la mise à jour des instructions:', err);
      setError('Impossible de mettre à jour les instructions');
    }
  };

  const handleLinkUpdate = async (field: string, value: string, setEditing: (value: boolean) => void) => {
    try {
      const { error } = await supabase
        .from('video_details')
        .update({ [field]: value })
        .eq('category_video_id', params.id);

      if (error) throw error;
      
      setVideo(prev => prev ? { ...prev, [field]: value } : null);
      setEditing(false);
    } catch (err) {
      console.error(`Erreur lors de la mise à jour du lien ${field}:`, err);
      setError(`Impossible de mettre à jour le lien ${field}`);
    }
  };

  const handleStatusUpdate = async (newStatus: Status) => {
    if (!video) return;
    
    setIsStatusChanging(true);
    try {
      // Récupérer l'index du nouveau statut
      const newStatusIndex = STATUS_STEPS.findIndex(step => step.value === newStatus);
      const currentStatusIndex = STATUS_STEPS.findIndex(step => step.value === video.production_status);

      // Vérifier si le changement est valide (on ne peut aller qu'au statut suivant ou précédent)
      if (Math.abs(newStatusIndex - currentStatusIndex) > 1) {
        throw new Error('Vous ne pouvez changer que vers le statut suivant ou précédent');
      }

      const updates = await Promise.all([
        supabase
          .from('category_videos')
          .update({ production_status: newStatus })
          .eq('id', params.id),
        supabase
          .from('video_details')
          .update({ production_status: newStatus })
          .eq('category_video_id', params.id)
      ]);

      if (updates.some(({ error }) => error)) {
        console.error('Erreurs de mise à jour:', updates.map(u => u.error));
        throw new Error('Erreur lors de la mise à jour du statut');
      }
      
      setVideo(prev => prev ? { ...prev, production_status: newStatus } : null);
    } catch (err) {
      console.error('Erreur détaillée lors de la mise à jour du statut:', err);
      setError(err instanceof Error ? err.message : 'Impossible de mettre à jour le statut');
    } finally {
      setIsStatusChanging(false);
    }
  };

  const getStepStatus = (stepValue: Status, currentStatus: Status | null) => {
    if (!currentStatus) return 'upcoming';
    
    const stepIndex = STATUS_STEPS.findIndex(step => step.value === stepValue);
    const currentIndex = STATUS_STEPS.findIndex(step => step.value === currentStatus);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case VIDEO_STATUS.TO_DO:
        return 'bg-yellow-600';
      case VIDEO_STATUS.IN_PROGRESS:
        return 'bg-blue-600';
      case VIDEO_STATUS.READY_TO_PUBLISH:
        return 'bg-green-600';
      case VIDEO_STATUS.FINISHED:
        return 'bg-purple-600';
      default:
        return 'bg-[#424242]';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case VIDEO_STATUS.TO_DO:
        return 'À faire';
      case VIDEO_STATUS.IN_PROGRESS:
        return 'En cours';
      case VIDEO_STATUS.READY_TO_PUBLISH:
        return 'Prêt à publier';
      case VIDEO_STATUS.FINISHED:
        return 'Terminé';
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
            className="mt-4 px-4 py-2 bg-[#424242] text-[#ECECEC] rounded-lg hover:bg-[#171717] transition-colors duration-200"
          >
            Retour
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
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="bg-transparent border-b border-[#424242] focus:border-[#ECECEC] outline-none px-1"
                    autoFocus
                  />
                  <button
                    onClick={handleTitleUpdate}
                    className="text-sm px-2 py-1 bg-[#424242] rounded"
                  >
                    Sauvegarder
                  </button>
                </div>
              ) : (
                <span onClick={() => setEditingTitle(true)} className="cursor-pointer hover:text-gray-300">
                  {video.title}
                </span>
              )}
            </h1>
            <div className={`transition-opacity duration-200 ${isStatusChanging ? 'opacity-50' : 'opacity-100'}`}>
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(video.production_status.toString())}`}>
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
                  <div className="flex items-start gap-2 flex-1 ml-4">
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="bg-transparent border border-[#424242] focus:border-[#ECECEC] outline-none p-2 rounded w-full"
                      placeholder="Titre de la vidéo..."
                      autoFocus
                    />
                    <button
                      onClick={handleTitleUpdate}
                      className="text-sm px-2 py-1 bg-[#424242] rounded h-fit"
                    >
                      Sauvegarder
                    </button>
                  </div>
                ) : (
                  <span 
                    onClick={() => setEditingTitle(true)} 
                    className="cursor-pointer hover:text-gray-300 text-right flex-1 ml-4"
                  >
                    {video.title}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="flex justify-between items-start">
                <span className="text-gray-400">Description</span>
                {editingDescription ? (
                  <div className="flex items-start gap-2 flex-1 ml-4">
                    <textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="bg-transparent border border-[#424242] focus:border-[#ECECEC] outline-none p-2 rounded w-full"
                      rows={4}
                      placeholder="Description de la vidéo pour YouTube..."
                      autoFocus
                    />
                    <button
                      onClick={handleDescriptionUpdate}
                      className="text-sm px-2 py-1 bg-[#424242] rounded h-fit"
                    >
                      Sauvegarder
                    </button>
                  </div>
                ) : (
                  <span 
                    onClick={() => setEditingDescription(true)} 
                    className="cursor-pointer hover:text-gray-300 text-right flex-1 ml-4"
                  >
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
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newRushLink}
                      onChange={(e) => setNewRushLink(e.target.value)}
                      className="bg-transparent border border-[#424242] focus:border-[#ECECEC] outline-none px-2 py-1 rounded w-96"
                      placeholder="Lien vers les rushes..."
                      autoFocus
                    />
                    <button
                      onClick={() => handleLinkUpdate('rush_link', newRushLink, setEditingRushLink)}
                      className="text-sm px-2 py-1 bg-[#424242] rounded"
                    >
                      Sauvegarder
                    </button>
                  </div>
                ) : (
                  <span 
                    onClick={() => setEditingRushLink(true)}
                    className="text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    {video.rush_link || "Ajouter le lien des rushes"}
                  </span>
                )}
              </div>

              {/* Video Link */}
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Montage final</span>
                {editingVideoLink ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newVideoLink}
                      onChange={(e) => setNewVideoLink(e.target.value)}
                      className="bg-transparent border border-[#424242] focus:border-[#ECECEC] outline-none px-2 py-1 rounded w-96"
                      placeholder="Lien vers la vidéo montée..."
                      autoFocus
                    />
                    <button
                      onClick={() => handleLinkUpdate('video_link', newVideoLink, setEditingVideoLink)}
                      className="text-sm px-2 py-1 bg-[#424242] rounded"
                    >
                      Sauvegarder
                    </button>
                  </div>
                ) : (
                  <span 
                    onClick={() => setEditingVideoLink(true)}
                    className="text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
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
                  <div className="flex items-start gap-2 flex-1 ml-4">
                    <textarea
                      value={newInstructions}
                      onChange={(e) => setNewInstructions(e.target.value)}
                      className="bg-transparent border border-[#424242] focus:border-[#ECECEC] outline-none p-2 rounded w-full"
                      rows={4}
                      placeholder="Instructions pour le graphiste..."
                      autoFocus
                    />
                    <button
                      onClick={handleInstructionsUpdate}
                      className="text-sm px-2 py-1 bg-[#424242] rounded h-fit"
                    >
                      Sauvegarder
                    </button>
                  </div>
                ) : (
                  <span 
                    onClick={() => setEditingInstructions(true)}
                    className="cursor-pointer hover:text-gray-300 flex-1 ml-4"
                  >
                    {video.instructions_miniature || "Ajouter les instructions pour la miniature"}
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Fichier miniature</span>
                {editingMiniatureLink ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newMiniatureLink}
                      onChange={(e) => setNewMiniatureLink(e.target.value)}
                      className="bg-transparent border border-[#424242] focus:border-[#ECECEC] outline-none px-2 py-1 rounded w-96"
                      placeholder="Lien vers la miniature..."
                      autoFocus
                    />
                    <button
                      onClick={() => handleLinkUpdate('miniature_link', newMiniatureLink, setEditingMiniatureLink)}
                      className="text-sm px-2 py-1 bg-[#424242] rounded"
                    >
                      Sauvegarder
                    </button>
                  </div>
                ) : (
                  <span 
                    onClick={() => setEditingMiniatureLink(true)}
                    className="text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    {video.miniature_link || "Ajouter le lien de la miniature"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 4. Progression */}
          <div className="bg-[#171717] p-6 rounded-lg border border-[#424242]">
            <h2 className="text-xl font-medium mb-4">Progression</h2>
            <div className="grid grid-cols-4 gap-4">
              {STATUS_STEPS.map((step, index) => (
                <div key={step.value} className="relative">
                  <button
                    onClick={() => handleStatusUpdate(step.value)}
                    disabled={isStatusChanging}
                    className={`
                      w-full relative p-3 rounded-lg transition-all duration-200 min-h-[100px] 
                      flex flex-col justify-between
                      ${getStepStatus(step.value, video.production_status) === 'completed' 
                        ? 'bg-green-600/20 border-green-600 text-green-500' 
                        : getStepStatus(step.value, video.production_status) === 'current'
                          ? 'bg-blue-600/20 border-blue-600 text-blue-500'
                          : 'bg-[#424242]/20 border-[#424242] text-gray-400'
                      } border hover:border-white/50
                    `}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-sm font-medium">{step.label}</span>
                      <span className={`
                        w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0
                        ${getStepStatus(step.value, video.production_status) === 'completed'
                          ? 'bg-green-600 text-white'
                          : getStepStatus(step.value, video.production_status) === 'current'
                            ? 'bg-blue-600 text-white'
                            : 'bg-[#424242] text-gray-300'
                        }
                      `}>
                        {getStepStatus(step.value, video.production_status) === 'completed' 
                          ? '✓' 
                          : index + 1}
                      </span>
                    </div>
                    <p className="text-xs opacity-75 line-clamp-2">{step.description}</p>
                  </button>
                  {index < STATUS_STEPS.length - 1 && (
                    <div className="absolute top-1/2 -right-2.5 w-5 h-[2px] transform -translate-y-1/2
                      ${getStepStatus(STATUS_STEPS[index + 1].value, video.production_status) === 'completed'
                        ? 'bg-green-600'
                        : 'bg-[#424242]'
                      }"
                    />
                  )}
                </div>
              ))}
            </div>
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