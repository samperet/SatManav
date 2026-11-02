import { get, put } from '@vercel/blob';

// Inspirational photos from the Journey form live in the private "satmanav-photos"
// Blob store (Vercel → Storage). BLOB_READ_WRITE_TOKEN is set by the store itself.

export const photosConfigured = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

/** Upload one photo; returns its pathname (what we keep in leads.photos). */
export async function putPhoto(pathname: string, bytes: Buffer, contentType: string) {
  const blob = await put(pathname, bytes, { access: 'private', contentType, addRandomSuffix: false });
  return blob.pathname;
}

/** Admin-only URL that streams the photo through our own server (the store is private). */
export const photoUrl = (pathname: string) => `/api/admin/photo?p=${encodeURIComponent(pathname)}`;

/** Fetch a private photo for an authenticated admin. */
export async function readPhoto(pathname: string) {
  const res = await get(pathname, { access: 'private' });
  if (!res || res.statusCode !== 200 || !res.stream) return null;
  return { stream: res.stream, contentType: res.blob.contentType ?? 'application/octet-stream', size: res.blob.size };
}
