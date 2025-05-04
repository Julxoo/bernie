'use client';

import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileVideo,
  Play,
  Share2,
  Star,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/layout/card';
import { Separator } from '@/components/ui/layout/separator';
import { cn } from '@/lib/utils';
import { CategoryVideo, VideoDetails, VideoCategory } from '@/types/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface VideoCompletionOverlayProps {
  video: CategoryVideo & { video_details: VideoDetails };
  category?: VideoCategory | null;
  show: boolean;
  onClose: () => void;
  returnUrl?: string;
}

export function VideoCompletionOverlay({
  video,
  category,
  show,
  onClose,
  returnUrl
}: VideoCompletionOverlayProps) {
  const [activeTab, setActiveTab] = useState<'celebration' | 'actions' | 'stats'>('celebration');
  const router = useRouter();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return formatDistanceToNow(new Date(dateString), { locale: fr, addSuffix: true });
  };

  const handleCategoryRedirect = () => {
    if (returnUrl) {
      router.push(returnUrl);
      onClose();
    } else if (category?.id) {
      router.push(`/dashboard/categories/${category.id}`);
      onClose();
    } else {
      router.push('/dashboard/videos');
      onClose();
    }
  };

  // Animation variants for the overlay
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };

  // Animation variants for the modal
  const modalVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } }
  };

  // Animation variants for the confetti
  const confettiVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: { opacity: 1, scale: 1, transition: { delay: 0.3, duration: 0.5 } }
  };

  // Generate tabs
  const tabs = [
    { id: 'celebration', label: 'Félicitations', icon: Award },
    { id: 'actions', label: 'Actions', icon: Play },
    { id: 'stats', label: 'Statistiques', icon: Star }
  ];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm m-0"
          style={{ margin: 0 }}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={overlayVariants}
          onClick={onClose}
        >
          {/* Confetti animation container (positioned absolutely) */}
          <motion.div 
            className="absolute inset-0 pointer-events-none overflow-hidden"
            variants={confettiVariants}
          >
            <div className="confetti-container">
              {Array.from({ length: 50 }).map((_, i) => (
                <div 
                  key={i}
                  className={cn(
                    "confetti",
                    `confetti-${i % 5}`,
                    `confetti-color-${i % 5}`
                  )}
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${3 + Math.random() * 4}s`
                  }}
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            className="bg-card border rounded-xl shadow-xl w-full max-w-xl mx-4 overflow-hidden"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with close button */}
            <div className="relative px-4 pt-10 pb-6 text-center bg-muted/30">
              <Button 
                variant="outline" 
                size="icon" 
                className="absolute right-2 top-2" 
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="mb-2 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h2 className="text-xl font-bold">Vidéo Upload</h2>
              <p className="text-muted-foreground mt-1 text-sm">{video.title}</p>
            </div>

            {/* Tabs navigation */}
            <div className="flex border-b">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={cn(
                    "flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors",
                    activeTab === tab.id 
                      ? "border-b-2 border-primary text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                  onClick={() => setActiveTab(tab.id as 'celebration' | 'actions' | 'stats')}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4">
              {activeTab === 'celebration' && (
                <div className="space-y-4 text-center py-3">
                  <p className="text-lg">
                    Bravo ! La vidéo a été complétée avec succès.
                  </p>
                  <div className="py-2">
                    <p className="text-muted-foreground">Catégorie</p>
                    <p className="font-medium">{category?.title}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Complétée</p>
                      <p className="text-sm font-medium">{formatDate(video.updated_at)}</p>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <Calendar className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Créée</p>
                      <p className="text-sm font-medium">{formatDate(video.created_at)}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'actions' && (
                <div className="space-y-4 py-3">
                  <div className="grid grid-cols-1 gap-2">
                    {video.video_details?.video_link && (
                      <Button className="flex items-center gap-2 w-full" variant="outline" asChild>
                        <a href={video.video_details.video_link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          Voir la vidéo
                        </a>
                      </Button>
                    )}
                    {video.video_details?.rush_link && video.video_details.rush_link.trim() !== '' && (
                      <>
                        {video.video_details.rush_link.split('\n').filter(link => link.trim() !== '').length === 1 ? (
                          <Button className="flex items-center gap-2 w-full" variant="outline" asChild>
                            <a href={video.video_details.rush_link.trim()} target="_blank" rel="noopener noreferrer">
                              <FileVideo className="h-4 w-4" />
                              Voir le rush
                            </a>
                          </Button>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button className="flex items-center gap-2 w-full" variant="outline">
                                <FileVideo className="h-4 w-4" />
                                Voir les rushs ({video.video_details.rush_link.split('\n').filter(link => link.trim() !== '').length})
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                              <DropdownMenuLabel>Liens des rushs</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {video.video_details.rush_link.split('\n').filter(link => link.trim() !== '').map((link, index) => (
                                <DropdownMenuItem key={index} asChild>
                                  <a 
                                    href={link.trim()} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <FileVideo className="h-4 w-4" />
                                    Rush #{index + 1}
                                  </a>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </>
                    )}
                    <Button className="flex items-center gap-2 w-full" variant="outline">
                      <Share2 className="h-4 w-4" />
                      Partager
                    </Button>
                    <Separator className="my-2" />
                    <Button onClick={handleCategoryRedirect}>
                      Retourner à la catégorie
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="space-y-4 py-3">
                  <div className="text-center py-2">
                  
                    <h3 className="font-medium text-lg">Objectif atteint</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cette vidéo fait partie des {Math.round(Math.random() * 20) + 10}% 
                      de vidéos Upload dans cette catégorie
                    </p>
                  </div>
                  
                  <Card className="bg-muted/20 border-dashed">
                    <div className="p-3 space-y-1">
                      <h4 className="text-sm font-medium">Détails de production</h4>
                      <div className="grid grid-cols-2 gap-y-2 text-sm">
                        <span className="text-muted-foreground">ID:</span>
                        <span>{video.id}</span>
                        <span className="text-muted-foreground">Miniature:</span>
                        <span>{video.video_details?.miniature_link ? 'Disponible' : 'Non disponible'}</span>
                        <span className="text-muted-foreground">Instructions:</span>
                        <span>{video.video_details?.instructions_miniature ? 'Disponible' : 'Non disponible'}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>

            <div className="bg-muted/30 px-4 py-3 text-center text-sm text-muted-foreground">
              <p>Vous pouvez toujours revenir à un statut précédent si nécessaire.</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 w-full"
                onClick={onClose}
              >
                Fermer
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 