import { DappStoreRegistry } from "@merokudao/dapp-store-registry";
import { Request, Response } from "express";
import Debug from "debug";
import {
    getMetrics,
    getUserRating,
    prisma,
    registerDownload,
    registerRating,
    registerVisit,
} from "../utils/prisma";
import { getBuildDownloadPreSignedUrl } from "./dappFileUploadController";
import { validationResult } from "express-validator";

const debug = Debug("meroku:analyticsController");

class AnalyticsController {
    private registry = new DappStoreRegistry();

    constructor() {
        this.download = this.download.bind(this);
        this.goto = this.goto.bind(this);
    }

    async goto(req: Request, res: Response) {
        const { dappId } = req.params;
        const userId = req.query.userId as string;
        const userAddress = req.query.userAddress as string;
        await this.registry.init();
        const dapps = await this.registry.dApps();
        const dapp = dapps.find((dapp) => dapp.dappId === dappId);
        if (!dapp) {
            return res.status(404).send("dApp Not found");
        }
        if (
            !dapp.appUrl ||
            dapp.appUrl.endsWith(".zip") ||
            dapp.appUrl.endsWith(".apk")
        ) {
            return res.status(404).send("No App URL found");
        }
        await registerVisit(
            dappId,
            dapp.version,
            dapp.category,
            userId,
            userAddress,
            req.headers["user-agent"]
        );
        return res.redirect(dapp.appUrl);
    }

    async download(req: Request, res: Response) {
        const { dappId } = req.params;
        const userId = req.query.userId as string;
        const userAddress = req.query.userAddress as string;
        await this.registry.init();
        const dapps = await this.registry.dApps();
        const dapp = dapps.find((dapp) => dapp.dappId === dappId);
        if (!dapp) {
            return res.status(404).send("dApp Not found");
        }
        if (
            !dapp.appUrl ||
            (!dapp.appUrl.endsWith(".zip") && !dapp.appUrl.endsWith(".apk"))
        ) {
            return res.status(404).send("No App Download URL found");
        }
        await registerDownload(
            dappId,
            dapp.version,
            dapp.category,
            userId,
            userAddress,
            req.headers["user-agent"] || ""
        );
        const url = getBuildDownloadPreSignedUrl(dappId);
        return res.redirect(url);
    }

    async metrics(req: Request, res: Response) {
        const { dappId } = req.params;
        const metrics = await getMetrics(dappId);
        return res.json({
            metrics,
        });
    }

    async registerRating(req: Request, res: Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { dappId, userId, userAddress, rating, comment } = req.body;
        debug("registerRating", dappId, userId, userAddress, rating);
        try {
            const result = await registerRating(
                dappId,
                rating,
                userId,
                userAddress,
                comment
            );
            return res.json({
                status: "success",
                ...result,
            });
        } catch (e) {
            debug("Error in registerRating", e);
            return res.status(400).json({
                status: "error",
                message: e.message,
            });
        }
    }

    async getRatingUser(req: Request, res: Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { dappId, userId, userAddress } = req.query;
        debug("getRatingUser", dappId, userId, userAddress);
        try {
            const result = await getUserRating(
                dappId as string,
                userId as string,
                userAddress as string
            );
            debug(result);
            return res.json({
                status: "success",
                ...result,
            });
        } catch (e) {
            debug("Error in getRatingUser", e);
            return res.status(400).json({
                status: "error",
                message: e.message,
            });
        }
    }
}

export const analyticsController = new AnalyticsController();
