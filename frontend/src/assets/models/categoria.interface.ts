export interface Categoria{
    id: number;
    nombre_categoria: string;
}

export const CategoriaOrderOptions = {
    orderOptions: ['Nombre'] as const,
    ascOptions: {
        Nombre: 'A-Z ↑'
    },
    descOptions: {
        Nombre: 'Z-A ↓'
    }
}