import { Router } from "express";
import { DappFileUploadController, DappRegistryController, GhAppController, StoreRegistryController, analyticsController } from "./controllers";
import { body, query, header, validationResult } from 'express-validator';
import multer from "multer";

const routes = Router();

// READ
routes.get("/dapp", DappRegistryController.getDapps);
routes.get("/store/featured", StoreRegistryController.getFeaturedDapps);
routes.get("/store/title", StoreRegistryController.getStoreTitle);

// CREATE
routes.post(
  "/dapp",
  body("name").isString().not().isEmpty(),
  body("email").isString().not().isEmpty(),
  body("accessToken").isString().not().isEmpty(),
  body("githubID").isString().not().isEmpty(),
  body("dapp").not().isEmpty(),
  DappRegistryController.addDapp
);

// UPDATE
routes.put(
  "/dapp",
  body("name").isString().not().isEmpty(),
  body("email").isString().not().isEmpty(),
  body("accessToken").isString().not().isEmpty(),
  body("githubID").isString().not().isEmpty(),
  body("dapp").not().isEmpty(),
  DappRegistryController.updateDapp
);

// DELETE
routes.post(
  "/dapp/deleteApp",
  body("name").isString().not().isEmpty(),
  body("email").isString().not().isEmpty(),
  body("accessToken").isString().not().isEmpty(),
  body("githubID").isString().not().isEmpty(),
  body("dappId").isString().not().isEmpty(),
  DappRegistryController.deleteDapp
);

routes.get("/app/:githubID/installed", GhAppController.isAppInstalled);

routes.get("/app/installUrl", GhAppController.getInstallURL);

routes.post(
  "/dapp/:dappId/upload/:field",
  DappFileUploadController.preSignedUrlUpload
);

routes.get("/dapp/:dappId/build", DappFileUploadController.getPreSignedBuildUrl);

routes.get("/o/view/:dappId", analyticsController.goto);
routes.get("/o/download/:dappId", analyticsController.download);
routes.post("/dapp/rate",
  body("dappId").isString().not().isEmpty(),
  analyticsController.registerRating);
routes.get("/dapp/rate",
  query("dappId").isString().not().isEmpty(),
  analyticsController.getRatingUser);

export default routes;
