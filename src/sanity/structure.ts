import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Trust and Trip')
    .items([
      S.documentTypeListItem('destination').title('Destinations'),
      S.documentTypeListItem('package').title('Packages'),
      S.divider(),
      S.documentTypeListItem('blogPost').title('Blog Posts'),
    ])
