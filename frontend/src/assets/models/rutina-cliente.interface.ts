export interface RutinaCliente{
    id_historial: number;
    id_plantilla: number;
    nombre_plantilla: string;
    bloques: CategoriaConEjercicios[];
}

export interface CategoriaConEjercicios {
    id_categoria: number;
    nombre_categoria: string;
    lecturas: Lectura[];
}

export interface Lectura{
    id_ejercicio: number,
    series: number,
    repeticiones: number,
    carga: number,
    RPE: number,
    nombre_ejercicio: string;
}

export const RutinaClienteOrderOptions = {
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