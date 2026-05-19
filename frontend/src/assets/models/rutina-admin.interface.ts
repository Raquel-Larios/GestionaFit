export interface RutinaAdmin{
    id_historial: number;
    id_plantilla: number;
    nombre_plantilla: string;
    bloques: CategoriaConEjercicios[];
}

export interface CategoriaConEjercicios {
    id_categoria: number;
    nombre_categoria: string;
    variaciones: Variacion[];
}

export interface Variacion{
    id_ejercicio: number,
    repeticiones: number,
    series: number,
    carga: number,
    RPE: number,
    nombre_ejercicio: string;
}

export const RutinaAdminOrderOptions = {
    orderOptions: ['Antigüedad', 'Nombre'] as const,
    ascOptions: {
        Antigüedad: 'Más reciente ↑',
        Nombre: 'A-Z ↑'
    },
    descOptions: {
        Antigüedad: 'Más antiguo ↓',
        Nombre: 'Z-A ↓'
    }
}