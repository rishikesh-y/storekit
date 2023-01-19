import { DappStoreRegistry } from "@merokudao/dapp-store-registry";
import { Request, Response } from "express";
import Debug from "debug";
import { DappInstall } from "../entities/dappInstall.entity";
import { getBuildDownloadPreSignedUrl } from "./dappFileUploadController";

const debug = Debug("meroku:analyticsController")

class AnalyticsController {

  private registry = new DappStoreRegistry();

  constructor() {
    this.download = this.download.bind(this);
    this.goto = this.goto.bind(this);
  }

  async goto(req: Request, res: Response) {
    const { dappId } = req.params;
    const userId = req.query.userId as string;
    const userAddress = req.query.userAddress as string;
    await this.registry.init();
    const dapps = await this.registry.dApps();
    const dapp = dapps.find(dapp => dapp.dappId === dappId);
    if (!dapp) {
      return res.status(404).send("dApp Not found");
    }
    if (!dapp.appUrl ||
      dapp.appUrl.endsWith(".zip") ||
      dapp.appUrl.endsWith(".apk")) {
      return res.status(404).send("No App URL found");
    }
    await DappInstall.registerVisit(
      dappId,
      dapp.version,
      dapp.category,
      userId,
      userAddress,
      req.headers['user-agent'] || ""
    );
    return res.redirect(dapp.appUrl);
  }

  async download(req: Request, res: Response) {
    const { dappId } = req.params;
    const userId = req.query.userId as string;
    const userAddress = req.query.userAddress as string;
    await this.registry.init();
    const dapps = await this.registry.dApps();
    const dapp = dapps.find(dapp => dapp.dappId === dappId);
    if (!dapp) {
      return res.status(404).send("dApp Not found");
    }
    if (!dapp.appUrl ||
      (!dapp.appUrl.endsWith(".zip") && !dapp.appUrl.endsWith(".apk"))) {
      return res.status(404).send("No App Download URL found");
    }
    await DappInstall.registerInstall(
      dappId,
      dapp.version,
      dapp.category,
      userId,
      userAddress,
      req.headers['user-agent'] || ""
    );
    const url = getBuildDownloadPreSignedUrl(dappId);
    return res.redirect(url);
  }

}

export const analyticsController = new AnalyticsController();
