import { Router, Request, Response, NextFunction } from 'express';

class DappRegistory {

    constructor() {    
      this.getDapps = this.getDapps.bind(this);
      this.addDapp = this.addDapp.bind(this);
      this.updateDapp = this.updateDapp.bind(this);
      this.deleteDapp = this.deleteDapp.bind(this);
    }

    getDapps = function(req: Request, res: Response, next: NextFunction) {
        res.send("Hello World!")
    }

    addDapp = function(req: Request, res: Response, next: NextFunction) {
        res.send("Hello World!")
    }

    updateDapp = function(req: Request, res: Response, next: NextFunction) {
        res.send("Hello World!")
    }

    deleteDapp = function(req: Request, res: Response, next: NextFunction) {
        res.send("Hello World!")
    }
}

export default new DappRegistory();
