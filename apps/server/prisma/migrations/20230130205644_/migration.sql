-- CreateEnum
CREATE TYPE "DappDomainStatus" AS ENUM ('NOT_STARTED', 'PENDING', 'VERIFIED', 'EXPIRED');

-- CreateTable
CREATE TABLE "DappDomainVerify" (
    "id" SERIAL NOT NULL,
    "dappId" VARCHAR NOT NULL,
    "domain" VARCHAR NOT NULL,
    "verificationCode" VARCHAR NOT NULL,
    "githubUserId" VARCHAR NOT NULL,
    "verificationDate" TIMESTAMP(6),
    "status" "DappDomainStatus" NOT NULL DEFAULT 'NOT_STARTED',

    CONSTRAINT "DappDomainVerify_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DappDomainVerify_dappId_idx" ON "DappDomainVerify"("dappId");

-- CreateIndex
CREATE INDEX "DappDomainVerify_domain_idx" ON "DappDomainVerify"("domain");

-- CreateIndex
CREATE INDEX "DappDomainVerify_githubUserId_idx" ON "DappDomainVerify"("githubUserId");

-- CreateIndex
CREATE INDEX "DappDomainVerify_status_idx" ON "DappDomainVerify"("status");

-- CreateIndex
CREATE UNIQUE INDEX "dapp_github" ON "DappDomainVerify"("dappId", "githubUserId");

-- CreateIndex
CREATE UNIQUE INDEX "dapp_code" ON "DappDomainVerify"("dappId", "verificationCode");
