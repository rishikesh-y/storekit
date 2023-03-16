/* eslint-disable turbo/no-undeclared-env-vars */
import { Request, Response } from "express";
import Dotenv from "dotenv";
import AWS from "aws-sdk";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from 'fs';

Dotenv.config();

// loading the ipfs-core package using dynamic import function.
async function loadIpfs () {
  const { create } = await import('ipfs-core')
  const node = await create()
  return node
}

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
  private isIPFSLoaded = false;
  private ipfs;
  constructor() {
    this.getPreSignedBuildUrl = this.getPreSignedBuildUrl.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
  }

  fileUploads = async (req: Request, res: Response) => {
    const dappID = req.body.dappId;
    const field = req.body.field;

    let bucket = process.env.BUCKET_NAME_PUBLIC;
    let files: any = req.files;
    let contentType = files[0].mimetype;
    let contentDisposition = "inline";
    let key = `${dappID}/${field}`;
    let extension = ".png";

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

    try {
      // maximum count for screenshots is 5
      if (field === "screenshots" && req.files.length <= 5) {
        const urls: {fileName: string; url: string}[] = [];
        for (let i = 0; i < req.files.length; i++) {
          const filePath = req.files[i].path;
          let url;
          if(process.env.UPLOAD_SERVICE === 'ipfs'){
            url = await this.fileUploadToIPFS(filePath);
          }else{
            const key = `${dappID}/${field}-${i}${extension}`;
            url = await this.fileUploadsToS3(bucket, key, contentType, filePath);
          }
          urls.push({
            fileName: req.files[i].originalname,
            url: url
          })
        }
        return res.status(200).json({ success: true, data: urls });
      }
      // maximum count for logo, banner & dApp is 1
      if (req.files.length > 1)
        res.status(400).json({
          errors: [{ msg: "Maximum count for logo, banner, & dApp is 1" }],
        });
      else {
        const filePath = req.files[0].path;
        let url;
        if(process.env.UPLOAD_SERVICE === 'ipfs'){
          url = await this.fileUploadToIPFS(filePath);
        }else{
          url = await this.fileUploadsToS3(bucket, key, contentType, filePath);
        }
        return res.status(200).json({ success: true, data: {
          fileName : req.files[0].originalname,
          url : url
        }});
      }
    } catch (e) {
      return res.status(400).json({ errors: [{ msg: e.message }] });
    }
  }

  /**
   * File upload to aws-s3 servers
   */
  private fileUploadsToS3 = async (bucket: string, key: string, contentType: string, filePath: string) => {
    try {
      const uploadCommand = {
        Bucket: bucket,
        Key: key,
        Body: fs.createReadStream(filePath),
        ContentType: contentType,
      };
      const response = await s3.upload(uploadCommand).promise();
      return response.Location;
    } catch (e) {
      return e;
    }
  };

  /**
   * File upload to IPFS
   */
  private fileUploadToIPFS = async (filePath: string) => {
    try {
      if(!this.isIPFSLoaded){
        this.ipfs = await loadIpfs();
        this.isIPFSLoaded = true;
      }
      const fileData = fs.createReadStream(filePath);
      const response = await this.ipfs.add(fileData);
      const url = `https://ipfs.io/ipfs/${response.path}`
      return url;
    } catch (e) {
      return e;
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
