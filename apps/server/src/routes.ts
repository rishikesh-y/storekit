import { Router } from "express";
import DappRegistoryController from "./controllers/dappRegistoryController";
import StoreRegistoryController from "./controllers/storeRegistoryController";

const routes = Router();

// READ
routes.get("/dapp/:search", DappRegistoryController.getDapps);
routes.get("/store/featured", StoreRegistoryController.getFeaturedDapps);
routes.get("/store/title", StoreRegistoryController.getStoreTitle);

// CREATE
routes.post("/dapp", DappRegistoryController.addDapp);

// UPDATE
routes.put("/dapp", DappRegistoryController.updateDapp);

// DELETE
routes.delete("/dapp/:dappId/:name/:email/:accessToken/:githubId/:org", DappRegistoryController.deleteDapp);

export default routes;
