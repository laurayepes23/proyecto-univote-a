import {
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

enum TipoUsuario {
    ADMINISTRADOR = 'administrador',
    VOTANTE = 'votante',
    CANDIDATO = 'candidato',
}

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async login(loginDto: LoginDto): Promise<AuthResponseDto> {
        const { correo, contrasena } = loginDto;

        // Buscar en las 3 tablas
        let usuario: any;
        let tipo: TipoUsuario;
        let rol: string;

        // Intentar como administrador
        const admin = await this.prisma.administrador.findUnique({
            where: { correo_admin: correo },
        });

        if (admin) {
            usuario = admin;
            tipo = TipoUsuario.ADMINISTRADOR;
            rol = 'administrador';
        }

        // Si no, intentar como votante
        if (!usuario) {
            const voter = await this.prisma.voter.findUnique({
                where: { correo_voter: correo },
                include: { role: true, career: true },
            });

            if (voter) {
                if (voter.estado_voter !== 'activo') {
                    throw new UnauthorizedException(
                        'Su cuenta no está activa. Contacte al administrador.',
                    );
                }
                usuario = voter;
                tipo = TipoUsuario.VOTANTE;
                rol = voter.role?.nombre_role || 'votante';
            }
        }

        // Si no, intentar como candidato
        if (!usuario) {
            const candidate = await this.prisma.candidate.findUnique({
                where: { correo_candidate: correo },
                include: { role: true, career: true },
            });

            if (candidate) {
                if (candidate.estado_candidate !== 'aprobado') {
                    throw new UnauthorizedException(
                        'Su candidatura no ha sido aprobada aún.',
                    );
                }
                usuario = candidate;
                tipo = TipoUsuario.CANDIDATO;
                rol = candidate.role?.nombre_role || 'candidato';
            }
        }

        // Si no se encontró en ninguna tabla
        if (!usuario) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        // Verificar contraseña
        const passwordField = this.getPasswordField(tipo!);
        const hashedPassword = usuario[passwordField];

        const isPasswordValid = await bcrypt.compare(contrasena, hashedPassword);
        
        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        // Generar token con expiración por tipo y secreto desde configuración
        const payload = this.createJwtPayload(usuario, tipo!, rol!);
    // Nota: el tipo de expiresIn en las definiciones de jsonwebtoken puede requerir un StringValue literal o number.
    // Al provenir de configuración/env, lo forzamos como any para evitar falsos positivos de TypeScript.
    const expiresIn: any = this.getExpirationTime(tipo!);
        const secret = this.configService.get<string>('JWT_SECRET');
        const access_token = this.jwtService.sign(payload, {
            expiresIn,
            secret,
        });

        return {
            access_token,
            user: this.buildUserResponse(usuario, tipo!, rol!),
        };
    }

    async validateUser(payload: any): Promise<any> {
        const { sub, tipo } = payload;

        let usuario: any;

        switch (tipo) {
            case 'administrador':
                usuario = await this.prisma.administrador.findUnique({
                    where: { id_admin: parseInt(sub) },
                });
                break;

            case 'votante':
                usuario = await this.prisma.voter.findUnique({
                    where: { id_voter: parseInt(sub) },
                    include: { role: true },
                });
                break;

            case 'candidato':
                usuario = await this.prisma.candidate.findUnique({
                    where: { id_candidate: parseInt(sub) },
                    include: { role: true },
                });
                break;

            default:
                return null;
        }

        if (!usuario) {
            return null;
        }

        return {
            id: sub,
            correo: payload.correo,
            rol: payload.rol,
            tipo: payload.tipo,
            nombre: payload.nombre,
            apellido: payload.apellido,
        };
    }

    private createJwtPayload(usuario: any, tipo: TipoUsuario, rol: string): Record<string, any> {
        const nameField = this.getNameField(tipo);
        const lastNameField = this.getLastNameField(tipo);
        const idField = this.getIdField(tipo);
        const emailField = this.getEmailField(tipo);

        return {
            sub: usuario[idField].toString(),
            correo: usuario[emailField],
            rol: rol,
            tipo: tipo,
            nombre: usuario[nameField],
            apellido: usuario[lastNameField],
        };
    }

    private buildUserResponse(usuario: any, tipo: TipoUsuario, rol: string) {
        const nameField = this.getNameField(tipo);
        const lastNameField = this.getLastNameField(tipo);
        const idField = this.getIdField(tipo);
        const emailField = this.getEmailField(tipo);

        return {
            id: usuario[idField],
            correo: usuario[emailField],
            nombre: usuario[nameField],
            apellido: usuario[lastNameField],
            rol: rol,
            tipo: tipo,
        };
    }

    private getExpirationTime(tipo: TipoUsuario): string {
        switch (tipo) {
            case TipoUsuario.ADMINISTRADOR:
                return this.configService.get<string>('JWT_EXPIRATION_ADMIN') || '8h';
            case TipoUsuario.VOTANTE:
                return this.configService.get<string>('JWT_EXPIRATION_VOTER') || '24h';
            case TipoUsuario.CANDIDATO:
                return (
                    this.configService.get<string>('JWT_EXPIRATION_CANDIDATE') || '12h'
                );
            default:
                return '8h';
        }
    }

    private getPasswordField(tipo: TipoUsuario): string {
        const fields = {
            [TipoUsuario.ADMINISTRADOR]: 'contrasena_admin',
            [TipoUsuario.VOTANTE]: 'contrasena_voter',
            [TipoUsuario.CANDIDATO]: 'contrasena_candidate',
        };
        return fields[tipo];
    }

    private getNameField(tipo: TipoUsuario): string {
        const fields = {
            [TipoUsuario.ADMINISTRADOR]: 'nombre_admin',
            [TipoUsuario.VOTANTE]: 'nombre_voter',
            [TipoUsuario.CANDIDATO]: 'nombre_candidate',
        };
        return fields[tipo];
    }

    private getLastNameField(tipo: TipoUsuario): string {
        const fields = {
            [TipoUsuario.ADMINISTRADOR]: 'apellido_admin',
            [TipoUsuario.VOTANTE]: 'apellido_voter',
            [TipoUsuario.CANDIDATO]: 'apellido_candidate',
        };
        return fields[tipo];
    }

    private getIdField(tipo: TipoUsuario): string {
        const fields = {
            [TipoUsuario.ADMINISTRADOR]: 'id_admin',
            [TipoUsuario.VOTANTE]: 'id_voter',
            [TipoUsuario.CANDIDATO]: 'id_candidate',
        };
        return fields[tipo];
    }

    private getEmailField(tipo: TipoUsuario): string {
        const fields = {
            [TipoUsuario.ADMINISTRADOR]: 'correo_admin',
            [TipoUsuario.VOTANTE]: 'correo_voter',
            [TipoUsuario.CANDIDATO]: 'correo_candidate',
        };
        return fields[tipo];
    }
}
