import { promises as fs } from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

type UploadFolder = 'products' | 'proofs' | 'assets';

function safeName(originalName: string) {
  const ext = path.extname(originalName || '').toLowerCase() || '.bin';
  return `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
}

export async function saveUpload(file: File | null, folder: UploadFolder) {
  if (!file || file.size === 0) return null;

  const bytes = Buffer.from(await file.arrayBuffer());
  const name = safeName(file.name);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'loja-premium';

  // Produção: Supabase Storage. Em Vercel, não use armazenamento local para uploads.
  if (supabaseUrl && serviceKey && !supabaseUrl.includes('YOUR_PROJECT_REF')) {
    const supabase = createClient(supabaseUrl, serviceKey);
    const objectPath = `${folder}/${name}`;
    const { error } = await supabase.storage.from(bucket).upload(objectPath, bytes, {
      contentType: file.type || 'application/octet-stream',
      upsert: false
    });
    if (error) throw new Error(`Erro ao enviar ficheiro para Supabase: ${error.message}`);
    const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
    return data.publicUrl;
  }

  // Desenvolvimento local: salva em public/uploads.
  const dir = path.join(process.cwd(), 'public', 'uploads', folder);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), bytes);
  return `/uploads/${folder}/${name}`;
}
