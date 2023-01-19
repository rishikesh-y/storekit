import { BaseEntity, Entity, Unique, PrimaryGeneratedColumn, Column, Index, MoreThan, Not, IsNull } from "typeorm";
import { IsInt, Min, Max } from "class-validator";


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

  public static async findInstalls(dappId: string,
    userId?: string,
    userAddress?: string,
    device?: string) {
      if (this.validate(dappId, userId, userAddress)) {
        let where = {
          dappId: dappId,
          userId: userId ? userId : null,
          userAddress: userAddress ? userAddress : null,
          device: device ? device : null,
          installDate: Not(IsNull())
        };
        return await DappInstall.find({
          where: where,
          order: {
            downloadDate: "DESC",
          },
        });
      }
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

  public static async registerInstall(dappId: string,
    dappVersion: string,
    dappCategory: string,
    userId: string | undefined,
    userAddress: string | undefined,
    device: string) {
    if (this.validate(dappId, userId, userAddress)) {
      const existingInstallOnSameDevice = await this.findInstalls(dappId, userId, userAddress, device);
      if (existingInstallOnSameDevice &&
        existingInstallOnSameDevice.some(x => x.dappVersion === dappVersion)) {
        throw new Error("Dapp already installed on this device");
      }
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
      const i = await this.findInstalls(dappId, userId, userAddress, device);
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
      const i = await this.findInstalls(dappId, userId, userAddress);
      if (i) {
        i[0].rating = rating;
        i[0].comment = comment;
        await i[0].save();
        return i[0];
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
      return await this.registerInstall(dappId,
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
      const installs = await this.findInstalls(dappId, userId, userAddress);
      if (installs) {
        return {
          rating: installs[0].rating,
          comment: installs[0].comment,
        };
      }
    }
  }

  public static async overallRating(dappId: string) {
    if (!dappId) {
      throw new Error("dappId must be provided");
    }
    const installs = await this.findInstalls(dappId);
    if (installs && installs.length > 0) {
      const ratings = installs.map(x => x.rating);
      return ratings.reduce((a, b) => a + b, 0) / ratings.length;
    }
    return 0;
  }

  public static async getInstallCount(dappId: string) {
    if (!dappId) {
      throw new Error("dappId must be provided");
    }
    const installs = await this.findInstalls(dappId);
    return installs.length;
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
