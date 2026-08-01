const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "..", "prisma", "dev.db");
const backupsDir = path.join(__dirname, "..", "backups");

if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupPath = path.join(backupsDir, `dev-backup-${timestamp}.db`);

fs.copyFileSync(dbPath, backupPath);
console.log(`Backup created: ${backupPath}`);

// Keep only the last 30 backups to avoid filling up disk space
const files = fs.readdirSync(backupsDir)
  .filter((f) => f.startsWith("dev-backup-"))
  .sort();

if (files.length > 30) {
  const toDelete = files.slice(0, files.length - 30);
  toDelete.forEach((f) => fs.unlinkSync(path.join(backupsDir, f)));
  console.log(`Cleaned up ${toDelete.length} old backup(s)`);
}