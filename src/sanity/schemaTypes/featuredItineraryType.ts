import { defineField, defineType } from 'sanity'
import { CalendarIcon } from '@sanity/icons'

// Curated, anonymised real itineraries shown in the "Recently crafted" rail.
// Pulled from real bookings + permission-checked + lightly anonymised by ops.
// First name + city only (never surname), planner name shown to credit them.
export const featuredItineraryType = defineType({
  name: 'featuredItinerary',
  title: 'Featured itinerary (Recently crafted rail)',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    defineField({ name: 'firstName', title: 'Traveler first name', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'city',      title: 'Traveler city',       type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'plannerName', title: 'Planner name (credited on the card)', type: 'string', validation: (R) => R.required() }),
    defineField({
      name: 'tripStyle',
      title: 'Trip style',
      type: 'string',
      options: {
        list: ['Honeymoon', 'Family', 'Solo', 'Group', 'Pilgrim', 'Luxury', 'Adventure', 'Wellness'],
      },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'priceBucket',
      title: 'Price bucket (filter chip on home)',
      type: 'string',
      options: {
        list: [
          { title: 'Under ₹50K',     value: 'under-50k' },
          { title: '₹50K–1.5L',      value: '50k-1.5l' },
          { title: '₹1.5L–2.5L',     value: '1.5l-2.5l' },
          { title: 'Luxury',         value: 'luxury' },
          { title: 'Yatra',          value: 'yatra' },
          { title: 'Honeymoon',      value: 'honeymoon' },
        ],
      },
      validation: (R) => R.required(),
    }),
    defineField({ name: 'nights', title: 'Nights', type: 'number', validation: (R) => R.required().positive() }),
    defineField({
      name: 'primaryDestination',
      title: 'Primary destination',
      type: 'reference',
      to: [{ type: 'destination' }],
    }),
    defineField({ name: 'primaryDestinationName', title: 'Primary destination (free text fallback)', type: 'string' }),
    defineField({ name: 'otherDestinationsCount', title: 'Other destinations count', type: 'number', initialValue: 0 }),
    defineField({ name: 'price', title: 'Price (₹ per person)', type: 'number', validation: (R) => R.required().positive() }),
    defineField({
      name: 'packageRef',
      title: 'Linked package (optional — drives the card link)',
      type: 'reference',
      to: [{ type: 'package' }],
    }),
    defineField({
      name: 'plannedAt',
      title: 'Planned at',
      type: 'datetime',
      validation: (R) => R.required(),
      description: 'Used to render the "X hours/days ago" timestamp.',
    }),
    defineField({
      name: 'permissionGranted',
      title: 'Traveler granted permission to feature anonymised itinerary',
      type: 'boolean',
      initialValue: false,
      validation: (R) => R.required(),
    }),
    defineField({ name: 'active', title: 'Show on site', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { title: 'firstName', subtitle: 'tripStyle', city: 'city' },
    prepare: ({ title, subtitle, city }: any) => ({
      title: `${title} · ${city}`,
      subtitle,
    }),
  },
})
