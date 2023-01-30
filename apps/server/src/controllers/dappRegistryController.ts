import { Request, Response } from "express";
import { DAppSchema, FilterOptions } from "@merokudao/dapp-store-registry";
import { DappStoreRegistry } from "@merokudao/dapp-store-registry";
import { validationResult } from "express-validator";
import Debug from "debug";
import parseISO from "date-fns/parseISO";
import { getMetrics } from "../utils/prisma";

const debug = Debug("meroku:server");
const DappStore = new DappStoreRegistry();

class DappRegistry {
    constructor() {
        this.getDapps = this.getDapps.bind(this);
        this.addDapp = this.addDapp.bind(this);
        this.updateDapp = this.updateDapp.bind(this);
        this.deleteDapp = this.deleteDapp.bind(this);
    }

    getDapps = async (req: Request, res: Response) => {
        await DappStore.init();
        var search: string = <string>req.query.search;
        var filterOpts: FilterOptions = { isListed: true };

        try {
            if (req.query.isMatureContent) {
                filterOpts.forMatureAudience =
                    req.query.isMatureContent === "true" ? true : false;
            }

            if (req.query.minAge) {
                try {
                    var age: number;
                    let minAge = <string>req.query.minAge;
                    age = parseInt(minAge);
                    if (Number(age)) filterOpts.minAge = age;
                } catch (e) {
                    debug(e.message);
                }
            }

            console.log(filterOpts.minAge);

            if (req.query.chainId) {
                try {
                    var chainId = parseInt(<string>req.query.chainId);
                    if (Number(chainId)) filterOpts.chainId = chainId;
                } catch (e) {
                    debug(e.message);
                }
            }

            if (req.query.language) {
                filterOpts.language = <string>req.params.language;
            }

            if (req.query.availableOnPlatform) {
                let tmp = <string>req.query.availableOnPlatform;
                let arr: string[] = tmp
                    .split(",")
                    .map((item: string) => item.trim());
                filterOpts.availableOnPlatform = arr;
            }

            if (req.query.listedOnOrAfter) {
                try {
                    filterOpts.listedOnOrAfter = parseISO(
                        <string>req.query.listedOnOrAfter
                    );
                } catch (e) {
                    debug(e.message);
                }
            }

            if (req.query.listedOnOrBefore) {
                try {
                    filterOpts.listedOnOrBefore = parseISO(
                        <string>req.query.minAge
                    );
                } catch (e) {
                    debug(e.message);
                }
            }

            if (req.query.allowedInCountries) {
                let tmp = <string>req.query.allowedInCountries;
                let arr: string[] = tmp
                    .split(",")
                    .map((item: string) => item.trim());
                filterOpts.allowedInCountries = arr;
            }

            if (req.query.blockedInCountries) {
                let tmp = <string>req.query.blockedInCountries;
                let arr: string[] = tmp
                    .split(",")
                    .map((item: string) => item.trim());
                filterOpts.blockedInCountries = arr;
            }

            if (req.query.categories) {
                let tmp = <string>req.query.categories;
                let arr: string[] = tmp
                    .split(",")
                    .map((item: string) => item.trim());
                filterOpts.categories = arr;
            }

            if (req.query.isListed) {
                filterOpts.isListed =
                    req.query.isListed === "true" ? true : false;
            }

            if (req.query.developer) {
                let tmp = <string>req.query.developer;
                tmp = tmp.trim();
                filterOpts.developer.githubID = tmp;
            }

            let response: DAppSchema[];
            if (search && search.trim() !== "") {
                response = DappStore.search(search, filterOpts);
            } else {
                response = await DappStore.dApps(filterOpts);
            }
            const metrics = await getMetrics(
                response.map((dapp) => dapp.dappId)
            );
            response = response.map((dapp) => {
                const metric = metrics.find((m) => m.dappId === dapp.dappId);
                if (metric) {
                    return { ...dapp, metrics: metric };
                }
                return dapp;
            });
            return res.json(response);
        } catch (e) {
            debug(e);
            return res.status(400).json({ errors: [{ msg: e.message }] });
        }
    };

    addDapp = async (req: Request, res: Response) => {
        const result = validationResult(req);
        if (result.isEmpty()) {
            // no errors
            const name: string = req.body.name;
            const email: string = req.body.email;
            const accessToken: string = req.body.accessToken;
            const githubID: string = req.body.githubID;
            const dapp: DAppSchema = req.body.dapp;
            const org: string | undefined = req.body.org;

            debug(`Adding dapp: ${JSON.stringify(dapp)}`);
            debug(`name: ${name}`);
            debug(`email: ${email}`);
            debug(`accessToken: ${accessToken}`);
            debug(`githubID: ${githubID}`);
            debug(`org: ${org}`);
            const appInstalled = await DappStore.isGHAppInstalled(githubID);
            if (!appInstalled) {
                const installUrl = await DappStore.ghAppInstallURL();
                return res.status(400).json({
                    errors: [
                        {
                            msg: `Dappstore app is not installed on your github account. Please install it and try again. Visit ${installUrl} to install the app.`,
                        },
                    ],
                });
            }

            try {
                const response = await DappStore.addOrUpdateDapp(
                    name,
                    email,
                    accessToken,
                    githubID,
                    dapp
                );
                debug(response);
                return res.json(response);
            } catch (e) {
                debug(e);
                return res.status(400).json({ errors: [{ msg: e.message }] });
            }
        } else {
            // errors
            debug(`Validation errors: ${result}`);
            return res.status(400).json({ errors: result.array() });
        }
    };

    updateDapp = async (req: Request, res: Response) => {
        const result = validationResult(req);
        if (result.isEmpty()) {
            // no errors
            const name = req.body.name as string;
            const email = req.body.email as string;
            const accessToken = req.body.accessToken as string;
            const githubID = req.body.githubID as string;
            const dapp = req.body.dapp as DAppSchema;

            try {
                const response = await DappStore.addOrUpdateDapp(
                    name,
                    email,
                    accessToken,
                    githubID,
                    dapp
                );
                return res.json(response);
            } catch (e) {
                debug(e);
                return res.status(400).json({ errors: [{ msg: e.message }] });
            }
        } else {
            // errors
            debug(`Validation errors: ${result}`);
            return res.status(400).json({ errors: [{ msg: result }] });
        }
    };

    deleteDapp = async (req: Request, res: Response) => {
        const result = validationResult(req);
        if (result.isEmpty()) {
            // no errors
            const name: string = <string>req.body.name;
            const email: string = <string>req.body.email;
            const accessToken: string = <string>req.body.accessToken;
            const githubID: string = <string>req.body.githubID;
            const dappId: string = <string>req.body.dappId;
            const org: string = <string>req.body.org;

            try {
                await DappStore.init();
                const response = await DappStore.deleteDapp(
                    name,
                    email,
                    accessToken,
                    githubID,
                    dappId
                );
                return res.json(response);
            } catch (e) {
                return res.status(400).json({ errors: [{ msg: e.message }] });
            }
        } else {
            // errors
            debug(`Validation errors: ${result}`);
            return res.status(400).json({ errors: [{ msg: result }] });
        }
    };
}

export const DappRegistryController = new DappRegistry();
