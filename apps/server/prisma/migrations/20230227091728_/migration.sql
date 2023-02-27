/*
  Warnings:

  - You are about to drop the column `dappId` on the `DappDomainVerify` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[domain,githubUserId]` on the table `DappDomainVerify` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[domain,verificationCode]` on the table `DappDomainVerify` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "DappDomainVerify_dappId_idx";

-- DropIndex
DROP INDEX "dapp_code";

-- DropIndex
DROP INDEX "dapp_github";

-- AlterTable
ALTER TABLE "DappDomainVerify" DROP COLUMN "dappId";

-- CreateIndex
CREATE UNIQUE INDEX "domain_github" ON "DappDomainVerify"("domain", "githubUserId");

-- CreateIndex
CREATE UNIQUE INDEX "domain_code" ON "DappDomainVerify"("domain", "verificationCode");
