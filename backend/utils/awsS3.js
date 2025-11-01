import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Validate AWS configuration
const validateAWSConfig = () => {
  if (!process.env.AWS_REGION) {
    throw new Error("AWS_REGION environment variable is not set");
  }
  if (!process.env.AWS_ACCESS_KEY_ID) {
    throw new Error("AWS_ACCESS_KEY_ID environment variable is not set");
  }
  if (!process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error("AWS_SECRET_ACCESS_KEY environment variable is not set");
  }
  if (!process.env.AWS_S3_BUCKET) {
    throw new Error("AWS_S3_BUCKET environment variable is not set");
  }
};

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
}) {
  validateAWSConfig();
  
  if (!bucket) {
    throw new Error("Bucket name is required");
  }
  if (!key) {
    throw new Error("Key is required");
  }
  if (!contentType) {
    throw new Error("Content type is required");
  }

  // Note: ACL is deprecated in favor of bucket policies
  // Removing ACL parameter to avoid errors
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  try {
    const url = await getSignedUrl(s3, command, { expiresIn });
    return url;
  } catch (error) {
    console.error("S3 Presigned URL Error:", error);
    throw new Error(`Failed to create presigned URL: ${error.message}`);
  }
}

export function buildPublicUrl({ bucket, key, region }) {
  if (!bucket || !key) {
    throw new Error("Bucket and key are required for public URL");
  }
  
  const bucketRegion = region || process.env.AWS_REGION || "us-east-1";
  
  // For us-east-1, use the simpler URL format
  if (bucketRegion === "us-east-1") {
    return `https://${bucket}.s3.amazonaws.com/${key}`;
  }
  
  // For other regions, use region-specific URL format
  return `https://${bucket}.s3.${bucketRegion}.amazonaws.com/${key}`;
}

export default s3;

