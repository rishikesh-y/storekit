import { Router } from "express";
import DappRegistoryController from "./controllers/dappRegistoryController";
import StoreRegistoryController from "./controllers/storeRegistoryController";
import { body } from "express-validator";

const routes = Router();

// READ
routes.get("/dapp", DappRegistoryController.getDapps);
routes.get("/store/featured", StoreRegistoryController.getFeaturedDapps);
routes.get("/store/title", StoreRegistoryController.getStoreTitle);

// CREATE
routes.post(
  "/dapp",
  body("name").isString().not().isEmpty(),
  body("email").isString().not().isEmpty(),
  body("accessToken").isString().not().isEmpty(),
  body("githubID").isString().not().isEmpty(),
  body("dapp").not().isEmpty(),
  DappRegistoryController.addDapp
);

// UPDATE
routes.put(
  "/dapp",
  body("name").isString().not().isEmpty(),
  body("email").isString().not().isEmpty(),
  body("accessToken").isString().not().isEmpty(),
  body("githubID").isString().not().isEmpty(),
  body("dapp").not().isEmpty(),
  DappRegistoryController.updateDapp
);

// DELETE
routes.delete("/dapp", DappRegistoryController.deleteDapp);

export default routes;
