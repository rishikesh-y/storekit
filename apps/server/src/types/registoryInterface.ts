import { DAppInterface } from "./dappInterface"
import { FeaturedSectionsInterface } from "./featuredInterface"
/**
 * Interface for dApp Store
 */
export interface DAppStoreInterface {
  /**
   * Title of the dApp Store
   */
  title: string
  /**
   * List of chains supported by the dApp. This should be chainID of an EVM powered network. Ref https://chainlist.org/
   */
  chains: number[]
  /**
  * A list of dApps
  * */
  dapps: DAppInterface[]
  /**  
  * A list of featured dApps
  * */
  featuredSections:  FeaturedSectionsInterface[] 
}