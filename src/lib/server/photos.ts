import { get, put } from '@vercel/blob';
import { getSecret } from 'astro:env/server';

// Inspirational photos live in a private Vercel Blob store attached to the project
// (it injects BLOB_READ_WRITE_TOKEN). They are only ever served through /api/admin/photo.
export const photosConfigured = () => Boolean(getSecret('BLOB_READ_WRITE_TOKEN') || getSecret('BLOB_STORE_ID'));

export async function savePhoto(pathname: string, bytes: Buffer, contentType: string) {
  const blob = await put(pathname, bytes, { access: 'private', contentType, addRandomSuffix: true });
  return blob.pathname;
}

export async function readPhoto(pathname: string) {
  const result = await get(pathname, { access: 'private' });
  return result?.statusCode === 200 ? result : null;
}
