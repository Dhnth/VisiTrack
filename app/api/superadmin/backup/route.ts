import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';

const execPromise = promisify(exec);

const BACKUP_DIR = path.join(process.cwd(), 'backups');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
interface BackupConfig {
  autoBackup: boolean;
  frequency: string;
  retention: number;
  lastBackup: string | null;
  includeFiles: boolean;
}
// Pastikan folder backup ada
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Helper: Format bytes to MB/GB
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper: Get directory size
function getDirectorySize(dirPath: string): number {
  let total = 0;
  if (!fs.existsSync(dirPath)) return 0;
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      total += getDirectorySize(filePath);
    } else {
      total += stats.size;
    }
  }
  return total;
}

// GET - Daftar file backup + disk usage + config
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userCheck = await query(
    'SELECT role FROM users WHERE email = ?',
    [session.user.email]
  ) as { role: string }[];
  
  if (!userCheck[0] || userCheck[0].role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  // List backup files
  if (action === 'list') {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.endsWith('.sql') || file.endsWith('.zip'))
      .map(file => {
        const stats = fs.statSync(path.join(BACKUP_DIR, file));
        return {
          name: file,
          size: stats.size,
          sizeFormatted: formatBytes(stats.size),
          createdAt: stats.birthtime,
          type: file.endsWith('.sql') ? 'database' : 'full'
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Hitung disk usage
    const backupsSize = getDirectorySize(BACKUP_DIR);
    const uploadsSize = fs.existsSync(UPLOADS_DIR) ? getDirectorySize(UPLOADS_DIR) : 0;
    const totalUsed = backupsSize + uploadsSize;
    const totalDisk = 100 * 1024 * 1024 * 1024; // 100GB
    const diskUsagePercent = (totalUsed / totalDisk) * 100;

    return NextResponse.json({ 
      success: true, 
      backups: files,
      diskUsage: {
        used: totalUsed,
        usedFormatted: formatBytes(totalUsed),
        total: totalDisk,
        totalFormatted: formatBytes(totalDisk),
        percent: Math.round(diskUsagePercent * 10) / 10,
        uploadsSize: formatBytes(uploadsSize),
        backupsSize: formatBytes(backupsSize)
      }
    });
  }

  // Get backup config
  if (action === 'config') {
    const configPath = path.join(BACKUP_DIR, 'config.json');
    let config: BackupConfig = {
      autoBackup: false,
      frequency: 'daily',
      retention: 30,
      lastBackup: null,
      includeFiles: true
    };
    
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
    
    return NextResponse.json({ success: true, config });
  }

  // Download backup file
  if (action === 'download') {
    const fileName = searchParams.get('file');
    if (!fileName) {
      return NextResponse.json({ error: 'File name required' }, { status: 400 });
    }

    const filePath = path.join(BACKUP_DIR, fileName);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const contentType = fileName.endsWith('.zip') ? 'application/zip' : 'application/sql';
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

// POST - Create backup, update config
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userCheck = await query(
    'SELECT role FROM users WHERE email = ?',
    [session.user.email]
  ) as { role: string }[];
  
  if (!userCheck[0] || userCheck[0].role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  // Manual backup (full: database + files)
  if (action === 'manual') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const dbFileName = `db_backup_${timestamp}.sql`;
    const zipFileName = `full_backup_${timestamp}.zip`;
    const dbFilePath = path.join(BACKUP_DIR, dbFileName);
    const zipFilePath = path.join(BACKUP_DIR, zipFileName);

    const dbUrl = process.env.DATABASE_URL || '';
    const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    
    if (!match) {
      return NextResponse.json({ error: 'Invalid database URL' }, { status: 500 });
    }

    const [, user, password, host, port, database] = match;

    try {
      // 1. Backup database
      const mysqldump = `mysqldump -h ${host} -P ${port} -u ${user} -p${password} ${database} --single-transaction --routines --triggers`;
      const { stdout, stderr } = await execPromise(mysqldump);
      
      if (stderr && !stderr.includes('Warning')) {
        console.error('mysqldump stderr:', stderr);
      }
      fs.writeFileSync(dbFilePath, stdout);

      // 2. Backup files (zip uploads folder)
      if (fs.existsSync(UPLOADS_DIR)) {
        await new Promise((resolve, reject) => {
          const output = fs.createWriteStream(zipFilePath);
          const archive = archiver('zip', { zlib: { level: 9 } });
          
          output.on('close', () => resolve(null));
          archive.on('error', reject);
          
          archive.pipe(output);
          archive.directory(UPLOADS_DIR, 'uploads');
          archive.finalize();
        });
      }

      // 3. Update last backup info
      const configPath = path.join(BACKUP_DIR, 'config.json');
      let config: BackupConfig = { autoBackup: false, frequency: 'daily', retention: 30, lastBackup: null, includeFiles: true };
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      }
      config.lastBackup = new Date().toISOString();
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      // 4. Hapus backup lama berdasarkan retention
      const retention = config.retention || 30;
      const files = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.endsWith('.sql') || f.endsWith('.zip'))
        .map(f => ({ name: f, mtime: fs.statSync(path.join(BACKUP_DIR, f)).mtime }))
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

      for (let i = retention; i < files.length; i++) {
        fs.unlinkSync(path.join(BACKUP_DIR, files[i].name));
      }

      return NextResponse.json({
        success: true,
        message: 'Backup berhasil dibuat',
        dbFile: dbFileName,
        zipFile: fs.existsSync(zipFilePath) ? zipFileName : null,
        dbSize: formatBytes(fs.statSync(dbFilePath).size),
        zipSize: fs.existsSync(zipFilePath) ? formatBytes(fs.statSync(zipFilePath).size) : null
      });
    } catch (error) {
      console.error('Backup error:', error);
      return NextResponse.json({ error: 'Gagal membuat backup' }, { status: 500 });
    }
  }

  // Update config
  if (action === 'config') {
    const body = await request.json();
    const { autoBackup, frequency, retention, includeFiles } = body;
    
    const configPath = path.join(BACKUP_DIR, 'config.json');
    let config = { autoBackup: false, frequency: 'daily', retention: 30, lastBackup: null, includeFiles: true };
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
    
    config.autoBackup = autoBackup ?? config.autoBackup;
    config.frequency = frequency ?? config.frequency;
    config.retention = retention ?? config.retention;
    config.includeFiles = includeFiles ?? config.includeFiles;
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    // Jika auto backup aktif, jadwalkan (nanti bisa pake node-cron)
    if (config.autoBackup) {
      console.log(`Auto backup enabled: ${config.frequency}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Konfigurasi backup disimpan'
    });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

// DELETE - Hapus backup file
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userCheck = await query(
    'SELECT role FROM users WHERE email = ?',
    [session.user.email]
  ) as { role: string }[];
  
  if (!userCheck[0] || userCheck[0].role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get('file');

  if (!fileName) {
    return NextResponse.json({ error: 'File name required' }, { status: 400 });
  }

  const filePath = path.join(BACKUP_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  fs.unlinkSync(filePath);
  return NextResponse.json({ success: true, message: 'Backup dihapus' });
}