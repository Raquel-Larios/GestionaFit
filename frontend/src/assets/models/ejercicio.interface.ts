export interface Ejercicio{
    id: number;
    nombre_ejercicio: string;
    id_categoria?: number;
}

export const EjercicioOrderOptions = {
    orderOptions: ['Nombre', 'Categoría'] as const,
    ascOptions: {
        Nombre: 'A-Z ↑',
        Categoría: 'A-Z ↑'
    },
    descOptions: {
        Nombre: 'Z-A ↓',
        Categoría: 'Z-A ↓'
    }
}