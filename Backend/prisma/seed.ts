import { PrismaClient } from '../generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // Roles
    const roles = [
        { nombre_role: 'ADMINISTRADOR' },
        { nombre_role: 'CANDIDATO' },
        { nombre_role: 'VOTANTE' },
    ];
    for (const r of roles) {
        await prisma.role.upsert({
            where: { id_role: roles.indexOf(r) + 1 }, // fragile but fine for initial seed
            update: {},
            create: r,
        });
    }

    // Careers (basic examples)
    const careers = [
        { nombre_career: 'Ingeniería de Sistemas', facultad_career: 'Ingenierías' },
        { nombre_career: 'Ingeniería Industrial', facultad_career: 'Ingenierías' },
        { nombre_career: 'Administración de Empresas', facultad_career: 'Administración' },
        { nombre_career: 'Contaduría Pública', facultad_career: 'Administración' },
        { nombre_career: 'Diseño Gráfico', facultad_career: 'Artes' },
    ];
    for (const c of careers) {
        await prisma.career.upsert({
            where: { id_career: careers.indexOf(c) + 1 },
            update: {},
            create: c,
        });
    }

    // Administrator
    const adminEmail = 'admin@univote.com';
    const adminPasswordPlain = 'admin123';
    const hash = await bcrypt.hash(adminPasswordPlain, 10);

    const existingAdmin = await prisma.administrador.findUnique({
        where: { correo_admin: adminEmail },
    });
    if (!existingAdmin) {
        await prisma.administrador.create({
            data: {
                nombre_admin: 'Admin',
                apellido_admin: 'Principal',
                tipo_doc_admin: 'CC',
                num_doc_admin: BigInt(Date.now()),
                correo_admin: adminEmail,
                contrasena_admin: hash,
            },
        });
    }

    console.log('Seed data applied successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
