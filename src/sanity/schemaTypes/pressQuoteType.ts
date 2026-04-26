import { defineField, defineType } from 'sanity'
import { CommentIcon } from '@sanity/icons'

export const pressQuoteType = defineType({
  name: 'pressQuote',
  title: 'Press quote',
  type: 'document',
  icon: CommentIcon,
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote text',
      type: 'text',
      rows: 3,
      validation: (R) => R.required().max(280),
    }),
    defineField({
      name: 'attribution',
      title: 'Attribution',
      type: 'string',
      description: 'e.g. "— Conde Nast Traveller, 2025".',
    }),
    defineField({
      name: 'sourceUrl',
      title: 'Source URL',
      type: 'url',
    }),
    defineField({
      name: 'featured',
      title: 'Featured on homepage',
      type: 'boolean',
      initialValue: false,
      description: 'Only one featured quote should be active at a time.',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published',
      type: 'date',
    }),
  ],
  preview: {
    select: { title: 'attribution', subtitle: 'quote' },
  },
})
