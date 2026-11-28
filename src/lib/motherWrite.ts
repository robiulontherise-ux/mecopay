export type MotherWriteProfileInput = {
  name: string;
  phone: string;
  phone_type: 'whatsapp' | 'telegram' | 'both';
  nid_number: string;
  website_url?: string;
  social_fb?: string;
  social_insta?: string;
  social_li?: string;
  social_yt?: string;
  nid_front?: Blob | null;
  nid_back?: Blob | null;
  selfie?: Blob | null;
  profile_image?: Blob | null;
};

export type MotherWriteResponse = {
  ok: boolean;
  client_id: string;
  profile: Record<string, any>;
};

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}

export async function motherWriteProfile(input: MotherWriteProfileInput): Promise<MotherWriteResponse> {
  const form = new FormData();
  for (const key of ['name', 'phone', 'phone_type', 'nid_number', 'website_url', 'social_fb', 'social_insta', 'social_li', 'social_yt'] as const) {
    form.set(key, input[key] || '');
  }
  for (const key of ['nid_front', 'nid_back', 'selfie', 'profile_image'] as const) {
    const value = input[key];
    if (value) form.append(key, value, `${key}.webp`);
  }
  const response = await fetch('/api/mother-write', { method: 'POST', credentials: 'include', body: form });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Profile save failed');
  return body as MotherWriteResponse;
}

export function motherWriteMedia(kind: 'nid_front' | 'nid_back' | 'selfie' | 'profile_image') {
  return `/api/mother-write/media?kind=${encodeURIComponent(kind)}`;
}
