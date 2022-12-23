/**
 * Any dApp Store will have some featured sections. This Interface defines the structure of featured section and the dApps that are part of that section.
 */
export interface FeaturedSectionsInterface {
  /**
   * Title of the Featured Section. This will be displayed on the dApp Store. It should be simple and clear. Ex: 'What we're using' or 'Most Popular dApps'
   */
  title: string
  /**
   * Description of the Featured Section. This will be displayed on the dApp Store. It should be simple and clear. Ex: 'These are the dApps that we use on a daily basis.'
   */
  description: string
  /**
   * Key of the Featured Section. This will be used to identify the Featured Section. It should be simple and clear. Ex: 'what-we-are-using' or 'most-popular-dapps'. This could be used in frontend to place the sections.
   */
  key: string
  /**
   * List of dApp IDs that are part of this featured section. The dApp IDs should be the same as the ones in the dApp Store's dApps list.
   */
  dappIds: string[]
}
