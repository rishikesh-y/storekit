import { Request, Response } from "express";
import Dotenv from "dotenv";
import AWS from "aws-sdk";
import Debug from "debug";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

Dotenv.config();

const debug = Debug("meroku:server");

const s3 = new AWS.S3({
  signatureVersion: "v4",
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
  region: process.env.AWS_S3_REGION,
});

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET
  }
});

export const getBuildDownloadPreSignedUrl = (dappId: string) => {
  return s3.getSignedUrl("getObject", {
  Bucket: process.env.BUCKET_NAME_PRIVATE,
  Key: `${dappId}/build.zip`,
  Expires: 60 * 15 // 15 minutes,
});
};

class awsS3Controller {
  constructor() {
    this.getPreSignedBuildUrl = this.getPreSignedBuildUrl.bind(this);
    this.updateFile = this.updateFile.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
  }

  /**
  * File upload to aws-s3 servers
  */
 preSignedUrlUpload = async (req: Request, res: Response) => {
    const dappID = req.params.dappId;
    const field = req.params.field;

    let bucket = process.env.BUCKET_NAME_PUBLIC;
    let contentType = 'image/*';
    let contentDisposition = 'inline';
    let key = `${dappID}/${field}`;

    if (field === "build") {
      bucket = process.env.BUCKET_NAME_PRIVATE;
      contentType = 'application/zip';
      contentDisposition = 'attachment; filename=build.zip';
      key += '.zip';
    } else {
      key += '.png';
    }

    try {
      if (field === "screenshots") {
        const urls = new Array<string>();
        for (const x of [...Array(5).keys()]) {
          urls.push(await getSignedUrl(s3Client, new PutObjectCommand({
            Bucket: bucket,
            Key: `${dappID}/${field}-${x}.png`,
            ContentType: contentType
          }), { expiresIn: 60 * 15 }));
        }
        return res.status(200).json({ success: true, urls: urls });
      }

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType
      })
      const url = await getSignedUrl(s3Client, command, { expiresIn: 60 * 15 });
      return res.status(200).json({ success: true, url: url });
    } catch (e) {
      return res.status(400).json({ errors: [{ msg: e.message }] });
    }
 }

  /**
  * Get file presigned url from aws-s3 servers
  * @param params eg: { Bucket: "bucketName", Key: "objectKey",}
  */
  getPreSignedBuildUrl = async (req: Request, res: Response) => {
    try {
      const url = getBuildDownloadPreSignedUrl(req.params.dappId);

      return res.status(200).json({ success: true, url: url });
    } catch (e) {
      return res.status(400).json({ errors: [{ msg: e.message }] });
    }
  };

  /**
  * Update file from aws s3 servers
  * @param params eg: { Bucket: "bucketName", Key: "objectKey",} & file
  */

  updateFile = async (req: Request, res: Response) => {
    const params: AWS.S3.DeleteObjectRequest = {
      Bucket: process.env.BUCKET_NAME_PRIVATE,
      Key: <string>req.body.dappId,
    };

    try {
      await s3
        .deleteObject(params)
        .promise()
        .then(() => {
        });

      return res.status(200).json({ success: true, file: req.file });
    } catch (e) {
      return res.status(400).json({ errors: [{ msg: e.message }] });
    }
  };

  /**
  * Delete file from aws s3 servers
  * @param params eg: { Bucket: "bucketName", Key: "objectKey",}
  */
  deleteFile = async (req: Request, res: Response) => {
    const params: AWS.S3.DeleteObjectRequest = {
      Bucket: process.env.BUCKET_NAME_PRIVATE,
      Key: <string>req.body.dappId,
    };
    try {
      const response = await s3.deleteObject(params).promise();
      return res.json(response);
    } catch (e) {
      return res.status(400).json({ errors: [{ msg: e.message }] });
    }
  };

  /**
  * Get only metadata of a file without loading it
  * @param s3Data eg: { Bucket: "bucketName", Key: "objectKey", ACL: "public-read",
                    Body: JSON.stringify(dataObject), ContentType: "application/json",
                    Metadata: { email: "sample@gmail.com", dappId: "300",},
                }
  */
  getMetaData = async (s3Data: AWS.S3.HeadObjectRequest) => {
    try {
      await s3.headObject(s3Data).promise();
    } catch (e) {
      debug(e.message);
    }
  };
}

export const DappFileUploadController = new awsS3Controller();