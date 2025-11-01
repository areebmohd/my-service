import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const validateAWSConfig = () => {
  const errors = [];
  
  if (!process.env.AWS_REGION || process.env.AWS_REGION.trim() === "") {
    errors.push("AWS_REGION environment variable is not set or is empty");
  }
  if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID.trim() === "") {
    errors.push("AWS_ACCESS_KEY_ID environment variable is not set or is empty");
  }
  if (!process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY.trim() === "") {
    errors.push("AWS_SECRET_ACCESS_KEY environment variable is not set or is empty");
  }
  if (!process.env.AWS_S3_BUCKET || process.env.AWS_S3_BUCKET.trim() === "") {
    errors.push("AWS_S3_BUCKET environment variable is not set or is empty");
  }
  
  if (errors.length > 0) {
    throw new Error(`AWS Configuration Error: ${errors.join(". ")}`);
  }
};

let s3Client = null;

const getS3Client = () => {
  if (!s3Client) {
    validateAWSConfig();
    
    const config = {
      region: process.env.AWS_REGION.trim(),
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID.trim(),
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY.trim(),
      },
    };
    
    if (process.env.AWS_SESSION_TOKEN && process.env.AWS_SESSION_TOKEN.trim() !== "") {
      config.credentials.sessionToken = process.env.AWS_SESSION_TOKEN.trim();
    }
    
    s3Client = new S3Client(config);
  }
  
  return s3Client;
};

export async function createPresignedUpload({
  bucket,
  key,
  contentType,
  expiresIn = 60,
}) {
  const s3 = getS3Client();
  
  if (!bucket || bucket.trim() === "") {
    throw new Error("Bucket name is required");
  }
  if (!key || key.trim() === "") {
    throw new Error("Key is required");
  }
  if (!contentType || contentType.trim() === "") {
    throw new Error("Content type is required");
  }

  const command = new PutObjectCommand({
    Bucket: bucket.trim(),
    Key: key.trim(),
    ContentType: contentType.trim(),
  });

  try {
    const url = await getSignedUrl(s3, command, { expiresIn });
    return url;
  } catch (error) {
    console.error("S3 Presigned URL Error Details:", {
      message: error.message,
      name: error.name,
      code: error.code,
      region: process.env.AWS_REGION,
      bucket: bucket,
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
    });
    throw new Error(`Failed to create presigned URL: ${error.message}`);
  }
}

export async function uploadFileToS3({ bucket, key, contentType, body }) {
  const s3 = getS3Client();
  
  if (!bucket || bucket.trim() === "") {
    throw new Error("Bucket name is required");
  }
  if (!key || key.trim() === "") {
    throw new Error("Key is required");
  }
  if (!contentType || contentType.trim() === "") {
    throw new Error("Content type is required");
  }
  if (!body) {
    throw new Error("File body is required");
  }

  const command = new PutObjectCommand({
    Bucket: bucket.trim(),
    Key: key.trim(),
    ContentType: contentType.trim(),
    Body: body,
  });

  try {
    const result = await s3.send(command);
    return result;
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  }
}

export function buildPublicUrl({ bucket, key, region }) {
  if (!bucket || !key) {
    throw new Error("Bucket and key are required for public URL");
  }
  
  const bucketRegion = region || process.env.AWS_REGION || "us-east-1";
  
  if (bucketRegion === "us-east-1") {
    return `https://${bucket}.s3.amazonaws.com/${key}`;
  }
  
  return `https://${bucket}.s3.${bucketRegion}.amazonaws.com/${key}`;
}
    
export async function getFileFromS3({ bucket, key }) {
  const s3 = getS3Client();
  
  if (!bucket || bucket.trim() === "") {
    throw new Error("Bucket name is required");
  }
  if (!key || key.trim() === "") {
    throw new Error("Key is required");
  }

  const command = new GetObjectCommand({
    Bucket: bucket.trim(),
    Key: key.trim(),
  });

  try {
    const result = await s3.send(command);
    return result;
  } catch (error) {
    console.error("S3 Get File Error:", error);
    throw new Error(`Failed to get file from S3: ${error.message}`);
  }
}

export default getS3Client;

