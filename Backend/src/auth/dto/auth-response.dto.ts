export class AuthResponseDto {
    access_token: string;
    user: {
        id: number;
        correo: string;
        nombre: string;
        apellido: string;
        rol: string;
        tipo: string;
    };
}
