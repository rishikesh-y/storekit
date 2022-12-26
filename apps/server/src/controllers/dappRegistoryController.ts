import { Request, Response } from "express";
import { DAppSchema, FilterOptions } from "@merokudao/dapp-store-registry";
import { DappStoreRegistry } from "@merokudao/dapp-store-registry";
import { validationResult } from "express-validator";
import parseISO from "date-fns/parseISO";

var utils = require("../utils/writer.js");
const DappStore = new DappStoreRegistry();

class DappRegistory {
  constructor() {
    this.getDapps = this.getDapps.bind(this);
    this.addDapp = this.addDapp.bind(this);
    this.updateDapp = this.updateDapp.bind(this);
    this.deleteDapp = this.deleteDapp.bind(this);
  }

  getDapps = async (req: Request, res: Response) => {
    await DappStore.init();
    var search: string = <string>req.query.search;
    var filterOpts: FilterOptions = { isListed: true };

    try {
      if (req.query.isMatureContent) {
        filterOpts.forMatureAudience =
          req.query.isMatureContent === "true" ? true : false;
      }

      if (req.query.minAge) {
        var age: number;
        try {
          let minAge = <string>req.query.minAge;
          age = parseInt(minAge);
        } catch (e) {
          return console.error(e);
        }
        filterOpts.minAge = age;
      }

      if (req.query.chainId) {
        try {
          filterOpts.chainId = parseInt(<string>req.query.chainId);
        } catch (e) {
          return console.error(e);
        }
      }

      if (req.query.language) {
        filterOpts.language = <string>req.params.language;
      }

      if (req.query.availableOnPlatform) {
        let tmp = <string>req.query.availableOnPlatform;
        tmp = tmp.trim();
        filterOpts.availableOnPlatform = tmp.split(",");
      }

      if (req.query.listedOnOrAfter) {
        try {
          filterOpts.listedOnOrAfter = parseISO(
            <string>req.query.listedOnOrAfter
          );
        } catch (e) {
          return console.error(e);
        }
      }

      if (req.query.listedOnOrBefore) {
        try {
          filterOpts.listedOnOrBefore = parseISO(<string>req.query.minAge);
        } catch (e) {
          return console.error(e);
        }
      }

      if (req.query.allowedInCountries) {
        let tmp = <string>req.query.allowedInCountries;
        tmp = tmp.trim();
        filterOpts.allowedInCountries = tmp.split(",");
      }

      if (req.query.blockedInCountries) {
        let tmp = <string>req.query.blockedInCountries;
        tmp = tmp.trim();
        filterOpts.blockedInCountries = tmp.split(",");
      }

      if (req.query.categories) {
        let tmp = <string>req.query.categories;
        tmp = tmp.trim();
        filterOpts.categories = tmp.split(",");
      }

      if (req.query.isListed) {
        filterOpts.isListed = req.query.isListed === "true" ? true : false;
      }

      if (req.query.developer) {
        let tmp = <string>req.query.developer;
        tmp = tmp.trim();
        filterOpts.developer.githubID = tmp;
      }

      if (search == undefined) {
        const response: DAppSchema[] = await DappStore.dApps(filterOpts);
        utils.writeJson(res, response);
      } else {
        const response: DAppSchema[] = DappStore.search(search, filterOpts);
        utils.writeJson(res, response);
      }
    } catch (e) {
      utils.writeJson(res, e);
    }
  };

  addDapp = async (req: Request, res: Response) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      // no errors
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
    } else {
      // errors
      console.log(`Validation errors: ${result}`);
      utils.writeJson(res, "Validation errors");
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
    const name: string = <string>req.query.name;
    const email: string = <string>req.query.email;
    const accessToken: string = <string>req.query.accessToken;
    const githubID: string = <string>req.query.githubID;
    const dappId: string = <string>req.query.dappId;
    const org: string = <string>req.query.org;

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
}

export default new DappRegistory();
