export interface Material{
    id: number;
    nombre_material: string;
    contenido: string;
}

export const MaterialOrderOptions = {
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