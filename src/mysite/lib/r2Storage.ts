import { supabase } from './supabaseClient';

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicDomain: string;
}

const R2_STORAGE_KEY = 'meco_r2_config';

export function getSavedR2Config(): R2Config | null {
  try {
    const raw = localStorage.getItem(R2_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch (e) {
    console.warn('Failed to parse cached R2 config', e);
  }
  return null;
}

export function saveR2Config(config: R2Config): void {
  try {
    localStorage.setItem(R2_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Failed to save R2 config to localStorage', e);
  }
}

/**
 * Upload a file to Cloudflare R2 bucket.
 * Falls back to Supabase storage if R2 is not configured or fails.
 */
export async function uploadImageToR2(
  file: File,
  folder: 'logos' | 'posts' | 'uploads' = 'uploads',
  overrideConfig?: R2Config | null
): Promise<{ url: string; provider: 'cloudflare_r2' | 'supabase_storage' }> {
  const r2Config = overrideConfig || getSavedR2Config();

  // Try Cloudflare R2 first via the backend /api/upload-r2 endpoint
  try {
    const fileBase64 = await fileToBase64(file);
    const response = await fetch('/api/upload-r2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileData: fileBase64,
        fileName: file.name,
        folder,
        r2Config: r2Config || undefined,
      }),
    });

    const result = await response.json();

    if (response.ok && result.success && result.url) {
      return {
        url: result.url,
        provider: 'cloudflare_r2',
      };
    }

    if (result.error === 'MISSING_R2_CREDENTIALS') {
      console.warn('R2 not configured on server/client. Trying Supabase storage fallback...');
    } else {
      console.warn('R2 upload failed with response:', result);
    }
  } catch (r2Err) {
    console.warn('R2 upload request error, falling back to Supabase storage:', r2Err);
  }

  // Fallback to Supabase Storage
  const fileExt = file.name.split('.').pop() || 'png';
  const fileName = `${folder}_${Math.random().toString(36).substring(2, 9)}_${Date.now()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage.from('post_img').upload(fileName, file);
  if (uploadError) {
    throw new Error(
      `Upload failed: Cloudflare R2 credentials are not set, and Supabase storage error: ${uploadError.message}`
    );
  }

  const { data: publicUrlData } = supabase.storage.from('post_img').getPublicUrl(fileName);
  return {
    url: publicUrlData.publicUrl,
    provider: 'supabase_storage',
  };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
