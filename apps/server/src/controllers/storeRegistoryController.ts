import { Request, Response } from "express";
import { DappStoreRegistry } from "@merokudao/dapp-store-registry";

var utils = require("../utils/writer.js");
const DappStore = new DappStoreRegistry();

class StoreRegistory {
  constructor() {
    this.getStoreTitle = this.getStoreTitle.bind(this);
    this.getFeaturedDapps = this.getFeaturedDapps.bind(this);
  }

  getStoreTitle = async (req: Request, res: Response) => {
    try {
      await DappStore.init();
      const response = DappStore.getRegistryTitle();
      utils.writeJson(res, response);
    } catch (e) {
      utils.writeJson(res, e, 400);
    }
  };

  getFeaturedDapps = async (req: Request, res: Response) => {
    try {
      await DappStore.init();
      const response = DappStore.getFeaturedDapps();
      utils.writeJson(res, response);
    } catch (e) {
      utils.writeJson(res, e, 400);
    }
  };
}

export default new StoreRegistory();
