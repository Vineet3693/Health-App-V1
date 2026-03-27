import { S3 } from 'aws-sdk';
import appConfig from './app.config';

const awsConfig = appConfig.aws;

export const s3 = new S3({
  accessKeyId: awsConfig.accessKeyId,
  secretAccessKey: awsConfig.secretAccessKey,
  region: awsConfig.region,
});

export const s3Config = {
  bucket: awsConfig.s3Bucket,
  region: awsConfig.region,
};

export default s3Config;
