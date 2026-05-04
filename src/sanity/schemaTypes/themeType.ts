import { defineField, defineType } from 'sanity'
import { StarIcon } from '@sanity/icons'

export const themeType = defineType({
  name: 'theme',
  title: 'Theme / Editorial Collection',
  type: 'document',
  icon: StarIcon,
  description: 'Curated bundle of packages under one editorial banner ("Monsoon escapes 2026", "Diwali batch", "Under 50k international"). Replaces hardcoded homepage shelves.',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (R) => R.required() }),
    defineField({
      name: 'slug', type: 'slug', options: { source: 'title', maxLength: 80 },
      validation: (R) => R.required(),
    }),
    defineField({ name: 'subtitle', type: 'string', description: 'Short hook shown under the title on the shelf header.' }),
    defineField({ name: 'description', type: 'text', rows: 3, description: 'Long-form intro for /themes/[slug] landing page.' }),
    defineField({ name: 'heroImage', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'packages',
      title: 'Packages in this theme',
      type: 'array',
      description: 'Order matters — first item shows leftmost on the shelf.',
      of: [{ type: 'reference', to: [{ type: 'package' }] }],
      validation: (R) => R.min(1),
    }),
    defineField({
      name: 'placement',
      title: 'Where to render',
      type: 'string',
      description: 'Controls whether this theme appears as a homepage shelf, on the search page, or only on its own landing.',
      options: {
        list: [
          { title: 'Homepage shelf', value: 'home' },
          { title: 'Search page banner', value: 'search' },
          { title: 'Landing page only', value: 'landing' },
        ],
      },
      initialValue: 'home',
    }),
    defineField({
      name: 'sortOrder',
      type: 'number',
      description: 'Lower numbers appear higher on the homepage. Default 100.',
      initialValue: 100,
    }),
    defineField({
      name: 'startsAt',
      title: 'Live from',
      type: 'datetime',
      description: 'Optional. Hide this theme until the given date/time.',
    }),
    defineField({
      name: 'expiresAt',
      title: 'Hide after',
      type: 'datetime',
      description: 'Optional. Auto-hide once expired (e.g. seasonal banners).',
    }),
    defineField({ name: 'active', title: 'Active', type: 'boolean', initialValue: true, description: 'Hard kill switch — overrides startsAt/expiresAt.' }),
  ],
  orderings: [
    { title: 'Sort order', name: 'sortOrderAsc', by: [{ field: 'sortOrder', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title', subtitle: 'subtitle', media: 'heroImage', active: 'active' },
    prepare: ({ title, subtitle, media, active }) => ({
      title: active ? title : `${title} (inactive)`,
      subtitle,
      media,
    }),
  },
})
