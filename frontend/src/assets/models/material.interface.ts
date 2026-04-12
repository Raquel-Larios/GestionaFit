export interface Material{
    id: number;
    nombre_material: string;
    contenido: string;
}

export const MaterialOrderOptions = {
    orderOptions: ['Antigüedad'] as const,
    ascOptions: {
        Antigüedad: 'Más reciente ↑'
    },
    descOptions: {
        Antigüedad: 'Más antiguo ↓'
    }
}