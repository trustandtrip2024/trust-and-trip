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

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    destinationType,
    packageType,
    blogPostType,
    homepageContentType,
    partnerLogoType,
    pressQuoteType,
    ugcPostType,
    featuredItineraryType,
    offerBannerType,
  ],
}
