import { Request, Response } from "express";
import { DappStoreRegistry } from "@merokudao/dapp-store-registry";
import dns from "dns";
import { promisify } from "util";
import bcrypt from "bcrypt";
import { prisma } from "../utils/prisma";

const DappStore = new DappStoreRegistry();
const resolveTxt = promisify(dns.resolveTxt);

class DomainVerification {
  constructor() {
    this.getPendingDomains = this.getPendingDomains.bind(this);
    this.getVerifiedDomains = this.getVerifiedDomains.bind(this);
    this.checkDomainTxtRecords = this.checkDomainTxtRecords.bind(this);
    this.getVerificationId = this.getVerificationId.bind(this);
    this.verify = this.verify.bind(this);
  }

  async getPendingDomains(req: Request, res: Response) {
    let domains = await prisma.dappDomainVerify.findMany({
      where: {
        githubUserId: req.body.githubId,
        status: {
          in: ["NOT_STARTED", "PENDING", "VERIFIED"],
        },
      },
    });

    return res.json(domains);
  }

  async getVerifiedDomains(req: Request, res: Response) {
    const domains = await prisma.dappDomainVerify.findMany({
      where: {
        githubUserId: req.body.githubId,
        status: {
          in: ["VERIFIED"],
        },
      },
    });

    return res.json(domains);
  }

  async checkDomainTxtRecords(
    domain: string,
    verificationKey: string,
    verificationValue: string
  ) {
    const records = (
      await resolveTxt(domain.replace(/^https?:\/\//, "").replace(/www\./, ""))
    ).map((record) => record[0]);
    return records
      .filter((record) => record.startsWith(`${verificationKey}=`))
      ?.some((record) => record.split("=")[1] === verificationValue);
  }

  async getVerificationId(req: Request, res: Response) {
    let dappDomain = await prisma.dappDomainVerify.findUnique({
      where: {
        dappId_githubUserId: {
          dappId: req.params.dappId,
          githubUserId: req.body.githubId,
        },
      },
    });

    if (dappDomain) {
      return res.json({
        verificationCode: `meroku-site-verification=${dappDomain.verificationCode}`,
        domain: dappDomain.domain,
      });
    }

    await DappStore.init();

    const allDApps = await DappStore.dApps();
    const dApp = allDApps.find((dApp) => dApp.dappId === req.params.dappId);

    if (!dApp) {
      return res.status(404).json({
        error: "DApp not found",
      });
    }

    if (!dApp.appUrl) {
      return res.status(400).json({
        error: "DApp has no domain",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.params.dappId, salt);

    dappDomain = await prisma.dappDomainVerify.create({
      data: {
        dappId: req.params.dappId,
        githubUserId: req.body.githubId,
        domain: dApp.appUrl,
        verificationCode: hash,
      },
    });

    return res.json({
      verificationCode: `meroku-site-verification=${dappDomain.verificationCode}`,
      domain: dappDomain.domain,
    });
  }

  async verify(req: Request, res: Response) {
    const dappDomain = await prisma.dappDomainVerify.findUnique({
      where: {
        dappId_githubUserId: {
          dappId: req.params.dappId,
          githubUserId: req.body.githubId,
        },
      },
    });

    if (!dappDomain) {
      return res.status(404).json({
        error: "Verification not found",
      });
    }

    const isVerified = await this.checkDomainTxtRecords(
      dappDomain.domain,
      "meroku-site-verification",
      dappDomain.verificationCode
    );

    if (!isVerified && dappDomain.status === "NOT_STARTED") {
      await prisma.dappDomainVerify.update({
        where: {
          dappId_githubUserId: {
            dappId: req.params.dappId,
            githubUserId: req.body.githubId,
          },
        },
        data: {
          status: "PENDING",
        },
      });
    }

    if (isVerified && dappDomain.status !== "VERIFIED") {
      await prisma.dappDomainVerify.update({
        where: {
          dappId_githubUserId: {
            dappId: req.params.dappId,
            githubUserId: req.body.githubId,
          },
        },
        data: {
          status: "VERIFIED",
          verificationDate: new Date(),
        },
      });
    }

    return res.json({
      isVerified,
      verificationCode: `meroku-site-verification=${dappDomain.verificationCode}`,
      domain: dappDomain.domain,
    });
  }
}

export const DomainVerificationController = new DomainVerification();
