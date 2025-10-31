import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (supabaseClient) return supabaseClient;
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !anonKey) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  }
  supabaseClient = createClient(url, anonKey, { auth: { persistSession: false } });
  return supabaseClient;
}

export interface UploadOptions {
  bucket?: string;
  path?: string;
  contentType?: string;
  upsert?: boolean;
}

export class StorageService {
  /**
   * Check if Supabase is properly configured
   */
  static isSupabaseConfigured(): boolean {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    return !!(url && anonKey);
  }

  /**
   * Delete a file from storage
   */
  static async deleteFile(path: string, bucket?: string): Promise<void> {
    if (!this.isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }
    const supabase = getSupabase();
    const bucketName = bucket || (import.meta.env.VITE_SUPABASE_CERT_BUCKET as string) || 'certificates';
    const { error } = await supabase.storage.from(bucketName).remove([path]);
    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  static async uploadPublicFile(blob: Blob, options: UploadOptions = {}): Promise<{ publicUrl: string; path: string; bucket: string; }> {
    if (!this.isSupabaseConfigured()) {
      throw new Error('Supabase not configured. Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
    }
    const supabase = getSupabase();
    const bucket = options.bucket || (import.meta.env.VITE_SUPABASE_BUCKET as string) || 'public';
    const contentType = options.contentType || blob.type || 'application/octet-stream';

    const defaultFileName = `file-${Date.now()}`;
    const path = options.path || `${defaultFileName}`;

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from(bucket)
      .upload(path, blob, { contentType, upsert: options.upsert ?? true });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(uploadData?.path || path);

    if (!data?.publicUrl) {
      throw new Error('Failed to resolve public URL');
    }

    return { publicUrl: data.publicUrl, path: uploadData?.path || path, bucket };
  }

  static async uploadCertificateBlob(blob: Blob, filename: string, userId?: string): Promise<{ publicUrl: string; path: string }> {
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uid = userId || StorageService.getCurrentUserId();
    const datePrefix = new Date().toISOString().slice(0, 10);
    const path = `${uid}/${datePrefix}/${Date.now()}-${safeName}`;
    const { publicUrl, path: uploadedPath } = await StorageService.uploadPublicFile(blob, {
      bucket: (import.meta.env.VITE_SUPABASE_CERT_BUCKET as string) || 'certificates',
      path,
      contentType: blob.type || (safeName.toLowerCase().endsWith('.png') ? 'image/png' : 'application/pdf'),
      upsert: true
    });
    return { publicUrl, path: uploadedPath };
  }

  private static getCurrentUserId(): string {
    try {
      const userData = localStorage.getItem('speakbee_current_user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id || 'anonymous';
      }
    } catch {
      /* ignore */
    }
    return 'anonymous';
  }
}

export default StorageService;


