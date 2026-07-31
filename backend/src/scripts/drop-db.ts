import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

async function dropDatabase() {
  console.log('🗑️  Đang tiến hành xóa và khởi tạo lại Cơ sở dữ liệu (Drop DB)...');

  const backendDir = process.cwd();
  const dbPath = path.join(backendDir, 'prisma', 'dev.db');
  const journalPath = path.join(backendDir, 'prisma', 'dev.db-journal');
  const coversDir = path.join(backendDir, 'public', 'covers');

  // Delete SQLite database files
  if (fs.existsSync(dbPath)) {
    try {
      fs.unlinkSync(dbPath);
      console.log('✔ Đã xóa file cơ sở dữ liệu: prisma/dev.db');
    } catch (err: any) {
      console.warn('⚠️  Không thể xóa dev.db trực tiếp (có thể DB đang được mở):', err.message);
    }
  }

  if (fs.existsSync(journalPath)) {
    try {
      fs.unlinkSync(journalPath);
    } catch {}
  }

  // Clear cached covers
  if (fs.existsSync(coversDir)) {
    try {
      const files = fs.readdirSync(coversDir);
      for (const file of files) {
        fs.unlinkSync(path.join(coversDir, file));
      }
      console.log('✔ Đã dọn dẹp bộ nhớ đệm ảnh bìa (public/covers)');
    } catch {}
  }

  // Run Prisma db push to recreate fresh schema
  try {
    console.log('⏳ Đang tạo lại Schema cơ sở dữ liệu trống...');
    execSync('npx prisma db push --force-reset', { stdio: 'inherit', cwd: backendDir });
    console.log('🎉 Reset cơ sở dữ liệu hoàn tất thành công!');
  } catch (err: any) {
    console.error('❌ Lỗi khi khởi tạo lại schema:', err.message);
  }
}

dropDatabase();
