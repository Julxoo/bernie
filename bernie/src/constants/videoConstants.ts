import { VIDEO_STATUS, StatusStep } from "../types/video";

export const STATUS_STEPS: StatusStep[] = [
  {
    value: VIDEO_STATUS.TO_DO,
    label: 'À faire',
    description: 'La vidéo est en attente de montage'
  },
  {
    value: VIDEO_STATUS.IN_PROGRESS,
    label: 'En cours',
    description: 'Le montage est en cours'
  },
  {
    value: VIDEO_STATUS.READY_TO_PUBLISH,
    label: 'Prêt à publier',
    description: 'La vidéo est prête pour publication'
  },
  {
    value: VIDEO_STATUS.FINISHED,
    label: 'Terminé',
    description: 'La vidéo a été publiée'
  }
];
