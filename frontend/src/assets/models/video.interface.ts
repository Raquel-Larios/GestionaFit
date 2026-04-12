export interface Video{
    id: number;
    nombre_video: string;
    enlace_video: string;
}

export const VideoOrderOptions = {
    orderOptions: ['Antigüedad'] as const,
    ascOptions: {
        Antigüedad: 'Más reciente ↑'
    },
    descOptions: {
        Antigüedad: 'Más antiguo ↓'
    }
}