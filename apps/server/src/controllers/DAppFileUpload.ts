/* eslint-disable turbo/no-undeclared-env-vars */
import { Request, Response } from "express";
import Dotenv from "dotenv";
import AWS from "aws-sdk";
import { S3Client } from "@aws-sdk/client-s3";
import fs from "fs";
import { DappStoreRegistry } from "@merokudao/dapp-store-registry";
import { ThirdwebStorage } from "@thirdweb-dev/storage";

Dotenv.config();
const DappStore = new DappStoreRegistry();

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

export const getDownloadURL = async (dappId: string) => {
  await DappStore.init();
  const dapp = DappStore.searchByDappId(dappId);
  if (dapp[0].downloadBaseUrls) {
    const isDownloadBaseUrlContainsS3 =
      dapp[0].downloadBaseUrls[
        dapp[0].downloadBaseUrls.length - 1
      ].url.includes("s3");
    const isDownloadBaseUrlContainsIpfs =
      dapp[0].downloadBaseUrls[
        dapp[0].downloadBaseUrls.length - 1
      ].url.includes("ipfs");
    if (isDownloadBaseUrlContainsS3) {
      return s3.getSignedUrl("getObject", {
        Bucket: process.env.BUCKET_NAME_PRIVATE,
        Key: `${dappId}/build.zip`,
        Expires: 60 * 15, // 15 minutes,
      });
    } else if (isDownloadBaseUrlContainsIpfs) {
      const url =
        dapp[0].downloadBaseUrls[dapp[0].downloadBaseUrls.length - 1].url;
      return url;
    }
  }
};

class awsS3Controller {
  private ipfs;
  constructor() {
    this.ipfs = new ThirdwebStorage();
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
        const urls: { fileName: string; url: string }[] = [];
        for (let i = 0; i < req.files.length; i++) {
          const filePath = req.files[i].path;
          const key = `${dappID}/${field}-${i}${extension}`;
          const url = await this.uploadingFileBasedOnUploadService(
            bucket,
            key,
            contentType,
            filePath
          );
          urls.push({
            fileName: req.files[i].originalname,
            url: url,
          });
        }
        return res.status(200).json({ success: true, data: urls });
      } else if (field === "screenshots" && req.files.length > 5) {
        res.status(400).json({
          errors: [{ msg: "Maximum count for screenshots is 5" }],
        });
      }
      // maximum count for logo, banner & dApp is 1
      if (req.files.length > 1)
        res.status(400).json({
          errors: [{ msg: "Maximum count for logo, banner, & dApp is 1" }],
        });
      else {
        const filePath = req.files[0].path;
        const url = await this.uploadingFileBasedOnUploadService(
          bucket,
          key,
          contentType,
          filePath,
          field,
          dappID
        );
        return res.status(200).json({
          success: true,
          data: [
            {
              fileName: req.files[0].originalname,
              url: url,
            },
          ],
        });
      }
    } catch (e) {
      return res.status(400).json({ errors: [{ msg: e.message }] });
    }
  };

  /**
   * Uploading file based on the UPLOAD_SERVICE env variable by default it will upload on ipfs.
   */
  private uploadingFileBasedOnUploadService = async (
    bucket: string,
    key: string,
    contentType: string,
    filePath: string,
    field?: string,
    dappId?: string
  ) => {
    const uploadService = process.env.UPLOAD_SERVICE
      ? process.env.UPLOAD_SERVICE
      : "ipfs";
    switch (uploadService) {
      case "aws-s3":
        return await this.fileUploadsToS3(
          bucket,
          key,
          contentType,
          filePath,
          field,
          dappId
        );
      case "ipfs":
        return await this.fileUploadToIPFS(filePath);
      default:
        return await this.fileUploadToIPFS(filePath);
    }
  };

  /**
   * File upload to aws-s3 servers
   */
  private fileUploadsToS3 = async (
    bucket: string,
    key: string,
    contentType: string,
    filePath: string,
    field: string,
    dappId: string
  ) => {
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
      const fileData = fs.readFileSync(filePath);
      const response = await this.ipfs.upload(fileData);
      const url = this.ipfs.resolveScheme(response)
      console.log(url);
      return url;
    } catch (e) {
      return e;
    }
  };

  /**
   * Get file presigned url from aws-s3 servers
   * @param params eg: { Bucket: "bucketName", Key: "objectKey",}
   */
  getPreSignedBuildUrl = async (req: Request, res: Response) => {
    try {
      const url = await getDownloadURL(req.params.dappId);

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
