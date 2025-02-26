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
  const [newTitle, setNewTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchCategoryDetails();
  }, [params.id]);

  useEffect(() => {
    if (category) {
      setNewTitle(category.title);
    }
  }, [category]);

  const fetchCategoryDetails = async () => {
    try {
      const { data: categoryData, error: categoryError } = await supabase
        .from('video_categories')
        .select('*')
        .eq('id', params.id)
        .single();

      if (categoryError) throw categoryError;

      const { data: videosData, error: videosError } = await supabase
        .from('category_videos')
        .select('*')
        .eq('category_id', params.id)
        .order('id', { ascending: true });

      if (videosError) throw videosError;

      setCategory({
        ...categoryData,
        videos: videosData || []
      });
    } catch (err) {
      console.error('Erreur lors du chargement de la catégorie:', err);
      setError('Impossible de charger les détails de la catégorie');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTitleUpdate = async () => {
    try {
      const { error } = await supabase
        .from('video_categories')
        .update({ title: newTitle })
        .eq('id', params.id);

      if (error) throw error;
      
      setCategory(prev => prev ? { ...prev, title: newTitle } : null);
      setEditingTitle(false);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du titre:', err);
      setError('Impossible de mettre à jour le titre');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready_to_publish':
        return 'bg-green-600';
      case 'pending':
        return 'bg-yellow-600';
      default:
        return 'bg-[#424242]';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready_to_publish':
        return 'Prêt à publier';
      case 'pending':
        return 'En cours';
      case 'finished':
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

  if (error || !category) {
    return (
      <div className="min-h-screen bg-[#212121] text-[#ECECEC] p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
            {error || "Catégorie non trouvée"}
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
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 text-[#ECECEC] hover:text-gray-300 transition-colors duration-200"
          >
            ← Retour
          </button>
          <h1 className="text-3xl font-semibold flex items-center gap-4">
            <span className="text-[#424242]">{category.identifier}</span>
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
                {category.title}
              </span>
            )}
          </h1>
        </div>

        {/* Liste des vidéos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            onClick={() => router.push(`/dashboard/categories/${params.id}/new-video`)}
            className="bg-[#171717] p-6 rounded-lg border-2 border-dashed border-[#424242] hover:border-[#ECECEC] transition-colors duration-200 cursor-pointer flex items-center justify-center min-h-[160px] group"
          >
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-2 border-[#424242] group-hover:border-[#ECECEC] flex items-center justify-center mx-auto mb-3 transition-colors duration-200">
                <span className="text-2xl text-[#424242] group-hover:text-[#ECECEC] transition-colors duration-200">+</span>
              </div>
              <div className="text-[#424242] group-hover:text-[#ECECEC] transition-colors duration-200">
                Ajouter une vidéo
              </div>
            </div>
          </div>

          {category.videos.map((video) => (
            <div
              key={video.id}
              onClick={() => router.push(`/dashboard/videos/${video.id}`)}
              className="bg-[#171717] p-6 rounded-lg border border-[#424242] hover:border-[#ECECEC] transition-colors duration-200 cursor-pointer"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-medium flex-1">{video.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(video.status)} ml-2`}>
                    {getStatusText(video.status)}
                  </span>
                </div>
                <div className="mt-auto">
                  <div className="text-sm text-gray-400">
                    Dernière mise à jour : {new Date(video.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {category.videos.length === 0 && !category.videos.length && (
            <div className="col-span-full text-center py-12 text-gray-400">
              Aucune vidéo dans cette catégorie
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 