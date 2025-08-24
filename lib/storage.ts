import fs from "fs/promises";
import path from "path";

export interface StorageAdapter {
  putObject(key: string, data: Buffer | Uint8Array): Promise<void>;
  getUrl(key: string): string;
  deleteObject(key: string): Promise<void>;
}

const baseDir = process.env.ASSETS_DIR || "./uploads";
const publicBase = process.env.ASSETS_PUBLIC_BASE || "/api/assets";

export const LocalStorage: StorageAdapter = {
  async putObject(key, data) {
    const p = path.join(baseDir, key);
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, data);
  },
  getUrl(key) {
    return `${publicBase}/${encodeURIComponent(key)}`;
  },
  async deleteObject(key) {
    const p = path.join(baseDir, key);
    await fs.rm(p, { force: true });
  },
};
