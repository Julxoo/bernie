// import { ReactNode } from 'react';

/**
 * Types de messages pour les notifications et formulaires
 */
export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

/**
 * Type pour les options de redirection
 */
export interface RedirectOptions {
  tab?: string;
}

/**
 * Type générique pour les réponses d'API
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * Interface pour une entrée de payload de tooltip
 */
export interface TooltipPayloadItem {
  name: string;
  value: number | string;
  color: string;
  [key: string]: unknown;
}

/**
 * Interface pour les tooltips personnalisés
 */
export interface TooltipProps {
  active?: boolean;
  payload?: Array<TooltipPayloadItem>;
  label?: string;
} 