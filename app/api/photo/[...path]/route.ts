import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { PHOTOS_DIR } from "@/lib/store";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  // Defend against traversal.
  if (parts.some((p) => p.includes("..") || p.includes("/"))) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  const fp = path.join(PHOTOS_DIR, ...parts);
  if (!fp.startsWith(PHOTOS_DIR)) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  try {
    const buf = await fs.readFile(fp);
    const ext = path.extname(fp).toLowerCase();
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": TYPES[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
