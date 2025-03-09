"use client";

import { useState, useEffect, useCallback } from "react";
import CreateCategoryModal from "@/components/CreateCategoryModal";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CategoryWithCounts {
  id: number;
  identifier: string;
  title: string;
  pending_count: number;
  ready_to_publish_count: number;
  finished_count: number;
}

interface VideoCategory {
  id: number;
  identifier: string;
  title: string;
  category_videos: { production_status: string }[] | null;
}

export default function DashboardPage() {
  const [categories, setCategories] = useState<CategoryWithCounts[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const supabase = createClientComponentClient();
  const router = useRouter();

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("video_categories")
        .select(`
          id,
          identifier,
          title,
          category_videos (
            production_status
          )
        `)
        .order("identifier", { ascending: true });

      if (error) throw error;

      const dataCategories = (data || []) as VideoCategory[];

      const mapped = dataCategories.map((cat) => {
        let pending_count = 0;
        let ready_to_publish_count = 0;
        let finished_count = 0;

        cat.category_videos?.forEach((video) => {
          if (video.production_status === "En cours") {
            pending_count++;
          } else if (video.production_status === "Prêt à publier") {
            ready_to_publish_count++;
          } else if (video.production_status === "Terminé") {
            finished_count++;
          }
        });

        return {
          id: cat.id,
          identifier: cat.identifier,
          title: cat.title,
          pending_count,
          ready_to_publish_count,
          finished_count,
        };
      });

      setCategories(mapped);
    } catch (err) {
      console.error("Erreur lors du chargement des catégories:", err);
      setError("Impossible de charger les catégories");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* --- Entête avec le titre et le bouton "Voir toutes les vidéos" --- */}
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl sm:text-3xl md:text-3xl font-bold tracking-tight text-white">
          Catégories de vidéos
        </h1>

        {/* Bouton qui renvoie vers la page listant toutes les vidéos */}
        <Link
          href="/dashboard/videos"
          className="
            inline-block px-4 py-2 rounded-md
            bg-[#424242] text-[#ECECEC]
            hover:bg-[#171717] transition-colors duration-200
            border border-[#424242]
          "
        >
          Voir toutes les vidéos
        </Link>
      </header>

      {isLoading ? (
        <div className="text-center py-6">Chargement en cours...</div>
      ) : (
        <>
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Carte pour créer une nouvelle catégorie */}
            <div
              onClick={() => setIsCreateModalOpen(true)}
              className="
                bg-[#171717]
                p-4 sm:p-6
                rounded-lg
                border border-dashed border-[#424242]
                transition-all duration-200
                cursor-pointer
                flex flex-col items-center justify-center
                hover:shadow-md
                md:hover:scale-[1.01]
                active:scale-[0.99]
              "
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#424242] rounded-full flex items-center justify-center mb-3 text-xl text-white">
                +
              </div>
              <p className="text-center text-gray-400 text-sm sm:text-base">
                Créer une nouvelle catégorie
              </p>
            </div>

            {/* Liste des catégories existantes */}
            {categories.map((category, index) => (
              <div
                key={category.id}
                onClick={() =>
                  router.push(`/dashboard/categories/${category.id}`)
                }
                className="
                  bg-[#171717]
                  p-4 sm:p-6
                  rounded-lg
                  border border-[#424242]
                  transition-all duration-200
                  cursor-pointer
                  hover:shadow-md
                  md:hover:scale-[1.01]
                  active:scale-[0.99]
                "
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center mb-2 sm:mb-3">
                  <span className="text-base sm:text-lg md:text-xl font-medium text-[#424242]">
                    {category.identifier}
                  </span>
                  <span className="mx-2 text-base sm:text-lg md:text-xl font-medium text-[#424242]">
                    |
                  </span>
                  <h3 className="text-base sm:text-lg md:text-xl font-medium truncate">
                    {category.title}
                  </h3>
                </div>
                <div className="flex flex-col text-xs sm:text-sm text-gray-400 gap-1">
                  <span>{category.pending_count} en cours</span>
                  <span>{category.ready_to_publish_count} prêtes</span>
                  <span>{category.finished_count} terminées</span>
                </div>
              </div>
            ))}
          </section>
        </>
      )}

      <CreateCategoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchCategories}
      />
    </div>
  );
}
