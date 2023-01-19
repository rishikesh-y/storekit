import { BaseEntity, Entity, Unique, PrimaryGeneratedColumn, Column, Index, MoreThan, Not, IsNull, FindOperator, FindOptionsWhere, In } from "typeorm";
import { IsInt, Min, Max } from "class-validator";
import Debug from "debug";

const debug = Debug("server:entity:dappInstall");

interface AppMetric {
  dappId: string;
  rating: number;
  downloads: number;
}

/**
 * A DappInstall is a record of a user downloading and installing a dapp.
 * This class is used when the dapp has an install option. This typically
 * applies for dapps which have builds (i.e. APKs) or dapps which are PWA.
 */
@Entity()
@Unique("user_device_dapp", ["dappId", "userId", "userAddress", "device"])
export class DappInstall extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false})
  @Index()
  dappId: string;

  @Column({ nullable: false})
  @Index()
  dappVersion: string;

  @Column({ nullable: false})
  @Index()
  dappCategory: string;

  /**
   * User id of the user who downloaded the dapp. Right now, there's no
   * notion of a user in the system. So, this is just a placeholder
   */
  @Column({ nullable: true})
  @Index()
  userId: string;

  /**
   * User's EVM address who downloaded the dapp
   */
  @Column({ nullable: true})
  @Index()
  userAddress: string;

  /**
   * This is to be used when the dApp has an app URL and the
   * user visits that page.
   */
  @Column({ nullable: true})
  @Index()
  visitDate: Date;

  /**
   * A user may download the dapp but not install it
   */
  @Column({ nullable: true})
  @Index()
  downloadDate: Date;

  @Column({ nullable: true})
  @Index()
  installDate: Date;

  @Column({ nullable: true})
  @Index()
  uninstallDate: Date;

  /**
   * Since user can own many devices and can install the dapp on multiple
   * devices, we need to identify the device on which the dapp was installed.
   * This field can have any information about the device. For example, it
   * can be the device id, device name, device model, etc. Its essentially a string
   * that can have arbitrary information about the device.
   */
  @Column({ nullable: false})
  @Index()
  device: string;

  /**
   * A Rating from user to this dapp. Within scale of 1 - 5
   */
  @Column({ nullable: true})
  @IsInt()
  @Min(0)
  @Max(5)
  rating: number;

  /**
   * A comment from user to this dapp
   */
  @Column({ nullable: true})
  comment: string;

  private static validate(dappId: string,
    userId: string | undefined,
    userAddress: string | undefined,
    rating: number | undefined = undefined) {
    if (!dappId) {
      throw new Error("dappId must be provided");
    }
    if (!userId && !userAddress) {
      throw new Error("Either userId or userAddress must be provided");
    }
    if (rating && (rating < 0 || rating > 5)) {
      throw new Error("rating must be between 0 and 5");
    }
    return true;
  }

  private static async findFirstInteraction(dapId: string, userId: string | undefined, userAddress: string | undefined) {
    const where: FindOptionsWhere<DappInstall> = {
      dappId: dapId
    };
    if (userId) {
      where.userId = userId;
    }
    if (userAddress) {
      where.userAddress = userAddress;
    }
    return await DappInstall.findOne({
      where: where,
      order: {
        id: "ASC",
      },
    });
  }

  public static async findDownloads(dappId: string | string[],
    userId?: string,
    userAddress?: string,
    device?: string) {
    let where: FindOptionsWhere<DappInstall> | FindOptionsWhere<DappInstall>[] = {
      dappId: typeof dappId === "string" ? dappId : In(dappId),
      downloadDate: Not(IsNull())
    };
    if (userId) {
      where = {
        ...where,
        userId: userId,
      };
    }
    if (userAddress) {
      where = {
        ...where,
        userAddress: userAddress,
      };
    }
    if (device) {
      where = {
        ...where,
        device: device,
      };
    }

    return await DappInstall.find({
      where: where,
      order: {
        downloadDate: "DESC",
      },
    });
  }

  public static async registerVisit(dappId: string,
    dappVersion: string,
    dappCategory: string,
    userId: string | undefined,
    userAddress: string | undefined,
    device: string) {
    if (this.validate(dappId, userId, userAddress)) {
      const i = new DappInstall();
      i.dappId = dappId;
      i.dappVersion = dappVersion;
      i.dappCategory = dappCategory;
      i.userId = userId ? userId : null;
      i.userAddress = userAddress ? userAddress : null;
      i.device = device;
      i.visitDate = new Date();
      await i.save();
      return i;
    }
  }

  public static async registerDownload(dappId: string,
    dappVersion: string,
    dappCategory: string,
    userId: string | undefined,
    userAddress: string | undefined,
    device: string) {
    if (this.validate(dappId, userId, userAddress)) {
      const i = new DappInstall();
      i.dappId = dappId;
      i.dappVersion = dappVersion;
      i.dappCategory = dappCategory;
      i.userId = userId ? userId : null;
      i.userAddress = userAddress ? userAddress : null;
      i.device = device;
      i.downloadDate = new Date();
      await i.save();
      return i;
    }
  }

  public static async registerUninstall(dappId: string,
    userId: string | undefined,
    userAddress: string | undefined,
    device: string) {
    if (this.validate(dappId, userId, userAddress)) {
      const i = await this.findDownloads(dappId, userId, userAddress, device);
      return i.map(async x => {
        x.uninstallDate = new Date();
        await x.save();
        return x;
      });
    }
  }

  /**
   * This registers the rating in the first row that has the specific entries.
   * @param dappId
   * @param rating
   * @param userId
   * @param userAddress
   * @returns
   */
  public static async registerRating(dappId: string,
    rating: number,
    userId?: string,
    userAddress?: string,
    comment?: string) {
    if (this.validate(dappId, userId, userAddress, rating)) {
      const firstInteraction = await this.findFirstInteraction(dappId, userId, userAddress);
      if (firstInteraction) {
        firstInteraction.rating = rating;
        firstInteraction.comment = comment;
        await firstInteraction.save();
        return firstInteraction;
      } else {
        throw new Error("No download found for the given parameters");
      }
    }
  }

  public static async registerUpdate(dappId: string,
    dappVersion: string,
    dappCategory: string,
    userId: string | undefined,
    userAddress: string | undefined,
    device: string) {
    if (this.validate(dappId, userId, userAddress)) {
      await this.registerUninstall(dappId, userId, userAddress, device);
      return await this.registerDownload(dappId,
        dappVersion,
        dappCategory,
        userId,
        userAddress,
        device);
    }
  }

  /**
   * Returns the rating & comment
   * @param dappId
   * @param userId
   * @param userAddress
   */
  public static async getUserRating(dappId: string,
    userId: string | undefined,
    userAddress: string | undefined) {
    if (this.validate(dappId, userId, userAddress)) {
      const firstInteraction = await this.findFirstInteraction(dappId, userId, userAddress);
      if (firstInteraction) {
        return {
          rating: firstInteraction.rating,
          comment: firstInteraction.comment,
        };
      }
    }
  }

  public static async getMetrics(dappIds: string[] | string):
    Promise<AppMetric[] > {
      if (!dappIds) {
        throw new Error("dappId must be provided");
      }
      const downloads = await this.findDownloads(dappIds);
      const installs = downloads.filter(x => x.downloadDate);
      const uninstalls = downloads.filter(x => x.uninstallDate);
      const ratings = downloads.filter(x => x.rating);
      const visits = downloads.filter(x => x.visitDate);
      const dappIdsArray = typeof dappIds === "string" ? [dappIds] : dappIds;
      const metrics = dappIdsArray.map(dappId => {
        const d = downloads.filter(x => x.dappId === dappId);
        const i = installs.filter(x => x.dappId === dappId);
        const u = uninstalls.filter(x => x.dappId === dappId);
        const r = ratings.filter(x => x.dappId === dappId);
        const v = visits.filter(x => x.dappId === dappId);
        return {
          dappId,
          downloads: d.length,
          installs: i.length,
          uninstalls: u.length,
          ratingsCount: r.length,
          visits: v.length,
          rating: r.length ? r.reduce((a, b) => a + b.rating, 0) / r.length : 0,
        };
      });
      return metrics;
  }

  /**
   * Get trending dapps in each category for last `days` number of days.
   * This function will return a list of dapps in each category with the following
   * structure:
   * [{ category: string, dapps: Dapp[] }]
   */
  public static async getTrendingDapps(days = 15) {
    return new Array<string>();
  }

}
