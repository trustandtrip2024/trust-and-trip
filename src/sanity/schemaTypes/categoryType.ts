import { defineField, defineType } from 'sanity'
import { TagIcon } from '@sanity/icons'

export const categoryType = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  icon: TagIcon,
  description: 'Theme/audience facet. Drives filter chips, /categories/[slug] landing pages, and homepage shelves. Replaces the hardcoded enum in package.categories[].',
  fields: [
    defineField({ name: 'label', title: 'Label', type: 'string', description: 'Display name. e.g. "Honeymoon Escapes".', validation: (R) => R.required() }),
    defineField({
      name: 'slug', type: 'slug', options: { source: 'label', maxLength: 64 },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'travelTypeAffinity',
      title: 'Travel-type affinity',
      type: 'string',
      description: 'Maps category back to the package travelType enum for default filtering.',
      options: { list: ['Couple', 'Family', 'Group', 'Solo'] },
    }),
    defineField({ name: 'tagline', type: 'string', description: 'Short hook shown on filter chips and category card.' }),
    defineField({ name: 'intro', title: 'Intro copy', type: 'text', rows: 3, description: 'Above-the-fold paragraph on /categories/[slug].' }),
    defineField({ name: 'icon', title: 'Icon image (optional)', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'heroImage', title: 'Hero image', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'highlights',
      title: 'Selling points (3–5)',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (R) => R.max(6),
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort order',
      type: 'number',
      description: 'Lower numbers appear first in chip rails. Default 100.',
      initialValue: 100,
    }),
    defineField({ name: 'showInNav', title: 'Show in main nav', type: 'boolean', initialValue: false }),
  ],
  orderings: [
    { title: 'Sort order', name: 'sortOrderAsc', by: [{ field: 'sortOrder', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'label', subtitle: 'tagline', media: 'icon' },
  },
})
