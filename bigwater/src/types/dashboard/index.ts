import { ReactNode } from 'react';

/**
 * Interface pour une statistique vidéo sur le dashboard
 */
export interface VideoStat {
  title: string;
  value: string;
  change?: string;
  icon: ReactNode;
  description: string;
  color: string;
}

/**
 * Interface pour un élément d'activité sur le dashboard
 */
export interface ActivityItem {
  id: number;
  title: string;
  timestamp: string;
  action: string;
  resourceName: string;
  status?: string;
}

/**
 * Interface pour les propriétés du composant StatCard
 */
export interface StatCardProps {
  title: string; 
  value: number | string; 
  icon: ReactNode;
  percentage: string | null;
  lastUpdated: string;
}

/**
 * Interface pour les propriétés du composant QuickActionCard
 */
export interface QuickActionCardProps {
  icon: ReactNode;
  title: string;
  onClick?: () => void;
  href?: string;
}

/**
 * Interface pour les données de graphique de statut
 */
export interface StatusChartItem {
  name: string;
  value: number;
  color: string;
}

/**
 * Interface pour les données de graphique d'activité
 */
export interface ActivityChartItem {
  date: string;
  Modifications: number;
  [key: string]: string | number;
}

/**
 * Interface pour les données de graphique de catégorie
 */
export interface CategoryChartItem {
  name: string;
  value: number;
} 