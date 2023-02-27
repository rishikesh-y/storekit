import { Router } from "express";
import {
  DappFileUploadController,
  DappRegistryController,
  DomainVerificationController,
  GhAppController,
  StoreRegistryController,
  analyticsController,
} from "./controllers";
import { body, query } from "express-validator";
import multer from "multer";

const routes = Router();

// upload dAppFiles to diskStorage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/uploads");
  },
});
var upload = multer({ storage: storage });

// Store
routes.get("/store/title", StoreRegistryController.getStoreTitle);

// Featured Section
routes.get("/store/featured", StoreRegistryController.getFeaturedDapps);

routes.put(
  "/store/featured",
  body("dappIds").isArray().not().isEmpty(),
  body("email").isString().not().isEmpty(),
  body("name").isString().not().isEmpty(),
  body("accessToken").isString().not().isEmpty(),
  body("githubID").isString().not().isEmpty(),
  body("sectionTitle").isString().not().isEmpty(),
  StoreRegistryController.addFeaturedSection
);

routes.post(
  "/store/featured",
  body("email").isString().not().isEmpty(),
  body("name").isString().not().isEmpty(),
  body("accessToken").isString().not().isEmpty(),
  body("githubID").isString().not().isEmpty(),
  body("sectionKey").isString().not().isEmpty(),
  StoreRegistryController.deleteFeaturedSection
);

routes.post(
  "/store/featured/dapps",
  body("email").isString().not().isEmpty(),
  body("name").isString().not().isEmpty(),
  body("accessToken").isString().not().isEmpty(),
  body("githubID").isString().not().isEmpty(),
  body("dappIds").isArray().not().isEmpty(),
  body("sectionKey").isString().not().isEmpty(),
  StoreRegistryController.toggleFeaturedStatusOfDapp
);

// CREATE
routes.get("/dapp", DappRegistryController.getDapps);
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
  "/dapp/upload",
  upload.array("dAppFiles"),
  body("dappId").isString().not().isEmpty(),
  body("field").isString().not().isEmpty(),
  DappFileUploadController.fileUploads
);

routes.get(
  "/dapp/:dappId/build",
  DappFileUploadController.getPreSignedBuildUrl
);

routes.get("/o/view/:dappId", analyticsController.goto);
routes.get("/o/download/:dappId", analyticsController.download);
routes.post(
  "/dapp/rate",
  body("dappId").isString().not().isEmpty(),
  analyticsController.registerRating
);
routes.get(
  "/dapp/rate",
  query("dappId").isString().not().isEmpty(),
  analyticsController.getRatingUser
);

routes.get(
  "/pendingDomains",
  body("githubId").isString().not().isEmpty(),
  DomainVerificationController.getPendingDomains
);
routes.get(
  "/verifiedDomains",
  body("githubId").isString().not().isEmpty(),
  DomainVerificationController.getVerifiedDomains
);
routes.post(
  "/domainverification/getVerificationId",
  body("githubId").isString().not().isEmpty(),
  body("domain").isString().not().isEmpty(),
  DomainVerificationController.getVerificationId
);
routes.post(
  "/domainverification/verify",
  body("githubId").isString().not().isEmpty(),
  body("domain").isString().not().isEmpty(),
  DomainVerificationController.verify
);

export default routes;
