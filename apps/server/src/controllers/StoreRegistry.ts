import { Request, Response } from "express";
import {
  DappStoreRegistry,
  FeaturedSection,
} from "@merokudao/dapp-store-registry";
import { validationResult } from "express-validator";
import slugify from "slugify";
import Debug from "debug";

const debug = Debug("meroku:storeRegistryController");

const DappStore = new DappStoreRegistry();

class StoreRegistry {
  constructor() {
    this.getStoreTitle = this.getStoreTitle.bind(this);
    this.getFeaturedDapps = this.getFeaturedDapps.bind(this);
  }

  getStoreTitle = async (req: Request, res: Response) => {
    try {
      await DappStore.init();
      const response = await DappStore.getRegistryTitle();
      return res.json(response);
    } catch (e) {
      return res.status(400).json({ errors: [{ msg: e.message }] });
    }
  };

  getFeaturedDapps = async (req: Request, res: Response) => {
    try {
      await DappStore.init();
      const response = await DappStore.getFeaturedDapps();
      return res.json(response);
    } catch (e) {
      return res.status(400).json({ errors: [{ msg: e.message }] });
    }
  };

  addFeaturedSection = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, description, email, accessToken, githubID, sectionTitle } =
      req.body;
    const dappIds = req.body.dappIds as string[];
    try {
      await DappStore.init();
      const section: FeaturedSection = {
        title: sectionTitle,
        dappIds: dappIds,
        description: description,
        key: slugify(sectionTitle, { lower: true }),
      };
      const prUrl = await DappStore.addFeaturedSection(
        name,
        email,
        accessToken,
        githubID,
        section
      );
      return res.status(201).json(prUrl);
    } catch (e) {
      return res.status(400).json({ errors: [{ msg: e.message }] });
    }
  };

  deleteFeaturedSection = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, accessToken, githubID, sectionKey } = req.body;
    try {
      await DappStore.init();
      const prUrl = await DappStore.removeFeaturedSection(
        name,
        email,
        accessToken,
        githubID,
        sectionKey
      );
      return res.status(200).json(prUrl);
    } catch (e) {
      return res.status(400).json({ errors: [{ msg: e.message }] });
    }
  };

  toggleFeaturedStatusOfDapp = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, accessToken, githubID, sectionKey } = req.body;
    const dappIds = req.body.dappIds as string[];

    debug(
      "toggleFeaturedStatusOfDapp",
      name,
      email,
      accessToken,
      githubID,
      sectionKey,
      dappIds
    );
    try {
      await DappStore.init();
      const prUrl = await DappStore.toggleDappInFeaturedSection(
        name,
        email,
        accessToken,
        githubID,
        sectionKey,
        dappIds
      );
      return res.status(200).json(prUrl);
    } catch (e) {
      return res.status(400).json({ errors: [{ msg: e.message }] });
    }
  };
}

export const StoreRegistryController = new StoreRegistry();
