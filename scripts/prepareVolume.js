// On Railway, the persistent volume is mounted at RAILWAY_VOLUME_MOUNT_PATH.
// This app only gets ONE volume, so both the database and uploaded car photos
// live under it as subfolders. This script symlinks public/uploads into the
// volume's uploads/ subfolder so uploaded images survive redeploys, since
// everything outside the volume mount is rebuilt fresh from git on each deploy.
const fs = require("fs");
const path = require("path");

// SQLite won't create missing parent directories for its db file, so make sure
// wherever DATABASE_URL points to (e.g. a "db" subfolder on the volume) exists
// before Prisma tries to open/migrate it.
const dbUrl = process.env.DATABASE_URL;
if (dbUrl && dbUrl.startsWith("file:")) {
  const dbPath = dbUrl.slice("file:".length);
  const absoluteDbPath = path.isAbsolute(dbPath) ? dbPath : path.join(process.cwd(), dbPath);
  fs.mkdirSync(path.dirname(absoluteDbPath), { recursive: true });
}

const volumePath = process.env.RAILWAY_VOLUME_MOUNT_PATH;

if (!volumePath) {
  // No volume mounted (local dev, or a platform other than Railway) — nothing to do.
  process.exit(0);
}

const uploadsTarget = path.join(volumePath, "uploads");
const uploadsLink = path.join(process.cwd(), "public", "uploads");

fs.mkdirSync(uploadsTarget, { recursive: true });

const linkStat = fs.existsSync(uploadsLink) ? fs.lstatSync(uploadsLink) : null;

if (linkStat?.isSymbolicLink()) {
  const current = fs.readlinkSync(uploadsLink);
  if (path.resolve(path.dirname(uploadsLink), current) === uploadsTarget) {
    process.exit(0); // already linked correctly
  }
  fs.unlinkSync(uploadsLink);
} else if (linkStat) {
  // A real directory from the fresh build (e.g. just the committed .gitkeep) — replace it.
  fs.rmSync(uploadsLink, { recursive: true, force: true });
}

fs.symlinkSync(uploadsTarget, uploadsLink, "junction");
console.log(`Linked ${uploadsLink} -> ${uploadsTarget}`);
