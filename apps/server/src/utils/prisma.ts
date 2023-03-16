import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const validate = (
  dappId: string,
  userId?: string,
  userAddress?: string,
  rating?: number
) => {
  if (!dappId) {
    throw new Error("DappId is required");
  }
  if (!userId && !userAddress) {
    throw new Error("Either userId or userAddress is required");
  }
  if (rating && (rating < 1 || rating > 5)) {
    throw new Error("Rating must be between 1 and 5");
  }
  return true;
};

export const findFirstInteraction = async (
  dappId: string,
  userId?: string,
  userAddress?: string
) => {
  const where: {
    [key: string]: string;
  } = {
    dappId,
  };

  if (userId) {
    where["userId"] = userId;
  }

  if (userAddress) {
    where["userAddress"] = userAddress;
  }

  return await prisma.dappInstall.findFirst({
    where,
    orderBy: {
      id: "asc",
    },
  });
};

export const registerVisit = async (
  dappId: string,
  dappVersion: string,
  dappCategory: string,
  userId?: string,
  userAddress?: string,
  device?: string
) => {
  if (!validate(dappId, userId, userAddress)) {
    return;
  }

  return await prisma.dappInstall.create({
    data: {
      dappId,
      dappVersion,
      dappCategory,
      userId: userId || null,
      userAddress: userAddress || null,
      device: device || null,
      visitDate: new Date(),
    },
  });
};

export const registerRating = async (
  dappId: string,
  rating: number,
  userId?: string,
  userAddress?: string,
  comment: string = ""
) => {
  if (!validate(dappId, userId, userAddress, rating)) {
    return;
  }

  const firstInteraction = await findFirstInteraction(
    dappId,
    userId,
    userAddress
  );

  if (!firstInteraction) {
    throw new Error("No download found for the given parameters");
  }

  return await prisma.dappInstall.update({
    where: {
      id: firstInteraction.id,
    },
    data: {
      rating,
      comment,
    },
  });
};

export const getUserRating = async (
  dappId: string,
  userId?: string,
  userAddress?: string
) => {
  if (!validate(dappId, userId, userAddress)) {
    return;
  }

  const firstInteraction = await findFirstInteraction(
    dappId,
    userId,
    userAddress
  );

  if (!firstInteraction) {
    return;
  }

  return {
    rating: firstInteraction.rating,
    comment: firstInteraction.comment,
  };
};

export const registerDownload = async (
  dappId: string,
  dappVersion: string,
  dappCategory: string,
  userId?: string,
  userAddress?: string,
  device?: string
) => {
  if (!validate(dappId, userId, userAddress)) {
    return;
  }

  return await prisma.dappInstall.create({
    data: {
      dappId,
      dappVersion,
      dappCategory,
      userId: userId || null,
      userAddress: userAddress || null,
      device: device || null,
      downloadDate: new Date(),
    },
  });
};

export const registerUninstall = async (
  dappId: string,
  userId: string,
  userAddress: string,
  device: string
) => {
  if (!validate(dappId, userId, userAddress)) {
    return;
  }

  return await prisma.dappInstall.updateMany({
    where: {
      dappId,
      userId: userId || null,
      userAddress: userAddress || null,
      device: device || null,
    },
    data: {
      uninstallDate: new Date(),
    },
  });
};

interface AppMetric {
  dappId: string;
  downloads: number;
  installs: number;
  uninstalls: number;
  ratingsCount: number;
  visits: number;
  rating: number;
}

export const getMetrics = async (
  dappIds: string[] | string
): Promise<AppMetric[]> => {
  if (!dappIds) {
    throw new Error("dappId must be provided");
  }

  const downloads = await prisma.dappInstall.findMany({
    where: {
      dappId: {
        in: typeof dappIds === "string" ? [dappIds] : dappIds,
      },
    },
  });

  const installs = downloads.filter((d) => d.downloadDate);
  const uninstalls = downloads.filter((d) => d.uninstallDate);
  const ratings = downloads.filter((d) => d.rating);
  const visits = downloads.filter((d) => d.visitDate);

  return (typeof dappIds === "string" ? [dappIds] : dappIds).map((dappId) => {
    const d = downloads.filter((d) => d.downloadDate && d.dappId === dappId);
    const i = installs.filter((d) => d.dappId === dappId);
    const u = uninstalls.filter((d) => d.dappId === dappId);
    const r = ratings.filter((d) => d.dappId === dappId);
    const v = visits.filter((d) => d.dappId === dappId);

    return {
      dappId,
      downloads: d.length,
      installs: i.length,
      uninstalls: u.length,
      ratingsCount: r.length,
      visits: v.length,
      rating: r.reduce((a, b) => a + b.rating, 0) / r.length,
    };
  });
};
