import { defineArrayMember, defineField, defineType } from 'sanity'
import { BasketIcon } from '@sanity/icons'

export const packageType = defineType({
  name: 'package',
  title: 'Package',
  type: 'document',
  icon: BasketIcon,
  fields: [
    defineField({ name: 'title', type: 'string', validation: (R) => R.required() }),
    defineField({
      name: 'slug', type: 'slug', options: { source: 'title', maxLength: 96 },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'destination', type: 'reference', to: [{ type: 'destination' }],
      validation: (R) => R.required(),
    }),
    defineField({ name: 'price', title: 'Price (₹)', type: 'number', validation: (R) => R.required().positive() }),
    defineField({ name: 'duration', title: 'Duration Label', type: 'string', description: 'e.g. "7 Days / 6 Nights"' }),
    defineField({ name: 'nights', type: 'number' }),
    defineField({ name: 'days', type: 'number' }),
    defineField({
      name: 'travelType', type: 'string',
      options: { list: ['Couple', 'Family', 'Group', 'Solo'] },
    }),
    defineField({ name: 'image', title: 'Card Image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'heroImage', title: 'Hero Image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'rating', type: 'number', validation: (R) => R.min(0).max(5) }),
    defineField({ name: 'reviews', title: 'Review Count', type: 'number' }),
    defineField({ name: 'description', type: 'text', rows: 3 }),
    defineField({ name: 'highlights', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'inclusions', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'exclusions', type: 'array', of: [{ type: 'string' }] }),
    defineField({
      name: 'hotel', title: 'Hotel', type: 'object',
      fields: [
        defineField({ name: 'name', type: 'string' }),
        defineField({ name: 'stars', type: 'number', validation: (R) => R.min(1).max(7) }),
        defineField({ name: 'description', type: 'text', rows: 2 }),
      ],
    }),
    defineField({
      name: 'itinerary', type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'title', type: 'string' }),
            defineField({ name: 'description', type: 'text', rows: 2 }),
          ],
          preview: { select: { title: 'title' } },
        }),
      ],
    }),
    defineField({ name: 'activities', type: 'array', of: [{ type: 'string' }] }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      description: 'Pick one or more themes. Drives filters and section grouping.',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Honeymoon', value: 'Honeymoon' },
          { title: 'Family', value: 'Family' },
          { title: 'Adventure', value: 'Adventure' },
          { title: 'Wellness', value: 'Wellness' },
          { title: 'Cultural', value: 'Cultural' },
          { title: 'Spiritual', value: 'Spiritual' },
          { title: 'Pilgrim', value: 'Pilgrim' },
          { title: 'Luxury', value: 'Luxury' },
          { title: 'Budget', value: 'Budget' },
          { title: 'Quick Trips', value: 'Quick Trips' },
          { title: 'Beach', value: 'Beach' },
          { title: 'Mountain', value: 'Mountain' },
          { title: 'International', value: 'International' },
          { title: 'Groups', value: 'Groups' },
          { title: 'Solo', value: 'Solo' },
        ],
      },
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      description: 'Free-form tags for search and related-package matching (e.g. "snow", "houseboat", "trekking").',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({ name: 'trending', type: 'boolean', initialValue: false }),
    defineField({ name: 'featured', type: 'boolean', initialValue: false }),
    defineField({ name: 'limitedSlots', type: 'boolean', initialValue: false }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'destination.name', media: 'image' },
    prepare({ title, subtitle, media }) {
      return { title, subtitle: subtitle ? `📍 ${subtitle}` : '', media }
    },
  },
})
