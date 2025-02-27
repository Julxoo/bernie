export interface Video {
  id: number;
  title: string;
  status: 'pending' | 'finished' | 'ready_to_publish';
  created_at: string;
  updated_at: string;
  category_id: number;
  description?: string;
  video_url?: string;
  thumbnail_url?: string;
  instructions_miniature: string;
  rush_link: string;
  video_link: string;
  miniature_link: string;
  production_status: Status;
}

export const VIDEO_STATUS = {
  TO_DO: 'À monter',
  IN_PROGRESS: 'En cours',
  READY_TO_PUBLISH: 'Prêt à publier',
  FINISHED: 'Terminé'
} as const;

export type Status = typeof VIDEO_STATUS[keyof typeof VIDEO_STATUS];

export interface StatusStep {
  value: Status;
  label: string;
  description: string;
}
