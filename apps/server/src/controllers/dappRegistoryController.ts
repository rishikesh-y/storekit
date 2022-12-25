import { Request, Response } from "express";
import { DAppSchema, FilterOptions } from "@merokudao/dapp-store-registry";
import { DappStoreRegistry } from "@merokudao/dapp-store-registry";

var utils = require("../utils/writer.js");

const DappStore = new DappStoreRegistry();

class DappRegistory {
  constructor() {
    this.getDapps = this.getDapps.bind(this);
    this.addDapp = this.addDapp.bind(this);
    this.updateDapp = this.updateDapp.bind(this);
    this.deleteDapp = this.deleteDapp.bind(this);
    this.getFeaturedDapps = this.getFeaturedDapps.bind(this);
  }

  getDapps = async (req: Request, res: Response) => {
    await DappStore.init();
    var filterOpts: FilterOptions = {};

    console.log(req.query.minAge);
    try {
      if (req.query.isMatureContent) {
        filterOpts.forMatureAudience = true;
      }

      if (req.query.minAge) {
        const minAge = <string>req.query.minAge;
        filterOpts.minAge = parseInt(minAge);
      }

      if (req.query.chainId) {
        filterOpts.chainId = parseInt(<string>req.query.chainId);
      }

      if (req.query.language) {
        filterOpts.language = <string>req.params.language;
      }

      if (req.query.availableOnPlatform) {
        let tmp = <string>req.query.availableOnPlatform;
        filterOpts.availableOnPlatform = tmp.split(",");
      }

      if (req.query.listedOnOrAfter) {
        filterOpts.listedOnOrAfter = new Date(
          <string>req.query.listedOnOrAfter
        );
      }

      if (req.query.listedOnOrBefore) {
        filterOpts.listedOnOrBefore = new Date(<string>req.query.minAge);
      }

      if (req.query.allowedInCountries) {
        let tmp = <string>req.query.allowedInCountries;
        filterOpts.allowedInCountries = tmp.split(",");
      }

      if (req.query.blockedInCountries) {
        let tmp = <string>req.query.blockedInCountries;
        filterOpts.blockedInCountries = tmp.split(",");
      }

      if (req.query.categories) {
        let tmp = <string>req.query.categories;
        filterOpts.categories = tmp.split(",");
      }

      if (req.query.isListed) {
        filterOpts.isListed = true;
      }

      if (req.query.developer) {
        filterOpts.developer.githubID = <string>req.query.developer;
      }

      console.log(
        "queryText:",
        req.params.search,
        "query:",
        req.query,
        "filterOpts:",
        filterOpts
      );

      const response: DAppSchema[] = DappStore.search(
        req.params.search,
        filterOpts
      );
      utils.writeJson(res, response);
    } catch (e) {
      utils.writeJson(res, e);
    }
  };

  addDapp = async (req: Request, res: Response) => {
    const name: string = req.body.name;
    const email: string = req.body.email;
    const accessToken: string = req.body.accessToken;
    const githubID: string = req.body.githubID;
    const dapp: DAppSchema = req.body.dapp;
    const org: string = req.body.org;
    try {
      const response = DappStore.addOrUpdateDapp(
        name,
        email,
        accessToken,
        githubID,
        dapp,
        org
      );
      utils.writeJson(res, response);
    } catch (e) {
      utils.writeJson(res, e);
    }
  };

  updateDapp = async (req: Request, res: Response) => {
    const name: string = req.body.name;
    const email: string = req.body.email;
    const accessToken: string = req.body.accessToken;
    const githubID: string = req.body.githubID;
    const dapp: DAppSchema = req.body.dapp;
    const org: string = req.body.org;
    try {
      const response = DappStore.addOrUpdateDapp(
        name,
        email,
        accessToken,
        githubID,
        dapp,
        org
      );
      utils.writeJson(res, response);
    } catch (e) {
      utils.writeJson(res, e);
    }
  };

  deleteDapp = async (req: Request, res: Response) => {
    const name: string = req.params.name;
    const email: string = req.params.email;
    const accessToken: string = req.params.accessToken;
    const githubID: string = req.params.githubID;
    const dappId: string = req.params.dappId;
    const org: string = req.params.org;

    try {
      await DappStore.init();
      const response = DappStore.deleteDapp(
        name,
        email,
        accessToken,
        githubID,
        dappId,
        org
      );
      utils.writeJson(res, response);
    } catch (e) {
      utils.writeJson(res, e);
    }
  };

  getFeaturedDapps = async (req: Request, res: Response) => {
    try {
      await DappStore.init();
      const response = DappStore.getFeaturedDapps();
      utils.writeJson(res, response);
    } catch (e) {
      utils.writeJson(res, e);
    }
  };
}

export default new DappRegistory();
