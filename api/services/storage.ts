import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${required("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: required("R2_ACCESS_KEY_ID"),
    secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
  },
});

export const R2_BUCKET = process.env.R2_BUCKET_NAME ?? "";

export function photoKey(periodSlug: string, photoId: string, ext: string): string {
  return `photos/${periodSlug}/${photoId}.${ext}`;
}

/** Public URL untuk foto. Falls back ke endpoint API bila R2_PUBLIC_URL belum diset. */
export function publicUrlFor(key: string, photoId: string): string {
  const base = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  return base ? `${base}/${key}` : `/api/photos/${photoId}/file`;
}

export async function putPhoto(key: string, body: Uint8Array, contentType: string): Promise<void> {
  if (!R2_BUCKET) throw new Error("R2_BUCKET_NAME is not set");
  await s3.send(
    new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: body, ContentType: contentType }),
  );
}

export async function deletePhoto(key: string): Promise<void> {
  if (!R2_BUCKET) throw new Error("R2_BUCKET_NAME is not set");
  await s3.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}
export async function getPhotoBytes(key: string): Promise<{ bytes: Uint8Array; contentType?: string }> {
  if (!R2_BUCKET) throw new Error("R2_BUCKET_NAME is not set");
  const out = await s3.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }));
  const bytes = await out.Body!.transformToByteArray();
  return { bytes, contentType: out.ContentType };
}
