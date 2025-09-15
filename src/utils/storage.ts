import { Env } from '../types';

export async function uploadToR2(
  bucket: R2Bucket,
  file: File,
  key: string
): Promise<string> {
  await bucket.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
  });

  return key;
}

export async function getFromR2(
  bucket: R2Bucket,
  key: string
): Promise<R2Object | null> {
  return await bucket.get(key);
}

export async function deleteFromR2(
  bucket: R2Bucket,
  key: string
): Promise<void> {
  await bucket.delete(key);
}

export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `${timestamp}-${randomStr}.${extension}`;
}