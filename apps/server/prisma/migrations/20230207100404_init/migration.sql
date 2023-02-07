/*
  Warnings:

  - The values [EXPIRED] on the enum `DappDomainStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DappDomainStatus_new" AS ENUM ('NOT_STARTED', 'PENDING', 'VERIFIED');
ALTER TABLE "DappDomainVerify" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "DappDomainVerify" ALTER COLUMN "status" TYPE "DappDomainStatus_new" USING ("status"::text::"DappDomainStatus_new");
ALTER TYPE "DappDomainStatus" RENAME TO "DappDomainStatus_old";
ALTER TYPE "DappDomainStatus_new" RENAME TO "DappDomainStatus";
DROP TYPE "DappDomainStatus_old";
ALTER TABLE "DappDomainVerify" ALTER COLUMN "status" SET DEFAULT 'NOT_STARTED';
COMMIT;
