import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Roles
  console.log('🔄 Creando roles...');
  const roles = [
    { nombre_role: 'ADMINISTRADOR' },
    { nombre_role: 'CANDIDATO' },
    { nombre_role: 'VOTANTE' },
  ];
  for (const r of roles) {
    await prisma.role.upsert({
      where: { id_role: roles.indexOf(r) + 1 },
      update: {},
      create: r,
    });
  }
  console.log('✅ Roles creados');

  // Careers (basic examples)
  console.log('🔄 Creando carreras...');
  const careers = [
    { nombre_career: 'Ingeniería de Sistemas', facultad_career: 'Ingenierías' },
    { nombre_career: 'Ingeniería Industrial', facultad_career: 'Ingenierías' },
    {
      nombre_career: 'Administración de Empresas',
      facultad_career: 'Administración',
    },
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
  console.log('✅ Carreras creadas');

  console.log('✅ Carreras creadas');

  // Administrator
  console.log('🔄 Creando administrador...');
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
    console.log('✅ Administrador creado');
  } else {
    console.log('ℹ️  Administrador ya existe');
  }

  // Voters (ejemplos de votantes)
  console.log('🔄 Creando votantes...');
  const voterPassword = await bcrypt.hash('voter123', 10);
  const voters = [
    {
      nombre_voter: 'Juan',
      apellido_voter: 'Pérez',
      tipo_doc_voter: 'CC',
      num_doc_voter: BigInt(1001234567),
      correo_voter: 'juan.perez@estudiante.univote.com',
      estado_voter: 'Activo',
      contrasena_voter: voterPassword,
      roleId: 3,
      careerId: 1,
    },
    {
      nombre_voter: 'María',
      apellido_voter: 'González',
      tipo_doc_voter: 'CC',
      num_doc_voter: BigInt(1002345678),
      correo_voter: 'maria.gonzalez@estudiante.univote.com',
      estado_voter: 'Activo',
      contrasena_voter: voterPassword,
      roleId: 3,
      careerId: 1,
    },
    {
      nombre_voter: 'Carlos',
      apellido_voter: 'Rodríguez',
      tipo_doc_voter: 'CC',
      num_doc_voter: BigInt(1003456789),
      correo_voter: 'carlos.rodriguez@estudiante.univote.com',
      estado_voter: 'Activo',
      contrasena_voter: voterPassword,
      roleId: 3,
      careerId: 1,
    },
    {
      nombre_voter: 'Ana',
      apellido_voter: 'Martínez',
      tipo_doc_voter: 'CC',
      num_doc_voter: BigInt(1004567890),
      correo_voter: 'ana.martinez@estudiante.univote.com',
      estado_voter: 'Inactivo',
      contrasena_voter: voterPassword,
      roleId: 3,
      careerId: 1,
    },
    {
      nombre_voter: 'Luis',
      apellido_voter: 'López',
      tipo_doc_voter: 'TI',
      num_doc_voter: BigInt(1005678901),
      correo_voter: 'luis.lopez@estudiante.univote.com',
      estado_voter: 'Activo',
      contrasena_voter: voterPassword,
      roleId: 3,
      careerId: 1,
    },
    {
      nombre_voter: 'Sofia',
      apellido_voter: 'Hernández',
      tipo_doc_voter: 'CC',
      num_doc_voter: BigInt(1006789012),
      correo_voter: 'sofia.hernandez@estudiante.univote.com',
      estado_voter: 'Activo',
      contrasena_voter: voterPassword,
      roleId: 3,
      careerId: 1,
    },
    {
      nombre_voter: 'Diego',
      apellido_voter: 'García',
      tipo_doc_voter: 'CC',
      num_doc_voter: BigInt(1007890123),
      correo_voter: 'diego.garcia@estudiante.univote.com',
      estado_voter: 'Activo',
      contrasena_voter: voterPassword,
      roleId: 3,
      careerId: 1,
    },
    {
      nombre_voter: 'Valentina',
      apellido_voter: 'Ramírez',
      tipo_doc_voter: 'CC',
      num_doc_voter: BigInt(1008901234),
      correo_voter: 'valentina.ramirez@estudiante.univote.com',
      estado_voter: 'Inactivo',
      contrasena_voter: voterPassword,
      roleId: 3,
      careerId: 1,
    },
    {
      nombre_voter: 'Andrés',
      apellido_voter: 'Torres',
      tipo_doc_voter: 'CC',
      num_doc_voter: BigInt(1009012345),
      correo_voter: 'andres.torres@estudiante.univote.com',
      estado_voter: 'Activo',
      contrasena_voter: voterPassword,
      roleId: 3,
      careerId: 1,
    },
    {
      nombre_voter: 'Camila',
      apellido_voter: 'Flores',
      tipo_doc_voter: 'CC',
      num_doc_voter: BigInt(1010123456),
      correo_voter: 'camila.flores@estudiante.univote.com',
      estado_voter: 'Activo',
      contrasena_voter: voterPassword,
      roleId: 3,
      careerId: 1,
    },
  ];  let createdCount = 0;
  for (const voterData of voters) {
    const existingVoter = await prisma.voter.findUnique({
      where: { correo_voter: voterData.correo_voter },
    });
    if (!existingVoter) {
      try {
        await prisma.voter.create({
          data: voterData,
        });
        createdCount++;
      } catch (error) {
        console.error(
          `❌ Error creando votante ${voterData.correo_voter}:`,
          error.message,
        );
      }
    }
  }

  console.log('Seed data applied successfully');
  console.log(`✅ Creados ${createdCount} votantes nuevos de ${voters.length} totales`);
  console.log('📧 Credenciales de votantes: correo@estudiante.univote.com / voter123');
  console.log('📧 Credenciales de admin: admin@univote.com / admin123');

  // Candidates (ejemplos de candidatos)
  console.log('🔄 Creando candidatos...');
  const candidatePassword = await bcrypt.hash('candidate123', 10);
  const candidates = [
    {
      nombre_candidate: 'Roberto',
      apellido_candidate: 'Sánchez',
      tipo_doc_candidate: 'CC',
      num_doc_candidate: BigInt(2001234567),
      correo_candidate: 'roberto.sanchez@candidato.univote.com',
      estado_candidate: 'Aprobado',
      contrasena_candidate: candidatePassword,
      foto_candidate: null,
      motivo_rechazo: null,
      roleId: 2, // CANDIDATO
      careerId: 1,
    },
    {
      nombre_candidate: 'Laura',
      apellido_candidate: 'Jiménez',
      tipo_doc_candidate: 'CC',
      num_doc_candidate: BigInt(2002345678),
      correo_candidate: 'laura.jimenez@candidato.univote.com',
      estado_candidate: 'Aprobado',
      contrasena_candidate: candidatePassword,
      foto_candidate: null,
      motivo_rechazo: null,
      roleId: 2,
      careerId: 1,
    },
    {
      nombre_candidate: 'Fernando',
      apellido_candidate: 'Ruiz',
      tipo_doc_candidate: 'CC',
      num_doc_candidate: BigInt(2003456789),
      correo_candidate: 'fernando.ruiz@candidato.univote.com',
      estado_candidate: 'Aprobado',
      contrasena_candidate: candidatePassword,
      foto_candidate: null,
      motivo_rechazo: null,
      roleId: 2,
      careerId: 1,
    },
    {
      nombre_candidate: 'Patricia',
      apellido_candidate: 'Morales',
      tipo_doc_candidate: 'CC',
      num_doc_candidate: BigInt(2004567890),
      correo_candidate: 'patricia.morales@candidato.univote.com',
      estado_candidate: 'Pendiente',
      contrasena_candidate: candidatePassword,
      foto_candidate: null,
      motivo_rechazo: null,
      roleId: 2,
      careerId: 1,
    },
    {
      nombre_candidate: 'Miguel',
      apellido_candidate: 'Castro',
      tipo_doc_candidate: 'CC',
      num_doc_candidate: BigInt(2005678901),
      correo_candidate: 'miguel.castro@candidato.univote.com',
      estado_candidate: 'Aprobado',
      contrasena_candidate: candidatePassword,
      foto_candidate: null,
      motivo_rechazo: null,
      roleId: 2,
      careerId: 1,
    },
    {
      nombre_candidate: 'Carolina',
      apellido_candidate: 'Vargas',
      tipo_doc_candidate: 'CC',
      num_doc_candidate: BigInt(2006789012),
      correo_candidate: 'carolina.vargas@candidato.univote.com',
      estado_candidate: 'Rechazado',
      contrasena_candidate: candidatePassword,
      foto_candidate: null,
      motivo_rechazo: 'No cumple con los requisitos mínimos de participación',
      roleId: 2,
      careerId: 1,
    },
    {
      nombre_candidate: 'Ricardo',
      apellido_candidate: 'Mendoza',
      tipo_doc_candidate: 'CC',
      num_doc_candidate: BigInt(2007890123),
      correo_candidate: 'ricardo.mendoza@candidato.univote.com',
      estado_candidate: 'Aprobado',
      contrasena_candidate: candidatePassword,
      foto_candidate: null,
      motivo_rechazo: null,
      roleId: 2,
      careerId: 1,
    },
    {
      nombre_candidate: 'Gabriela',
      apellido_candidate: 'Ortiz',
      tipo_doc_candidate: 'CC',
      num_doc_candidate: BigInt(2008901234),
      correo_candidate: 'gabriela.ortiz@candidato.univote.com',
      estado_candidate: 'Pendiente',
      contrasena_candidate: candidatePassword,
      foto_candidate: null,
      motivo_rechazo: null,
      roleId: 2,
      careerId: 1,
    },
    {
      nombre_candidate: 'Javier',
      apellido_candidate: 'Romero',
      tipo_doc_candidate: 'CC',
      num_doc_candidate: BigInt(2009012345),
      correo_candidate: 'javier.romero@candidato.univote.com',
      estado_candidate: 'Aprobado',
      contrasena_candidate: candidatePassword,
      foto_candidate: null,
      motivo_rechazo: null,
      roleId: 2,
      careerId: 1,
    },
    {
      nombre_candidate: 'Natalia',
      apellido_candidate: 'Silva',
      tipo_doc_candidate: 'CC',
      num_doc_candidate: BigInt(2010123456),
      correo_candidate: 'natalia.silva@candidato.univote.com',
      estado_candidate: 'Aprobado',
      contrasena_candidate: candidatePassword,
      foto_candidate: null,
      motivo_rechazo: null,
      roleId: 2,
      careerId: 1,
    },
  ];

  let createdCandidatesCount = 0;
  for (const candidateData of candidates) {
    const existingCandidate = await prisma.candidate.findUnique({
      where: { correo_candidate: candidateData.correo_candidate },
    });
    if (!existingCandidate) {
      try {
        await prisma.candidate.create({
          data: candidateData,
        });
        createdCandidatesCount++;
      } catch (error) {
        console.error(
          `❌ Error creando candidato ${candidateData.correo_candidate}:`,
          error.message,
        );
      }
    }
  }

  console.log('✅ Seed completo exitosamente!');
  console.log(
    `📊 Candidatos: ${createdCandidatesCount} nuevos de ${candidates.length} totales`,
  );
  console.log('📧 Credenciales de candidatos: correo@candidato.univote.com / candidate123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
