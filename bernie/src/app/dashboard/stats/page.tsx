"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  Filler,
  TooltipItem,
  ChartOptions,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import Link from "next/link";

// shadcn/ui components
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Import supabase client
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend,
  Filler
);

interface Stats {
  toDo: number; // À monter
  inProgress: number; // En cours
  readyToPublish: number; // Prêt à publier
  finished: number; // Terminé
}

interface PerformanceData {
  avgProductionTime: string; // temps moyen de production (en jours)
  monthlyCounts: Record<string, number>;
  totalVideos: number;
}

// Pour la distribution par catégorie
interface CategoryRow {
  id: number;
  title: string;
  category_videos: Array<{
    id: number;
  }>;
}

export default function StatsPage() {
  const supabase = createClientComponentClient();

  const [stats, setStats] = useState<Stats | null>(null);
  const [performance, setPerformance] = useState<PerformanceData | null>(null);

  // Distribution par catégorie : { label: string, total: number }
  const [categoryDistribution, setCategoryDistribution] = useState<
    { label: string; total: number }[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Calcul du total de vidéos toutes catégories confondues
  const totalVideos =
    (stats?.toDo ?? 0) +
    (stats?.inProgress ?? 0) +
    (stats?.readyToPublish ?? 0) +
    (stats?.finished ?? 0);

  // --- FETCH DE /api/stats ET /api/performance ---
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);

        // 1. Récupération des stats par statut
        const resStats = await fetch("/api/stats");
        if (!resStats.ok) {
          throw new Error("Erreur lors de la récupération des stats");
        }
        const dataStats = (await resStats.json()) as Stats;

        // 2. Récupération des infos de performance
        const resPerf = await fetch("/api/performance");
        if (!resPerf.ok) {
          throw new Error("Erreur lors de la récupération de la performance");
        }
        const dataPerf = (await resPerf.json()) as PerformanceData;

        setStats(dataStats);
        setPerformance(dataPerf);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : String(err);
        console.error("Erreur:", errorMessage);
        setError(
          "Impossible de charger les données. Veuillez réessayer plus tard."
        );
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // --- FETCH DE LA DISTRIBUTION PAR CATÉGORIE ---
  useEffect(() => {
    (async () => {
      try {
        // On récupère la liste des catégories + la liste des vidéos associées
        const { data, error } = await supabase
          .from("video_categories")
          .select("id, title, category_videos (id)")
          .order("title", { ascending: true });

        if (error) {
          throw new Error(error.message);
        }

        const catRows = (data || []) as CategoryRow[];
        // On calcule, pour chaque catégorie, le total de vidéos
        const distribution = catRows.map((cat) => ({
          label: cat.title,
          total: cat.category_videos ? cat.category_videos.length : 0,
        }));

        setCategoryDistribution(distribution);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : String(err);
        console.error("Erreur fetch category distribution:", errorMessage);
      }
    })();
  }, [supabase]);

  // --- PREPARATION DU PREMIER CHART (Évolution par statut) ---
  const chartDataByStatus = {
    labels: ["À monter", "En cours", "Prêt à publier", "Terminé"],
    datasets: [
      {
        label: "Vidéos",
        data: stats
          ? [
              stats.toDo ?? 0,
              stats.inProgress ?? 0,
              stats.readyToPublish ?? 0,
              stats.finished ?? 0,
            ]
          : [],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#171717",
        pointBorderWidth: 2,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: "#ffffff",
        pointHoverBorderColor: "#3b82f6",
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const chartOptionsByStatus: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(23, 23, 23, 0.9)",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 12,
        borderColor: "rgba(59, 130, 246, 0.5)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (tooltipItems: TooltipItem<"line">[]) =>
            tooltipItems[0].label ?? "",
          label: (context: TooltipItem<"line">) =>
            `${context.formattedValue} vidéos`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#a1a1aa",
          font: { size: 11 },
          padding: 8,
        },
        border: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
          lineWidth: 1,
        },
        border: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "#a1a1aa",
          stepSize: 1,
          font: { size: 11 },
          padding: 8,
        },
        beginAtZero: true,
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    elements: {
      line: {
        capBezierPoints: true,
      },
    },
    animation: { duration: 1500, easing: "easeOutQuart" },
  };

  // --- PREPARATION DU SECOND CHART (Vidéos terminées par mois) ---
  const monthlyCounts = performance?.monthlyCounts || {};
  const months = Object.keys(monthlyCounts).sort();
  const counts = months.map((m) => monthlyCounts[m]);

  const chartDataByMonth = {
    labels: months,
    datasets: [
      {
        label: "Vidéos terminées",
        data: counts,
        backgroundColor: "rgba(147, 51, 234, 0.6)",
        borderColor: "#9333EA",
        borderWidth: 2,
      },
    ],
  };

  const chartOptionsByMonth: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(23, 23, 23, 0.9)",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 12,
        borderColor: "rgba(147, 51, 234, 0.5)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (tooltipItems: TooltipItem<"bar">[]) =>
            `Mois: ${tooltipItems[0].label ?? ""}`,
          label: (context: TooltipItem<"bar">) =>
            `${context.formattedValue} vidéos`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#a1a1aa",
          font: { size: 11 },
          padding: 8,
        },
        border: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
          lineWidth: 1,
        },
        border: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "#a1a1aa",
          font: { size: 11 },
          padding: 8,
        },
        beginAtZero: true,
      },
    },
    animation: { duration: 1500, easing: "easeOutQuart" },
  };

  // --- NOUVEAU CHART : DISTRIBUTION PAR CATÉGORIE ---
  const catLabels = categoryDistribution.map((c) => c.label);
  const catCounts = categoryDistribution.map((c) => c.total);

  const chartDataByCategory = {
    labels: catLabels,
    datasets: [
      {
        label: "Nombre de vidéos",
        data: catCounts,
        backgroundColor: "rgba(34, 197, 94, 0.6)",
        borderColor: "#22c55e",
        borderWidth: 2,
      },
    ],
  };

  const chartOptionsByCategory: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(23, 23, 23, 0.9)",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 12,
        borderColor: "rgba(34, 197, 94, 0.5)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (tooltipItems: TooltipItem<"bar">[]) =>
            tooltipItems[0].label ?? "",
          label: (context: TooltipItem<"bar">) =>
            `${context.formattedValue} vidéos`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#a1a1aa",
          font: { size: 11 },
          padding: 8,
        },
        border: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
          lineWidth: 1,
        },
        border: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "#a1a1aa",
          font: { size: 11 },
          padding: 8,
        },
        beginAtZero: true,
      },
    },
    animation: { duration: 1500, easing: "easeOutQuart" },
  };

  // Items de status (pour affichage résumé + barres colorées)
  const statusItems = [
    {
      title: "À monter",
      value: stats?.toDo ?? 0,
      bgColor: "bg-yellow-600",
    },
    {
      title: "En cours",
      value: stats?.inProgress ?? 0,
      bgColor: "bg-blue-600",
    },
    {
      title: "Prêt à publier",
      value: stats?.readyToPublish ?? 0,
      bgColor: "bg-purple-600",
    },
    {
      title: "Terminé",
      value: stats?.finished ?? 0,
      bgColor: "bg-green-600",
    },
  ];

  return (
    <div className="p-4 md:p-6 text-gray-200 min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Statistiques
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Aperçu global de la production vidéo
        </p>
      </header>

      {/* Indicateur de chargement + gestion d'erreur */}
      {isLoading && !error && (
        <div className="space-y-6">
          <Skeleton className="h-10 w-1/3 bg-gray-800" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-24 w-full bg-gray-800" />
            ))}
          </div>
          <Skeleton className="h-80 w-full bg-gray-800" />
        </div>
      )}

      {error && (
        <Card className="bg-red-900/20 border border-red-700 text-red-300 p-4 mb-6">
          <div className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-400"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <h3 className="font-medium text-red-200">
                Erreur de chargement
              </h3>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {!isLoading && !error && stats && performance && (
        <div className="space-y-6">
          {/* Cartes de stats (à monter, en cours, prêt, terminé) */}
          <div className="grid grid-cols-2 gap-3">
            {statusItems.map((item) => {
              const percentage =
                totalVideos > 0
                  ? Math.round((item.value / totalVideos) * 100)
                  : 0;
              return (
                <Link
                  key={item.title}
                  href={`/dashboard/videos?status=${encodeURIComponent(
                    item.title
                  )}`}
                  className="block"
                >
                  <Card className="bg-[#1a1a1a] border border-[#2a2a2a] hover:border-gray-600 transition-all duration-300">
                    <CardContent className="p-3">
                      <p className="text-gray-400 text-sm">{item.title}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-3xl font-bold text-white">
                          {item.value}
                        </span>
                        <Badge className={`${item.bgColor} ml-2`}>
                          {percentage}%
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Graphique #1: répartition des vidéos par statut */}
          <Card className="bg-[#171717] border border-[#2a2a2a] hover:border-gray-600 transition-all duration-300 overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center text-lg">
                  <span>Évolution par statut</span>
                </CardTitle>
                <Badge className="bg-blue-900/50 text-blue-200">
                  {totalVideos} vidéos total
                </Badge>
              </div>
              <CardDescription className="text-gray-400 text-sm">
                Nombre de vidéos selon leur étape de production
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 pt-2 pb-0">
              <div className="relative w-full h-64 sm:h-72">
                <Line data={chartDataByStatus} options={chartOptionsByStatus} />
              </div>
            </CardContent>
          </Card>

          {/* Cartes Performance + Distribution (barres colorées) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Carte 2: Distribution (progress bars) */}
            <Card className="bg-[#171717] border border-[#2a2a2a] hover:border-gray-600 transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">Distribution</CardTitle>
                <CardDescription className="text-gray-400 text-sm">
                  Répartition des statuts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {statusItems.map((item) => {
                  const pct =
                    totalVideos > 0
                      ? Math.round((item.value / totalVideos) * 100)
                      : 0;
                  return (
                    <div key={item.title} className="mb-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-300">
                          {item.title}
                        </span>
                        <span className="text-sm text-gray-400">{pct}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2.5">
                        <div
                          className={`${item.bgColor} h-2.5 rounded-full`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Graphique #2: nombre de vidéos terminées par mois */}
          <Card className="bg-[#171717] border border-[#2a2a2a] hover:border-gray-600 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg">
                Vidéos terminées par mois
              </CardTitle>
              <CardDescription className="text-gray-400 text-sm">
                Historique des exports/terminaisons
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 pt-2 pb-0">
              <div className="relative w-full h-64 sm:h-72">
                {months.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Aucune donnée mensuelle
                  </div>
                ) : (
                  <Bar data={chartDataByMonth} options={chartOptionsByMonth} />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Graphique #3: nombre total de vidéos par catégorie */}
          <Card className="bg-[#171717] border border-[#2a2a2a] hover:border-gray-600 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg">
                Répartition par catégorie
              </CardTitle>
              <CardDescription className="text-gray-400 text-sm">
                Nombre de vidéos pour chaque catégorie
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 pt-2 pb-0">
              <div className="relative w-full h-64 sm:h-72">
                {categoryDistribution.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Aucune catégorie ou aucune vidéo
                  </div>
                ) : (
                  <Bar
                    data={chartDataByCategory}
                    options={chartOptionsByCategory}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Récapitulatif détaillé (table) */}
          <Card className="bg-[#171717] border border-[#2a2a2a] hover:border-gray-600 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg">
                Récapitulatif détaillé
              </CardTitle>
              <CardDescription className="text-gray-400 text-sm">
                Distribution des vidéos par statut
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-800">
                    <TableHead className="text-gray-400">Statut</TableHead>
                    <TableHead className="text-right text-gray-400">
                      Quantité
                    </TableHead>
                    <TableHead className="text-right text-gray-400">
                      Pourcentage
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statusItems.map((item) => {
                    const pct =
                      totalVideos > 0
                        ? Math.round((item.value / totalVideos) * 100)
                        : 0;
                    return (
                      <TableRow
                        key={item.title}
                        className="border-b border-gray-800 hover:bg-[#1d1d1d]"
                      >
                        <TableCell className="font-medium text-gray-300 flex items-center">
                          <span
                            className={`w-3 h-3 rounded-full mr-2 ${item.bgColor}`}
                          />
                          {item.title}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-white">
                          {item.value}
                        </TableCell>
                        <TableCell className="text-right text-gray-400">
                          {pct}%
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="bg-[#1a1a1a]">
                    <TableCell className="font-bold text-white">
                      Total
                    </TableCell>
                    <TableCell className="text-right font-bold text-white">
                      {totalVideos}
                    </TableCell>
                    <TableCell className="text-right font-bold text-white">
                      100%
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="text-xs text-gray-500 pt-0">
              Dernière mise à jour:{" "}
              {new Date().toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
