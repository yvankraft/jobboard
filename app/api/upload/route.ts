import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = session?.user?.role;
  if (!session || (role !== "ADMIN" && role !== "INSTRUCTOR")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN non configuré" },
      { status: 503 },
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Format non supporté" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Fichier trop lourd (5 Mo max)" },
      { status: 400 },
    );
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const blob = await put(`covers/${Date.now()}-${safeName}`, file, {
    access: "public",
  });
  return NextResponse.json({ url: blob.url });
}
