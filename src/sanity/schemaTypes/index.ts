import { type SchemaTypeDefinition } from 'sanity'
import { destinationType } from './destinationType'
import { packageType } from './packageType'
import { blogPostType } from './blogPostType'
import { homepageContentType } from './homepageContentType'
import { partnerLogoType } from './partnerLogoType'
import { pressQuoteType } from './pressQuoteType'
import { ugcPostType } from './ugcPostType'
import { featuredItineraryType } from './featuredItineraryType'
import { offerBannerType } from './offerBannerType'
import { homeShelfType } from './homeShelfType'
import { countryType } from './countryType'
import { categoryType } from './categoryType'
import { tagType } from './tagType'
import { themeType } from './themeType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    destinationType,
    packageType,
    countryType,
    categoryType,
    tagType,
    themeType,
    blogPostType,
    homepageContentType,
    partnerLogoType,
    pressQuoteType,
    ugcPostType,
    featuredItineraryType,
    offerBannerType,
    homeShelfType,
  ],
}
