// export type VideoStatus = 'pending' | 'ready_to_publish' | 'finished';

// export interface CasinoReport {
//   id: number;
//   user_id: string | null;
//   template_id: number;
//   template_name: string;
//   day: number;
//   month: string;
//   year: number;
//   date: string;
//   created_at: string | null;
//   data: Record<string, any>;
// }

// export interface CategoryVideo {
//   id: number;
//   category_id: number;
//   title: string;
//   created_at: string | null;
//   updated_at: string | null;
//   production_status: VideoStatus | null;
//   identifier: number | null;
// }

// export interface Profile {
//   id: string;
//   email: string;
//   role: string;
//   name: string | null;
//   created_at: string | null;
// }

// export interface UserActivity {
//   id: number;
//   user_id: string;
//   action_type: string;
//   details: string;
//   created_at: string;
// }

// export interface VideoCategory {
//   id: number;
//   identifier: string;
//   title: string;
//   last_updated: string | null;
//   finished_count: number | null;
//   pending_count: number | null;
//   ready_to_publish_count: number | null;
//   user_id: string | null;
// }

// export interface VideoDetail {
//   id: number;
//   category_video_id: number;
//   title: string;
//   instructions_miniature: string | null;
//   rush_link: string | null;
//   video_link: string | null;
//   miniature_link: string | null;
//   production_status: VideoStatus | null;
//   created_at: string | null;
//   updated_at: string | null;
//   description: string | null;
//   edit_notes: string | null;
// } 