-- CreateTable
CREATE TABLE "DappInstall" (
    "id" SERIAL NOT NULL,
    "dappId" VARCHAR NOT NULL,
    "dappVersion" VARCHAR NOT NULL,
    "dappCategory" VARCHAR NOT NULL,
    "userId" VARCHAR,
    "userAddress" VARCHAR,
    "visitDate" TIMESTAMP(6),
    "downloadDate" TIMESTAMP(6),
    "installDate" TIMESTAMP(6),
    "uninstallDate" TIMESTAMP(6),
    "device" VARCHAR NOT NULL,
    "rating" INTEGER,
    "comment" VARCHAR,

    CONSTRAINT "DappInstall_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DappInstall_userAddress_idx" ON "DappInstall"("userAddress");

-- CreateIndex
CREATE INDEX "DappInstall_userId_idx" ON "DappInstall"("userId");

-- CreateIndex
CREATE INDEX "DappInstall_uninstallDate_idx" ON "DappInstall"("uninstallDate");

-- CreateIndex
CREATE INDEX "DappInstall_dappCategory_idx" ON "DappInstall"("dappCategory");

-- CreateIndex
CREATE INDEX "DappInstall_device_idx" ON "DappInstall"("device");

-- CreateIndex
CREATE INDEX "DappInstall_downloadDate_idx" ON "DappInstall"("downloadDate");

-- CreateIndex
CREATE INDEX "DappInstall_visitDate_idx" ON "DappInstall"("visitDate");

-- CreateIndex
CREATE INDEX "DappInstall_dappVersion_idx" ON "DappInstall"("dappVersion");

-- CreateIndex
CREATE INDEX "DappInstall_installDate_idx" ON "DappInstall"("installDate");

-- CreateIndex
CREATE INDEX "DappInstall_dappId_idx" ON "DappInstall"("dappId");

-- CreateIndex
CREATE UNIQUE INDEX "user_device_dapp" ON "DappInstall"("dappId", "userId", "userAddress", "device");
