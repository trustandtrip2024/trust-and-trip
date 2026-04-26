import { defineField, defineType } from 'sanity'
import { EarthGlobeIcon } from '@sanity/icons'

export const destinationType = defineType({
  name: 'destination',
  title: 'Destination',
  type: 'document',
  icon: EarthGlobeIcon,
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (R) => R.required() }),
    defineField({
      name: 'slug', type: 'slug', options: { source: 'name', maxLength: 96 },
      validation: (R) => R.required(),
    }),
    defineField({ name: 'country', title: 'Country', type: 'string', validation: (R) => R.required() }),
    defineField({
      name: 'region', title: 'Region', type: 'string',
      options: {
        list: ['Asia', 'Europe', 'Americas', 'Africa', 'Oceania', 'Middle East'],
      },
      validation: (R) => R.required(),
    }),
    defineField({ name: 'priceFrom', title: 'Price From (₹)', type: 'number', validation: (R) => R.required().positive() }),
    defineField({ name: 'tagline', title: 'Tagline', type: 'string' }),
    defineField({
      name: 'whisper',
      title: 'Whisper (poetic one-liner shown on home destination cards)',
      type: 'string',
      description: 'Editorial single line, ~6–10 words. e.g. "Slow water, slower mornings."',
      validation: (R) => R.max(120),
    }),
    defineField({
      name: 'image', title: 'Card Image', type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'heroImage', title: 'Hero Image', type: 'image',
      options: { hotspot: true },
    }),
    defineField({ name: 'overview', title: 'Overview', type: 'text', rows: 4 }),
    defineField({ name: 'bestTimeToVisit', title: 'Best Time to Visit', type: 'string' }),
    defineField({ name: 'idealDuration', title: 'Ideal Duration', type: 'string' }),
    defineField({
      name: 'thingsToDo', title: 'Things to Do', type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'highlights', title: 'Highlights', type: 'array',
      of: [{ type: 'string' }],
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'country', media: 'image' },
  },
})
