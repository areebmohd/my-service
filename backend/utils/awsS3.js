import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN || undefined,
  },
});

export async function createPresignedUpload({
  bucket,
  key,
  contentType,
  expiresIn = 60,
  acl = "public-read",
}) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
    ACL: acl,
  });

  const url = await getSignedUrl(s3, command, { expiresIn });
  return url;
}

export function buildPublicUrl({ bucket, key }) {
  return `https://${bucket}.s3.amazonaws.com/${key}`;
}

export default s3;

