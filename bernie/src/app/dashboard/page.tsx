"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import CreateCategoryModal from "@/components/CreateCategoryModal";

interface Category {
  id: number;
  identifier: string;
  title: string;
  pending_count: number;
  finished_count: number;
  ready_to_publish_count: number;
}

export default function DashboardPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('video_categories')
        .select('*');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', err);
      setError('Impossible de charger les catégories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#212121] text-[#ECECEC] flex items-center justify-center">
        Chargement...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#212121] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#171717] min-h-screen flex flex-col border-r border-[#424242]">
        <div className="p-6">
          <h1 className="text-xl font-semibold text-[#ECECEC]">Dashboard</h1>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <a href="/dashboard" className="text-[#ECECEC] hover:text-gray-300 block py-2">
                Catégories
              </a>
            </li>
            {/* Autres liens de navigation si nécessaire */}
          </ul>
        </nav>

        <div className="p-4 border-t border-[#424242]">
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-sm bg-[#424242] hover:bg-[#171717] rounded-lg transition-colors duration-200 border border-[#424242] text-[#ECECEC]"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Contenu Principal */}
      <main className="flex-1 p-8 text-[#ECECEC] overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold">
              Catégories de vidéos
            </h1>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Carte "Ajouter une catégorie" en premier */}
            <div
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#171717] p-6 rounded-lg border border-dashed border-[#424242] hover:border-[#ECECEC] transition-colors duration-200 cursor-pointer flex flex-col items-center justify-center"
            >
              <div className="w-12 h-12 bg-[#424242] rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">+</span>
              </div>
              <p className="text-center text-gray-400">Créer une nouvelle catégorie</p>
            </div>

            {/* Liste des catégories existantes */}
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => router.push(`/dashboard/categories/${category.id}`)}
                className="bg-[#171717] p-6 rounded-lg border border-[#424242] hover:border-[#ECECEC] transition-colors duration-200 cursor-pointer"
              >
                <div className="flex items-center mb-4">
                  <span className="text-xl font-medium text-[#424242]">{category.identifier}</span>
                  <span className="mx-2 text-xl font-medium text-[#424242]">|</span>
                  <h3 className="text-xl font-medium">{category.title}</h3>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{category.pending_count} en cours</span>
                  <span>{category.ready_to_publish_count} prêtes</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <CreateCategoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchCategories}
      />
    </div>
  );
}