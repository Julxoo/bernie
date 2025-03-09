"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { ArrowLeft } from "react-feather";

interface VideoRow {
  id: number;
  title: string;
  category_id: number;
  production_status: string;
  created_at: string;
  updated_at: string;
  // etc. si besoin
}

interface Category {
  id: number;
  identifier: string;
  title: string;
}

export default function VideosListingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClientComponentClient();

  // On récupère la valeur initiale de status (ex. "À monter") depuis l'URL
  const initialStatus = searchParams.get("status") || "";

  // States pour le filtre
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [selectedCategory, setSelectedCategory] = useState<string>(""); // "" => toutes catégories
  const [searchQuery, setSearchQuery] = useState("");
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. Charger la liste de catégories pour le dropdown
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("video_categories")
          .select("id, identifier, title")
          .order("identifier");

        if (error) throw error;
        setCategories(data || []);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("Erreur fetch categories:", errorMessage);
      }
    })();
  }, [supabase]);

  // 2. Charger la liste de vidéos (à chaque fois que le user modifie un filtre)
  //    On relance la requête quand [statusFilter, selectedCategory, searchQuery] changent
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");

        let query = supabase
          .from("category_videos")
          .select("*") // tu peux faire .select("id, ... video_details(...)") si besoin
          .order("updated_at", { ascending: false });

        // Filtre par statut si statusFilter n'est pas vide
        if (statusFilter) {
          query = query.eq("production_status", statusFilter);
        }

        // Filtre par catégorie
        const catId = parseInt(selectedCategory, 10);
        if (!isNaN(catId) && catId > 0) {
          query = query.eq("category_id", catId);
        }

        // Recherche par titre
        if (searchQuery.trim()) {
          query = query.ilike("title", `%${searchQuery.trim()}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        setVideos(data as VideoRow[]);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("Erreur fetch videos:", errorMessage);
        setError("Impossible de récupérer la liste des vidéos");
      } finally {
        setLoading(false);
      }
    })();
  }, [supabase, statusFilter, selectedCategory, searchQuery]);

  // Handler si on veut rediriger ou quelque chose sur "back"
  const handleBack = () => {
    router.back();
  };

  return (
    <div className="p-4 md:p-6 text-gray-200 min-h-screen">
      {/* Barre de navigation "retour" */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-[#ECECEC] hover:text-gray-300 transition-colors"
        >
          <ArrowLeft size={18} />
          Retour
        </button>
        <h1 className="text-xl font-semibold ml-4">
          Toutes les vidéos {statusFilter ? `(${statusFilter})` : ""}
        </h1>
      </div>

      {/* Filtres */}
      <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#2a2a2a] mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtre par catégorie */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Filtrer par catégorie
            </label>
            <select
              className="w-full bg-[#212121] border border-[#424242] rounded px-2 py-1"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Toutes catégories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.identifier} - {cat.title}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre par statut (optionnel si on veut laisser l'user en choisir un) */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Statut</label>
            <select
              className="w-full bg-[#212121] border border-[#424242] rounded px-2 py-1"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tous statuts</option>
              <option value="À monter">À monter</option>
              <option value="En cours">En cours</option>
              <option value="Prêt à publier">Prêt à publier</option>
              <option value="Terminé">Terminé</option>
            </select>
          </div>

          {/* Recherche par titre */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Rechercher
            </label>
            <input
              className="w-full bg-[#212121] border border-[#424242] rounded px-2 py-1"
              type="text"
              placeholder="Rechercher par titre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Liste de vidéos */}
      {loading && <div>Chargement des vidéos...</div>}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded">
          {error}
        </div>
      )}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.length === 0 ? (
            <div className="text-gray-400 col-span-full">
              Aucune vidéo ne correspond à ces filtres.
            </div>
          ) : (
            videos.map((video) => (
              <Link
                key={video.id}
                href={`/dashboard/videos/${video.id}`}
                className="
                  block bg-[#171717] p-4 rounded-lg border border-[#424242]
                  hover:border-[#ECECEC] transition-colors duration-200
                "
              >
                <h2 className="text-lg font-bold mb-2">{video.title}</h2>
                <p className="text-sm text-gray-400">
                  Statut: {video.production_status}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Mise à jour: {new Date(video.updated_at).toLocaleDateString()}
                </p>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
