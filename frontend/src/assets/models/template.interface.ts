export interface Template{
    id_plantilla: number;
    nombre_plantilla: string;
    bloques: CategoriaConEjercicios[];
}

export interface CategoriaConEjercicios {
  id_categoria: number;
  nombre_categoria: string;
  defectos: Defecto[];
}

export interface Defecto{
    id_ejercicio: number,
    repeticiones: number,
    series: number,
    carga: number,
    RPE: number,
    nombre_ejercicio: string;
}

export const TemplateOrderOptions = {
    orderOptions: ['Nombre', 'Antigüedad'] as const,
    ascOptions: {
        Antigüedad: 'Más reciente ↑',
        Nombre: 'A-Z ↑'
    },
    descOptions: {
        Antigüedad: 'Más antiguo ↓',
        Nombre: 'Z-A ↓'
    }
}