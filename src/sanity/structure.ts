import type { StructureResolver } from 'sanity/structure'
import { HomeIcon } from '@sanity/icons'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Trust and Trip')
    .items([
      // Singleton — homepage copy
      S.listItem()
        .title('Homepage content')
        .icon(HomeIcon)
        .child(
          S.editor()
            .id('homepageContent')
            .schemaType('homepageContent')
            .documentId('homepageContent')
        ),
      S.divider(),
      S.documentTypeListItem('destination').title('Destinations'),
      S.documentTypeListItem('package').title('Packages'),
      S.divider(),
      S.documentTypeListItem('blogPost').title('Blog Posts'),
      S.divider(),
      S.documentTypeListItem('partnerLogo').title('Partner / accreditation logos'),
      S.documentTypeListItem('pressQuote').title('Press quotes'),
      S.documentTypeListItem('ugcPost').title('Traveler photographs (UGC)'),
    ])
