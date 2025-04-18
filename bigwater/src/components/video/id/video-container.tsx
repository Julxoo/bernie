'use client';

import { 
  ChevronRight, 
  Calendar, 
  Clock, 
  FileVideo,  
  AlertCircle, 
  CheckCircle2, 
  Video, 
  Image as ImageIcon,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { VideoCompletionOverlay } from './video-completion-overlay';

import type { CategoryVideo, VideoDetails, VideoCategory, VideoStatus } from '@/types/api';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/layout/card';
import { Input } from '@/components/ui/inputs/input';
import { Textarea } from '@/components/ui/inputs/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/overlays/tooltip';
import { videoService } from '@/lib/services';
import { cn } from '@/lib/utils';

// Inline Edit Component
interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  className?: string;
  isTitle?: boolean;
  disabled?: boolean;
  maxLength?: number;
}

export   const InlineEdit: React.FC<InlineEditProps> = ({
  value,
  onSave,
  placeholder = 'Cliquez pour éditer...',
  multiline = false,
  rows = 4,
  className = '',
  isTitle = false,
  disabled = false,
  maxLength,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Détecter si le contenu est une URL
  const isUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = React.useCallback(async () => {
    if (currentValue !== value) {
      setIsSaving(true);
      await onSave(currentValue);
      setIsSaving(false);
    }
    setIsEditing(false);
  }, [currentValue, value, onSave, setIsEditing, setIsSaving]);

  // Gérer les clics à l'extérieur pour sauvegarder
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isEditing &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('.inline-edit-actions')
      ) {
        handleSave();
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, currentValue, handleSave]);

  // Focus sur l'input en mode édition
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      
      // Placer le curseur à la fin
      if ('selectionStart' in inputRef.current) {
        const inputElement = inputRef.current as HTMLInputElement;
        const length = inputElement.value.length;
        inputElement.selectionStart = length;
        inputElement.selectionEnd = length;
      }
    }
  }, [isEditing]);

  // Réinitialiser l'état de copie après un délai
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  // Mettre à jour l'état local quand la prop change
  useEffect(() => {
    setCurrentValue(value || '');
  }, [value]);

  const handleEdit = (e: React.MouseEvent) => {
    // Ne pas déclencher edit si clic sur le bouton copier ou le lien
    if (
      (e.target as HTMLElement).closest('.copy-button') || 
      (e.target as HTMLElement).closest('.link-button') ||
      (e.target as HTMLElement).closest('a')
    ) {
      return;
    }
    
    if (!disabled) {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setCurrentValue(value || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Sauvegarder sur Entrée (sauf pour multiline)
    if (!multiline && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    
    // Sauvegarder sur Ctrl+Entrée ou Cmd+Entrée pour multiline
    if (multiline && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
    
    // Annuler sur Escape
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  // Pour le mode édition sur mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    // Ne pas déclencher touch si touche sur le bouton copier ou le lien
    if (
      (e.target as HTMLElement).closest('.copy-button') || 
      (e.target as HTMLElement).closest('.link-button') || 
      (e.target as HTMLElement).closest('a')
    ) {
      return;
    }
    
    if (!disabled && !isEditing) {
      setIsTouched(true);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Ne pas déclencher edit si touche sur le bouton copier ou le lien
    if (
      (e.target as HTMLElement).closest('.copy-button') || 
      (e.target as HTMLElement).closest('.link-button') || 
      (e.target as HTMLElement).closest('a')
    ) {
      return;
    }
    
    if (isTouched) {
      setIsTouched(false);
      handleEdit(e as unknown as React.MouseEvent);
    }
  };

  // Fonction pour copier le contenu
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (value) {
      navigator.clipboard.writeText(value)
        .then(() => {
          setIsCopied(true);
          toast.success("Copié!", {
            description: "Le contenu a été copié dans le presse-papier."
          });
        })
        .catch(err => {
          console.error('Erreur lors de la copie:', err);
          toast.error("Erreur", {
            description: "Impossible de copier le contenu."
          });
        });
    }
  };

  // Formatter le contenu pour afficher les liens cliquables
  const formatContent = (content: string) => {
    if (isUrl(content)) {
      return (
        <a 
          href={content} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary underline hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          onClick={(e) => e.stopPropagation()}
        >
          Cliquez ici pour voir le lien
        </a>
      );
    }
    return content;
  };

  // Afficher le composant en mode édition
  if (isEditing) {
    return (
      <div className="space-y-2">
        {multiline ? (
          <Textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            className={cn(
              "w-full resize-none leading-relaxed",
              isTitle && "text-xl md:text-2xl font-medium",
              className
            )}
            disabled={isSaving}
          />
        ) : (
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={maxLength}
            className={cn(
              "w-full",
              isTitle && "text-xl md:text-2xl font-medium",
              className
            )}
            disabled={isSaving}
          />
        )}
        
        {/* Actions d'édition (optimisées pour mobile) */}
        <div className="inline-edit-actions flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="default"
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 flex-grow sm:flex-grow-0"
          >
            <Check className="h-4 w-4 mr-1" />
            <span>Enregistrer</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            className="h-8 flex-grow sm:flex-grow-0"
          >
            <X className="h-4 w-4 mr-1" />
            <span>Annuler</span>
          </Button>
          {multiline && (
            <div className="w-full mt-1 text-xs text-muted-foreground sm:w-auto sm:ml-auto sm:mt-0">
              <span className="hidden sm:inline">
                <kbd className="rounded bg-muted px-1 py-0.5">Ctrl</kbd>
                <span className="mx-1">+</span>
                <kbd className="rounded bg-muted px-1 py-0.5">Entrée</kbd>
                <span className="ml-1">pour enregistrer</span>
              </span>
              <span className="sm:hidden">Appuyez longuement pour éditer</span>
            </div>
          )}
          
          {/* Indication de longueur maximum si spécifiée */}
          {maxLength && (
            <div className="ml-auto text-xs text-muted-foreground">
              {currentValue.length}/{maxLength}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Calculer le style d'affichage
  const hasContent = value && value.trim().length > 0;
  const contentIsUrl = hasContent && isUrl(value);
  
  return (
    <div
      className={cn(
        "group relative cursor-pointer rounded transition-all",
        hasContent ? "min-h-[24px]" : "min-h-[40px] border border-dashed border-muted-foreground/30",
        (isHovered || isTouched) && "bg-muted/40",
        className
      )}
      onClick={handleEdit}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => setIsTouched(false)}
      role="button"
      tabIndex={0}
      aria-label={`Modifier ${placeholder}`}
    >
      {hasContent ? (
        <div className={cn(
          "py-1.5 px-3 whitespace-pre-wrap break-words",
          isTitle && "text-xl md:text-2xl font-medium",
          multiline && "leading-relaxed"
        )}>
          {formatContent(value)}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm py-2 px-3">
          <Edit2 className="h-3.5 w-3.5 mr-2 opacity-70" />
          <span>{placeholder}</span>
        </div>
      )}
      
      {/* Actions flottantes (copier + éditer) */}
      <div className={cn(
        "absolute right-2 top-2 flex gap-1",
        hasContent ? "opacity-0 sm:group-hover:opacity-100" : "opacity-0",
        "sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
      )}>
        {hasContent && (
          <Button
            size="sm"
            variant="ghost"
            className="copy-button h-7 w-7 p-0 rounded-full"
            onClick={handleCopy}
            aria-label="Copier le contenu"
            title="Copier le contenu"
          >
            {isCopied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <svg 
                className="h-3.5 w-3.5" 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            )}
          </Button>
        )}
        
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 rounded-full"
          aria-label="Éditer"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      
      {/* Indicateur supplémentaire pour les liens */}
      {contentIsUrl && (
        <div className="absolute top-0 left-0 bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-tl rounded-br">
          URL
        </div>
      )}
    </div>
  );
};

// Main VideoContainer Component
interface VideoContainerProps {
  video: CategoryVideo & { video_details: VideoDetails };
  category?: VideoCategory | null;
  userId?: string;
  returnUrl: string;
}

// Les statuts possibles pour une vidéo
const STATUSES = [
  { value: 'À monter', label: 'À monter', color: 'bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30', iconColor: 'text-yellow-500' },
  { value: 'En cours', label: 'En cours', color: 'bg-amber-500/20 text-amber-700 hover:bg-amber-500/30', iconColor: 'text-amber-500' },
  { value: 'Terminé', label: 'Terminé', color: 'bg-slate-500/20 text-slate-700 hover:bg-slate-500/30', iconColor: 'text-slate-500' }
];

export function VideoContainer({ 
  video, 
  category, 
  returnUrl 
}: VideoContainerProps) {
  // S'assurer que video_details existe
  const [videoWithDetails, setVideoWithDetails] = useState({
    ...video,
    video_details: video.video_details || {
      id: 0,
      category_video_id: video.id,
      title: video.title,
      description: null,
      production_status: video.production_status,
      rush_link: null,
      video_link: null,
      miniature_link: null,
      instructions_miniature: null,
      created_at: video.created_at,
      updated_at: video.updated_at
    }
  });

  const [currentStatus, setCurrentStatus] = useState<VideoStatus>(video.production_status);
  // Variables définies mais non utilisées pour le moment
  const [/* isStatusChanging */, /* setIsStatusChanging */] = useState(false);
  const [showCompletionOverlay, setShowCompletionOverlay] = useState(false);
  
  // Gestion des données vidéo
  const [videoTitle, setVideoTitle] = useState(video.title);
  const [videoDescription, setVideoDescription] = useState(video.video_details?.description || '');
  const [videoInstructions, setVideoInstructions] = useState(video.video_details?.instructions_miniature || '');
  const [videoRushLink, setVideoRushLink] = useState(video.video_details?.rush_link || '');
  const [videoMiniatureLink, setVideoMiniatureLink] = useState(video.video_details?.miniature_link || '');
  const [videoLink, setVideoLink] = useState(video.video_details?.video_link || '');
  
  // Information de statut conservée pour référence future mais non utilisée
  // const __statusInfo = STATUSES.find(s => s.value === currentStatus) || STATUSES[0];
  const currentStatusIndex = STATUSES.findIndex(s => s.value === currentStatus);
  const isFirstStatus = currentStatusIndex === 0;
  const isLastStatus = currentStatusIndex === STATUSES.length - 1;
  
  // Formater les dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // Determine status color class
  const getStatusColorClass = (status: VideoStatus) => {
    switch(status) {
      case 'À monter':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'En cours':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Terminé':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const statusColorClass = getStatusColorClass(currentStatus);

  // Get status icon
  const getStatusIcon = () => {
    switch(currentStatus) {
      case 'À monter':
        return <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />;
      case 'En cours':
        return <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />;
      case 'Terminé':
        return <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />;
      default:
        return null;
    }
  };

  const handleStatusChange = async (newStatus: VideoStatus) => {
    try {
      // Utiliser le service videoService au lieu de l'appel direct à Supabase
      await videoService.updateVideoStatus(video.id, newStatus);
      
      setCurrentStatus(newStatus);
      
      // Mettre à jour videoWithDetails
      setVideoWithDetails(prev => ({
        ...prev,
        production_status: newStatus,
        video_details: {
          ...prev.video_details,
          production_status: newStatus
        }
      }));
      
      if (newStatus === 'Terminé') {
        setShowCompletionOverlay(true);
      }
      
      toast.success("Statut mis à jour", {
        description: `Le statut a été modifié avec succès.`
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error("Erreur", {
        description: "Impossible de mettre à jour le statut de la vidéo. Veuillez réessayer ou contacter l'administrateur."
      });
    }
  };

  const handlePreviousStatus = () => {
    if (!isFirstStatus) {
      const previousStatus = STATUSES[currentStatusIndex - 1].value as VideoStatus;
      handleStatusChange(previousStatus);
    }
  };

  const handleNextStatus = () => {
    if (!isLastStatus) {
      const nextStatus = STATUSES[currentStatusIndex + 1].value as VideoStatus;
      handleStatusChange(nextStatus);
    }
  };

  // Gestionnaires de mise à jour
  const handleTitleUpdate = async (newTitle: string) => {
    try {
      await videoService.updateVideoTitle(video.id, newTitle);
      setVideoTitle(newTitle);
      // Mettre à jour videoWithDetails
      setVideoWithDetails(prev => ({
        ...prev,
        title: newTitle,
        video_details: {
          ...prev.video_details,
          title: newTitle
        }
      }));
      toast.success("Titre mis à jour", {
        description: "Le titre de la vidéo a été mis à jour avec succès."
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du titre:', error);
      toast.error("Erreur", {
        description: "Impossible de mettre à jour le titre. Veuillez réessayer."
      });
    }
  };

  const handleDescriptionUpdate = async (newDescription: string) => {
    try {
      // Mise à jour de l'état local immédiatement pour l'UX
      setVideoDescription(newDescription);
      
      // Mise à jour en base de données
      await videoService.updateVideoDescription(video.id, newDescription);
      
      // Mettre à jour videoWithDetails après succès
      setVideoWithDetails(prev => ({
        ...prev,
        video_details: {
          ...prev.video_details,
          description: newDescription
        }
      }));
      
      toast.success("Description mise à jour", {
        description: "La description de la vidéo a été mise à jour avec succès."
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la description:', error);
      // Réinitialiser à la valeur précédente en cas d'erreur
      setVideoDescription(video.video_details?.description || '');
      toast.error("Erreur", {
        description: "Impossible de mettre à jour la description. Veuillez réessayer."
      });
    }
  };

  const handleInstructionsUpdate = async (newInstructions: string) => {
    try {
      // Mise à jour de l'état local immédiatement pour l'UX
      setVideoInstructions(newInstructions);
      
      // Mise à jour en base de données
      await videoService.updateVideoInstructions(video.id, newInstructions);
      
      // Mettre à jour videoWithDetails après succès
      setVideoWithDetails(prev => ({
        ...prev,
        video_details: {
          ...prev.video_details,
          instructions_miniature: newInstructions
        }
      }));
      
      toast.success("Instructions mises à jour", {
        description: "Les instructions de miniature ont été mises à jour avec succès."
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des instructions:', error);
      // Réinitialiser à la valeur précédente en cas d'erreur
      setVideoInstructions(video.video_details?.instructions_miniature || '');
      toast.error("Erreur", {
        description: "Impossible de mettre à jour les instructions. Veuillez réessayer."
      });
    }
  };

  const handleLinkUpdate = async (linkType: 'rush_link' | 'video_link' | 'miniature_link', newLink: string) => {
    try {
      // Mise à jour de l'état local immédiatement pour l'UX
      switch (linkType) {
        case 'rush_link':
          setVideoRushLink(newLink);
          break;
        case 'video_link':
          setVideoLink(newLink);
          break;
        case 'miniature_link':
          setVideoMiniatureLink(newLink);
          break;
      }
      
      // Mise à jour en base de données
      await videoService.updateVideoLink(video.id, linkType, newLink);
      
      // Mettre à jour videoWithDetails après succès
      setVideoWithDetails(prev => ({
        ...prev,
        video_details: {
          ...prev.video_details,
          [linkType]: newLink
        }
      }));
      
      toast.success("Lien mis à jour", {
        description: "Le lien a été mis à jour avec succès."
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du lien:', error);
      
      // Réinitialiser à la valeur précédente en cas d'erreur
      switch (linkType) {
        case 'rush_link':
          setVideoRushLink(video.video_details?.rush_link || '');
          break;
        case 'video_link':
          setVideoLink(video.video_details?.video_link || '');
          break;
        case 'miniature_link':
          setVideoMiniatureLink(video.video_details?.miniature_link || '');
          break;
      }
      
      toast.error("Erreur", {
        description: "Impossible de mettre à jour le lien. Veuillez réessayer."
      });
    }
  };

  // Afficher l'overlay si la vidéo est déjà en statut "Terminé" lors de l'ouverture
  useEffect(() => {
    if (currentStatus === 'Terminé') {
      // Petite temporisation pour laisser la page se charger d'abord
      const timer = setTimeout(() => {
        setShowCompletionOverlay(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentStatus, setShowCompletionOverlay]);

  return (
    <div className="flex flex-col space-y-3 sm:space-y-6 relative isolation-auto">
      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Date de création */}
        <Card className="bg-background shadow-sm">
          <div className="p-3 sm:p-4">
            <h3 className="text-sm text-muted-foreground font-medium mb-2">Date de création</h3>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{formatDate(video.created_at)}</span>
            </div>
          </div>
        </Card>

        {/* Status actuel */}
        <Card className="bg-background shadow-sm">
          <div className="p-3 sm:p-4">
            <h3 className="text-sm text-muted-foreground font-medium mb-2">Status actuel</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0",
                  isFirstStatus && "opacity-50 cursor-not-allowed"
                )}
                onClick={handlePreviousStatus}
                disabled={isFirstStatus}
                aria-label="Status précédent"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </Button>

              <div className={cn(
                "flex-1 flex items-center justify-center gap-2 px-2 py-1 rounded-md",
                statusColorClass
              )}>
                {getStatusIcon()}
                <span className="font-medium">{currentStatus}</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0",
                  isLastStatus && "opacity-50 cursor-not-allowed"
                )}
                onClick={handleNextStatus}
                disabled={isLastStatus}
                aria-label="Status suivant"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Identifiant complet */}
        <Card className="bg-background shadow-sm">
          <div className="p-3 sm:p-4">
            <h3 className="text-sm text-muted-foreground font-medium mb-2">Identifiant complet</h3>
            <div className="flex items-center gap-2">
              <FileVideo className="h-4 w-4" />
              <span className="font-medium">
                {category?.identifier || '-'}/{video.identifier || '-'}
              </span>
            </div>
          </div>
        </Card>

        {/* IA Description - To be implemented later */}
        <Card className="bg-background shadow-sm">
          <div className="p-3 sm:p-4">
            <h3 className="text-sm text-muted-foreground font-medium mb-2">Générer une description</h3>
            <Button variant="outline" size="sm" className="w-full" disabled>
              <span>IA (Prochainement)</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* Main content grid - Responsive layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        {/* Description vidéo (7 cols on desktop, full width on mobile) */}
        <Card className="md:col-span-7 bg-background shadow-sm">
          <div className="p-3 sm:p-4 h-full flex flex-col">
            <h3 className="font-medium text-lg mb-1">Titre de la vidéo</h3>
            <div className="mb-4">
              <InlineEdit
                value={videoTitle}
                onSave={handleTitleUpdate}
                placeholder="Saisir un titre..."
                isTitle={true}
                maxLength={100}
              />
            </div>
            <h3 className="font-medium text-lg mb-3">Description de la vidéo</h3>
            <div className="text-sm flex-1 min-h-[250px] md:min-h-[400px]">
              <InlineEdit
                value={videoDescription}
                onSave={handleDescriptionUpdate}
                placeholder="Saisir une description..."
                multiline={true}
                rows={10}
                className="h-full"
              />
            </div>
          </div>
        </Card>

        {/* Right column (5 cols on desktop, full width on mobile) */}
        <div className="md:col-span-5 flex flex-col gap-4 md:gap-6">
          {/* Description miniature */}
          <Card className="bg-background shadow-sm flex-1">
            <div className="p-3 sm:p-4 h-full flex flex-col">
              <h3 className="font-medium text-lg mb-3">Description de miniature</h3>
              <div className="text-sm flex-1 min-h-[120px] md:min-h-[150px]">
                <InlineEdit
                  value={videoInstructions}
                  onSave={handleInstructionsUpdate}
                  placeholder="Saisir des instructions pour la miniature..."
                  multiline={true}
                  rows={5}
                  className="h-full"
                />
              </div>
            </div>
          </Card>

          {/* Links section */}
          <Card className="bg-background shadow-sm">
            <div className="p-3 sm:p-4">
              <h3 className="font-medium text-lg mb-3">Liens</h3>
              <div className="space-y-4">
                {/* Rush Link */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <FileVideo className="h-4 w-4 text-muted-foreground shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Lien du rush</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <span className="text-sm font-medium sm:hidden">Lien du rush</span>
                  </div>
                  
                  <div className="flex-1 flex items-center gap-2">
                    <InlineEdit
                      value={videoRushLink}
                      onSave={(newValue) => handleLinkUpdate('rush_link', newValue)}
                      placeholder="Ajouter un lien de rush..."
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>

                {/* Miniature Link */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Lien miniature</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <span className="text-sm font-medium sm:hidden">Lien miniature</span>
                  </div>

                  <div className="flex-1 flex items-center gap-2">
                    <InlineEdit
                      value={videoMiniatureLink}
                      onSave={(newValue) => handleLinkUpdate('miniature_link', newValue)}
                      placeholder="Ajouter un lien de miniature..."
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>

                {/* Video Link */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Video className="h-4 w-4 text-muted-foreground shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Lien vidéo</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <span className="text-sm font-medium sm:hidden">Lien vidéo</span>
                  </div>

                  <div className="flex-1 flex items-center gap-2">
                    <InlineEdit
                      value={videoLink}
                      onSave={(newValue) => handleLinkUpdate('video_link', newValue)}
                      placeholder="Ajouter un lien vidéo..."
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* VideoCompletionOverlay Modal */}
      {showCompletionOverlay && (
        <VideoCompletionOverlay 
          video={videoWithDetails} 
          category={category}
          show={showCompletionOverlay} 
          onClose={() => setShowCompletionOverlay(false)}
          returnUrl={returnUrl}
        />
      )}
    </div>
  );
}
