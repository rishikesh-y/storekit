import { Router, Request, Response, NextFunction } from 'express';
var utils = require('../utils/writer.js');
var StoreRegistoryService = require('../service/StoreRegistoryService');

class StoreRegistory {

    constructor() {    
      this.getStoreTitle = this.getStoreTitle.bind(this);
    }

    getStoreTitle = function(req: Request, res: Response) {
        StoreRegistoryService.getStoreTitle()
    .then(function (response: any) {
      utils.writeJson(res, response);
    })
    .catch(function (response: any) {
      utils.writeJson(res, response);
    });
    }
}

export default new StoreRegistory();
