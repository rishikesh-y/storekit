import { Router, Request, Response, NextFunction } from 'express';

class StoreRegistory {

    constructor() {    
      this.getFeaturedDapps = this.getFeaturedDapps.bind(this);
      this.getStoreTitle = this.getStoreTitle.bind(this);
    }

    getFeaturedDapps = function(req: Request, res: Response, next: NextFunction) {
        res.send("Hello World!")
    }

    getStoreTitle = function(req: Request, res: Response, next: NextFunction) {
        res.send("Hello World!")
    }
}

export default new StoreRegistory();
