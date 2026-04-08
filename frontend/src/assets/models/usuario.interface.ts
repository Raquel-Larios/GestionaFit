export interface Usuario{
    id: number;
    email: string;
    nombre: string;
    apellidos: string;
    contraseña: string;
    flagPass: boolean;
    foto_perfil: string;
    peso: number;
}

export const UsuarioOrderOptions = {
    orderOptions: ['Apellidos', 'Nombre'] as const,
    ascOptions: {
        Apellidos: 'A-Z ↑',
        Nombre: 'A-Z ↑'
    },
    descOptions: {
        Apellidos: 'Z-A ↓',
        Nombre: 'Z-A ↓'
    }
}