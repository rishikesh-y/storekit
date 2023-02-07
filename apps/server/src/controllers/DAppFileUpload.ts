/* eslint-disable turbo/no-undeclared-env-vars */
import { Request, Response } from "express";
import Dotenv from "dotenv";
import AWS from "aws-sdk";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

Dotenv.config();

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
    secretAccessKey: process.env.AWS_SECRET,
  },
});

export const getBuildDownloadPreSignedUrl = (dappId: string) => {
  return s3.getSignedUrl("getObject", {
    Bucket: process.env.BUCKET_NAME_PRIVATE,
    Key: `${dappId}/build.zip`,
    Expires: 60 * 15, // 15 minutes,
  });
};

class awsS3Controller {
  constructor() {
    this.getPreSignedBuildUrl = this.getPreSignedBuildUrl.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
  }

  /**
   * File upload to aws-s3 servers
   */
  fileUploads = async (req: Request, res: Response) => {
    const dappID = req.body.dappId;
    const field = req.body.field;

    let bucket = process.env.BUCKET_NAME_PUBLIC;
    let files: any = req.files;
    let contentType = files[0].mimetype;
    let contentDisposition = "inline";
    let key = `${dappID}/${field}`;
    let extension = ".png";
    let response;

    if (field === "build") {
      bucket = process.env.BUCKET_NAME_PRIVATE;

      if (contentType == "application/zip") {
        contentDisposition = "attachment; filename=build.zip";
        extension = ".zip";
      }

      if (contentType == "application/vnd.android.package-archive") {
        contentDisposition = "attachment; filename=build.apk";
        extension = ".apk";
      }
    } else {
      if (contentType == "image/jpeg") extension = ".jpeg";
      if (contentType == "image/webp") extension = ".webp";
      if (contentType == "image/svg") extension = ".svg";
      if (contentType == "image/jpg") extension = ".jpg";
      if (contentType == "image/png") extension = ".png";
    }

    key += extension;

    var buffers: [] = files.map(
      (element: { buffer: string }) => element.buffer
    );

    try {
      // maximum count for screenshots is 5
      if (field === "screenshots" && buffers.length <= 5) {
        for (var i = 0; i < buffers.length; i++) {
          const uploadCommand = new PutObjectCommand({
            Bucket: bucket,
            Key: `${dappID}/${field}-${i}${extension}`,
            Body: buffers[i],
            ContentType: contentType,
          });
          response = await s3Client.send(uploadCommand);
        }
        const url = getBuildDownloadPreSignedUrl(dappID);
        return res.status(200).json({ success: true, url: url });
      }
      // maximum count for logo, banner & dApp is 1
      if (buffers.length > 1)
        res.status(400).json({
          errors: [{ msg: "Maximum count for logo, banner, & dApp is 1" }],
        });
      else {
        const command = new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          ContentType: contentType,
        });
        response = await s3Client.send(command);
        const url = getBuildDownloadPreSignedUrl(dappID);
        return res.status(200).json({ success: true, url: url });
      }
    } catch (e) {
      return res.status(400).json({ errors: [{ msg: e.message }] });
    }
  };

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
}

export const DappFileUploadController = new awsS3Controller();
