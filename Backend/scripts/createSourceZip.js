#!/usr/bin/env node
/**
 * createSourceZip.js
 * Empaqueta el código fuente del Backend en 02_Backend_Source.zip excluyendo artefactos y dependencias pesadas.
 * Uso: npm run package:source
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const backendRoot = path.resolve(__dirname, '..');
const tempDir = path.join(backendRoot, 'source-package-temp');
const destZip = path.join(backendRoot, '02_Backend_Source.zip');

// Carpetas / archivos que copiamos (excluyendo node_modules, dist, uploads pesados y prisma/generated)
const includeItems = [
    'src',
    'prisma',
    'nest-cli.json',
    'package.json',
    'tsconfig.json',
    'tsconfig.build.json',
    'README.md',
    'Documento.md',
    '.env.example'
];

function rmDirRecursive(target) {
    if (!fs.existsSync(target)) return;
    for (const entry of fs.readdirSync(target)) {
        const cur = path.join(target, entry);
        const stat = fs.lstatSync(cur);
        if (stat.isDirectory()) {
            rmDirRecursive(cur);
        } else {
            try { fs.unlinkSync(cur); } catch (e) { console.warn('[source-zip] No se pudo eliminar archivo:', cur, e.message); }
        }
    }
    // Intentar hasta 3 veces en caso de ENOTEMPTY por locks transitorios
    for (let i = 0; i < 3; i++) {
        try {
            fs.rmdirSync(target);
            return;
        } catch (e) {
            if (e.code === 'ENOTEMPTY') {
                const leftover = fs.readdirSync(target);
                if (leftover.length === 0) continue;
                // Forzar eliminación de cualquier archivo sobrante oculto
                leftover.forEach(name => {
                    const p = path.join(target, name);
                    try { fs.rmSync(p, { recursive: true, force: true }); } catch { /* ignore */ }
                });
            } else {
                console.warn('[source-zip] Falló rmdir:', target, e.message);
                break;
            }
        }
    }
}

function copyRecursive(src, dest) {
    if (!fs.existsSync(src)) return;
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(child => {
            // exclusiones específicas
            if (child === 'node_modules' || child === 'dist' || child === 'uploads' || child === 'generated') return;
            copyRecursive(path.join(src, child), path.join(dest, child));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

try {
    console.log('[source-zip] Preparando empaquetado...');
    if (fs.existsSync(tempDir)) rmDirRecursive(tempDir);
    fs.mkdirSync(tempDir, { recursive: true });

    includeItems.forEach(item => {
        copyRecursive(path.join(backendRoot, item), path.join(tempDir, item));
    });

    // Eliminar cliente prisma generado si existe
    const prismaGenerated = path.join(tempDir, 'generated');
    if (fs.existsSync(prismaGenerated)) rmDirRecursive(prismaGenerated);

    console.log('[source-zip] Comprimir a ZIP (PowerShell Compress-Archive)...');
    // Usamos PowerShell disponible en Windows
    const psCommand = `Compress-Archive -Path \"${tempDir}\\*\" -DestinationPath \"${destZip}\" -Force`;
    execSync(`powershell -NoLogo -NonInteractive -Command ${psCommand}`, { stdio: 'inherit' });

    console.log(`[source-zip] ZIP generado: ${destZip}`);

} catch (err) {
    console.error('[source-zip] Error:', err);
    process.exit(1);
} finally {
    // Limpieza
    if (fs.existsSync(tempDir)) rmDirRecursive(tempDir);
}
