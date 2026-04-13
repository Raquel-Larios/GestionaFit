export interface Video{
    id: number;
    nombre_video: string;
    enlace_video: string;
}

export const VideoOrderOptions = {
    orderOptions: ['Antigüedad' , 'Nombre'] as const,
    ascOptions: {
        Antigüedad: 'Más reciente ↑',
        Nombre: 'A-Z ↑'
    },
    descOptions: {
        Antigüedad: 'Más antiguo ↓',
        Nombre: 'Z-A ↓'
    }
}