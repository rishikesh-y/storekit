import { Router } from "express";
import DappRegistoryController from "./controllers/dappRegistoryController";
import StoreRegistoryController from "./controllers/storeRegistoryController";

const routes = Router();

// READ
routes.get("/dapp/:search", DappRegistoryController.getDapps);
routes.get("/store/featured", StoreRegistoryController.getFeaturedDapps);
routes.get("/dapp/title", StoreRegistoryController.getStoreTitle);

// CREATE
routes.post("/dapp", DappRegistoryController.addDapp);

// UPDATE
routes.put("/dapp", DappRegistoryController.updateDapp);

// DELETE
routes.delete("/dapp", DappRegistoryController.deleteDapp);

export default routes;
