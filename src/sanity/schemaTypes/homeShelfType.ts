import { defineField, defineType } from 'sanity'
import { StackCompactIcon } from '@sanity/icons'

// Marketing-editable rail on the homepage. Each document = one ContentShelf
// rendered between FeaturedPackages and PilgrimSpotlight, ordered by `order`.
// The page falls back to a hardcoded triple (under-50k / visa-free / May
// trending) when no active shelf exists.
export const homeShelfType = defineType({
  name: 'homeShelf',
  title: 'Home shelf (curated rail)',
  type: 'document',
  icon: StackCompactIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      type: 'string',
      validation: (R) => R.required().max(40),
      description: 'Small label above the title (e.g. "Easy on the wallet").',
    }),
    defineField({
      name: 'title',
      type: 'string',
      validation: (R) => R.required().max(80),
      description: 'Main headline (e.g. "Trips under").',
    }),
    defineField({
      name: 'italicTail',
      title: 'Italic tail (optional)',
      type: 'string',
      validation: (R) => R.max(60),
      description: 'Italicised gold accent shown after the title (e.g. "₹50,000.").',
    }),
    defineField({
      name: 'lede',
      title: 'Subtitle / lede',
      type: 'text',
      rows: 2,
      validation: (R) => R.max(220),
    }),
    defineField({
      name: 'ctaHref',
      title: 'CTA destination',
      type: 'string',
      initialValue: '/packages',
      description: 'Where the "See all" link sends the traveler.',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA label',
      type: 'string',
      initialValue: 'See all',
      validation: (R) => R.max(28),
    }),
    defineField({
      name: 'bg',
      title: 'Background tone',
      type: 'string',
      options: {
        list: [
          { title: 'Paper (default)', value: 'paper' },
          { title: 'Cream warm', value: 'cream' },
        ],
        layout: 'radio',
      },
      initialValue: 'paper',
    }),
    defineField({
      name: 'filterType',
      title: 'How to fill the shelf',
      type: 'string',
      validation: (R) => R.required(),
      options: {
        list: [
          { title: 'Price range (under / between ₹)',           value: 'priceRange' },
          { title: 'Destination slugs (visa-free, May, …)',     value: 'destinationSlugs' },
          { title: 'Travel type (Couple / Family / Solo / Group)', value: 'travelType' },
          { title: 'Manual — pick specific packages',           value: 'manual' },
        ],
      },
    }),
    defineField({
      name: 'priceMin',
      title: 'Price min (₹)',
      type: 'number',
      hidden: ({ parent }) => parent?.filterType !== 'priceRange',
    }),
    defineField({
      name: 'priceMax',
      title: 'Price max (₹)',
      type: 'number',
      hidden: ({ parent }) => parent?.filterType !== 'priceRange',
    }),
    defineField({
      name: 'destinationSlugs',
      title: 'Destination slugs',
      type: 'array',
      of: [{ type: 'string' }],
      hidden: ({ parent }) => parent?.filterType !== 'destinationSlugs',
      description: 'Lowercase slugs (bali, char-dham, switzerland, …). Matches package.destinationSlug.',
    }),
    defineField({
      name: 'travelType',
      title: 'Travel type',
      type: 'string',
      options: {
        list: ['Couple', 'Family', 'Solo', 'Group'],
      },
      hidden: ({ parent }) => parent?.filterType !== 'travelType',
    }),
    defineField({
      name: 'manualPackages',
      title: 'Manual package picks',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'package' }] }],
      hidden: ({ parent }) => parent?.filterType !== 'manual',
    }),
    defineField({
      name: 'maxItems',
      title: 'Max items in rail',
      type: 'number',
      initialValue: 10,
      validation: (R) => R.min(1).max(20),
    }),
    defineField({
      name: 'order',
      title: 'Display order',
      type: 'number',
      initialValue: 100,
    }),
    defineField({
      name: 'active',
      title: 'Show on homepage',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  orderings: [
    {
      title: 'Display order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      eyebrow: 'eyebrow',
      filterType: 'filterType',
      active: 'active',
      order: 'order',
    },
    prepare: ({ title, eyebrow, filterType, active, order }) => ({
      title: [eyebrow, title].filter(Boolean).join(' — '),
      subtitle: [
        active ? null : 'HIDDEN',
        `#${order ?? 100}`,
        filterType,
      ].filter(Boolean).join(' · '),
    }),
  },
})
