declare module 'multer-s3' {
  import { StorageEngine } from 'multer';
  import { S3Client } from '@aws-sdk/client-s3';

  interface Options {
    s3: S3Client;
    bucket: string;
    contentType?: any;
    key?: (
      req: any,
      file: Express.Multer.File,
      cb: (error: any, key: string) => void
    ) => void;
  }

  function multerS3(options: Options): StorageEngine;

  namespace multerS3 {
    const AUTO_CONTENT_TYPE: any;
  }

  export = multerS3;
}