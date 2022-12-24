import { Request, Response } from 'express';
import {Dapp} from '@merokudao/dapp-store-registry'

var utils = require('../utils/writer.js');
var DappRegistoryService = require('../service/DappRegistoryService');

class DappRegistory {

    constructor() {    
      this.getDapps = this.getDapps.bind(this);
      this.addDapp = this.addDapp.bind(this);
      this.updateDapp = this.updateDapp.bind(this);
      this.deleteDapp = this.deleteDapp.bind(this);
      this.getFeaturedDapps = this.getFeaturedDapps.bind(this);
    }

    getDapps = function(req: Request, res: Response) {
        const query = req.params.query;
        const search = req.query.search;
        DappRegistoryService.getDapps(query, search)
    .then(function (response: any) {
      utils.writeJson(res, response);
    })
    .catch(function (response: any) {
      utils.writeJson(res, response);
    });
    }

    addDapp = function(req: Request, res: Response) {
      const body:Dapp = req.body;
       DappRegistoryService.addDapp(body)
       .then(function (response: any) {
      utils.writeJson(res, response);
    })
    .catch(function (response: any) {
      utils.writeJson(res, response);
    });
    }

    updateDapp = function(req: Request, res: Response) {
      const body:Dapp =req.body;
        DappRegistoryService.updateDapp(body)
    .then(function (response: any) {
      utils.writeJson(res, response);
    })
    .catch(function (response: any) {
      utils.writeJson(res, response);
    });
    }

    deleteDapp = function(req: Request, res: Response) {
      const email:string = req.params.email;
      const dappId:string = req.params.dappId;
        DappRegistoryService.deleteDapp(email, dappId)
    .then(function (response: any) {
      utils.writeJson(res, response);
    })
    .catch(function (response: any) {
      utils.writeJson(res, response);
    });
    }

    getFeaturedDapps = function(req: Request, res: Response) {
       DappRegistoryService.getFeaturedDapps()
    .then(function (response: any) {
      utils.writeJson(res, response);
    })
    .catch(function (response: any) {
      utils.writeJson(res, response);
    });
    }
}

export default new DappRegistory();
