import { Request, Response } from "express";
import dns from "dns";
import { promisify } from "util";
import bcrypt from "bcrypt";
import { prisma } from "../utils/prisma";
import { validationResult } from "express-validator";

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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let domains = await prisma.dappDomainVerify.findMany({
      where: {
        githubUserId: req.query.githubId as string,
        status: {
          in: ["NOT_STARTED", "PENDING"],
        },
      },
    });

    return res.json(domains);
  }

  async getVerifiedDomains(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const domains = await prisma.dappDomainVerify.findMany({
      where: {
        githubUserId: req.query.githubId as string,
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let dappDomain = await prisma.dappDomainVerify.findUnique({
      where: {
        domain_githubUserId: {
          domain: req.body.domain,
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

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.domain, salt);

    dappDomain = await prisma.dappDomainVerify.create({
      data: {
        githubUserId: req.body.githubId,
        domain: req.body.domain,
        verificationCode: hash,
      },
    });

    return res.json({
      verificationCode: `meroku-site-verification=${dappDomain.verificationCode}`,
      domain: dappDomain.domain,
    });
  }

  async verify(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const dappDomain = await prisma.dappDomainVerify.findUnique({
      where: {
        domain_githubUserId: {
          domain: req.body.domain,
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
          domain_githubUserId: {
            domain: req.body.domain,
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
          domain_githubUserId: {
            domain: req.body.domain,
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
