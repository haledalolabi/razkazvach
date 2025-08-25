import fs from "fs/promises";
import path from "path";

export interface StorageAdapter {
  putObject(key: string, data: Buffer | Uint8Array): Promise<void>;
  getUrl(key: string): string;
  deleteObject(key: string): Promise<void>;
}

const baseDir = path.resolve(
  process.cwd(),
  process.env.ASSETS_DIR ?? "uploads",
);
const publicBase = process.env.ASSETS_PUBLIC_BASE || "/api/assets";

export const LocalStorage: StorageAdapter = {
  async putObject(key, data) {
    const filePath = path.join(baseDir, key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, data);
  },
  getUrl(key) {
    return `${publicBase}/${key.split("/").map(encodeURIComponent).join("/")}`;
  },
  async deleteObject(key) {
    const filePath = path.join(baseDir, key);
    await fs.rm(filePath, { force: true });
  },
};
