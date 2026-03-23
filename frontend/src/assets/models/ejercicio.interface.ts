export interface Ejercicio{
    id: number;
    nombre_ejercicio: string;
    id_categoria?: number;
}

export const EjercicioOrderOptions = {
    orderOptions: ['Nombre'] as const,
    ascOptions: {
        Nombre: 'A-Z ↑'
    },
    descOptions: {
        Nombre: 'Z-A ↓'
    }
}