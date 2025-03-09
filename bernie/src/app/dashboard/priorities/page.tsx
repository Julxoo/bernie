"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface VideoPriority {
  id: number;
  title: string;
  production_status: string;
  updated_at: string;
  priority: number;
}

export default function PrioritiesPage() {
  const [videos, setVideos] = useState<VideoPriority[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchPriorities = async () => {
      try {
        const response = await fetch("/api/priorities");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des priorités");
        }
        const data = await response.json();
        setVideos(data);
      } catch (err: unknown) {
        console.error("Erreur lors du chargement des priorités", err);
        setError("Impossible de charger les priorités");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPriorities();
  }, []);

  return (
    <div className="p-4 text-[#ECECEC]">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold">Priorisation et planification</h1>
      </header>
      {isLoading ? (
        <div>Chargement...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : videos.length === 0 ? (
        <div>Aucune vidéo prioritaire à afficher.</div>
      ) : (
        <div className="space-y-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="p-4 bg-[#171717] rounded-lg cursor-pointer hover:bg-[#212121] transition-colors"
              onClick={() => router.push(`/dashboard/videos/${video.id}`)}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{video.title}</h2>
                <span className="px-3 py-1 rounded-full bg-red-600 text-white text-sm">
                  Priorité: {video.priority}
                </span>
              </div>
              <p>Statut: {video.production_status}</p>
              <p>
                Dernière mise à jour: {new Date(video.updated_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
