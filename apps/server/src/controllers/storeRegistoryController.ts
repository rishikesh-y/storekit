import { Request, Response } from "express";
import { DappStoreRegistry } from "@merokudao/dapp-store-registry";

var utils = require("../utils/writer.js");

class StoreRegistory {
  constructor() {
    this.getStoreTitle = this.getStoreTitle.bind(this);
  }

  getStoreTitle = async (req: Request, res: Response) => {
    const DappStore = new DappStoreRegistry();
    await DappStore.init();
    DappStore.getRegistryTitle()
      .then(function (response: any) {
        utils.writeJson(res, response);
      })
      .catch(function (response: any) {
        utils.writeJson(res, response);
      });
  };
}

export default new StoreRegistory();
