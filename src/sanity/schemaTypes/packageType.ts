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
            defineField({
              name: 'meals',
              title: 'Meals included this day',
              type: 'object',
              description: 'Drives the B/L/D pills on each itinerary day.',
              fields: [
                defineField({ name: 'breakfast', type: 'boolean', initialValue: false }),
                defineField({ name: 'lunch', type: 'boolean', initialValue: false }),
                defineField({ name: 'dinner', type: 'boolean', initialValue: false }),
              ],
            }),
            defineField({
              name: 'images',
              title: 'Photos for this day',
              description: 'Up to 6 photos shown as a horizontal strip inside the day card.',
              type: 'array',
              of: [{ type: 'image', options: { hotspot: true } }],
              validation: (R) => R.max(6),
            }),
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

    // ─── Package detail page · phase-1 fields ──────────────────────────────
    defineField({
      name: 'whyThisPackage',
      title: 'Why this package (3 bullets)',
      type: 'array',
      description: 'Three short hooks shown above the overview. e.g. "5★ Maldives water villa · Seaplane transfer · ₹38k savings vs aggregators".',
      of: [{ type: 'string' }],
      validation: (R) => R.max(4),
    }),
    defineField({
      name: 'comparePrice',
      title: 'Aggregator comparison price (₹)',
      type: 'number',
      description: 'Approx. price for the same trip on MMT/Yatra. Renders the "vs aggregator" savings card.',
    }),
    defineField({
      name: 'bestFor',
      title: 'Best for (one line)',
      type: 'string',
      description: 'Short audience tag. e.g. "Honeymoon couples seeking quiet luxury".',
    }),
    defineField({
      name: 'bookedThisMonth',
      title: 'Booked this month (count)',
      type: 'number',
      description: 'Real or attested booking count. Powers the live activity strip near the price.',
    }),

    // ─── Phase-2 ready (renderers wire later) ──────────────────────────────
    defineField({
      name: 'hotels',
      title: 'Hotels (multi-city)',
      type: 'array',
      description: 'Optional. When set, replaces the single hotel object on the detail page with a per-city rail.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'city', type: 'string' }),
            defineField({ name: 'nights', type: 'number' }),
            defineField({ name: 'name', type: 'string' }),
            defineField({ name: 'stars', type: 'number', validation: (R) => R.min(1).max(7) }),
            defineField({ name: 'description', type: 'text', rows: 2 }),
            defineField({ name: 'image', type: 'image', options: { hotspot: true } }),
          ],
          preview: { select: { title: 'name', subtitle: 'city' } },
        }),
      ],
    }),
    defineField({
      name: 'faqs',
      title: 'Package FAQs',
      type: 'array',
      description: '5 trip-specific Qs ("Visa needed?", "Best month?", "Are flights included?"). Renders FAQPage JSON-LD.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'q', title: 'Question', type: 'string' }),
            defineField({ name: 'a', title: 'Answer', type: 'text', rows: 3 }),
          ],
          preview: { select: { title: 'q' } },
        }),
      ],
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'Hero video (YouTube/Vimeo)',
      type: 'url',
      description: 'Optional. Plays in the hero on premium packages instead of the still hero image.',
    }),

    // ─── Package detail page · phase-3 fields ──────────────────────────────
    defineField({
      name: 'departures',
      title: 'Departure dates',
      type: 'array',
      description: 'Fixed-departure batches. When set, drives the Departures grid + slots-left urgency on the booking aside.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'date', type: 'date', validation: (R) => R.required() }),
            defineField({ name: 'batchLabel', type: 'string', description: 'e.g. "Diwali batch", "Summer special".' }),
            defineField({ name: 'slotsLeft', type: 'number', description: 'Updated by ops. Drives "X slots left" urgency.' }),
            defineField({ name: 'priceOverride', title: 'Price (₹) for this batch', type: 'number', description: 'Optional per-batch price override.' }),
          ],
          preview: {
            select: { date: 'date', label: 'batchLabel', slots: 'slotsLeft' },
            prepare: ({ date, label, slots }) => ({
              title: date ?? 'No date',
              subtitle: [label, typeof slots === 'number' ? `${slots} slots` : null].filter(Boolean).join(' · '),
            }),
          },
        }),
      ],
    }),

    defineField({
      name: 'priceBreakdown',
      title: 'Price breakdown (per person, ₹)',
      type: 'object',
      description: 'Optional. Shown below the booking aside as "Per person · Double · Triple · Child · Single supplement".',
      fields: [
        defineField({ name: 'doubleSharing', title: 'Double sharing', type: 'number' }),
        defineField({ name: 'tripleSharing', title: 'Triple sharing', type: 'number' }),
        defineField({ name: 'childUnder5', title: 'Child (under 5, no bed)', type: 'number' }),
        defineField({ name: 'childUnder12', title: 'Child (5–12, with bed)', type: 'number' }),
        defineField({ name: 'singleSupplement', title: 'Single supplement', type: 'number' }),
      ],
    }),

    defineField({
      name: 'bestMonths',
      title: 'Best months to travel',
      type: 'array',
      description: 'Optional. Drives the 12-month strip below FAQs.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'month', type: 'number', validation: (R) => R.required().min(1).max(12), description: '1=Jan … 12=Dec.' }),
            defineField({
              name: 'tag',
              type: 'string',
              options: {
                list: [
                  { title: 'Peak season', value: 'peak' },
                  { title: 'Shoulder', value: 'shoulder' },
                  { title: 'Off season', value: 'off' },
                  { title: 'Avoid', value: 'avoid' },
                ],
              },
            }),
            defineField({ name: 'note', type: 'string', description: 'Short caption — e.g. "Whale-watching window".' }),
          ],
        }),
      ],
    }),

    defineField({
      name: 'groupSize',
      title: 'Group size',
      type: 'object',
      fields: [
        defineField({ name: 'min', type: 'number', validation: (R) => R.min(1) }),
        defineField({ name: 'max', type: 'number' }),
        defineField({ name: 'idealFor', type: 'string', description: 'e.g. "Couples + small families" — shown below the min/max range.' }),
      ],
    }),

    defineField({
      name: 'difficulty',
      type: 'string',
      description: 'Pilgrim/adventure packages. Renders a difficulty pill in the quick-facts strip.',
      options: {
        list: [
          { title: 'Easy', value: 'easy' },
          { title: 'Moderate', value: 'moderate' },
          { title: 'Challenging', value: 'challenging' },
          { title: 'Extreme', value: 'extreme' },
        ],
      },
    }),

    defineField({
      name: 'visaInfo',
      title: 'Visa info (Indian passport)',
      type: 'object',
      fields: [
        defineField({ name: 'required', title: 'Visa required?', type: 'boolean', initialValue: false }),
        defineField({ name: 'visaType', type: 'string', description: 'e.g. "Visa on arrival", "e-Visa", "Schengen", "Visa-free".' }),
        defineField({ name: 'processingDays', type: 'number', description: 'Typical turnaround in days.' }),
        defineField({ name: 'notes', type: 'text', rows: 2 }),
      ],
    }),

    defineField({
      name: 'packingList',
      title: 'What to pack',
      type: 'array',
      description: 'Categorised packing list. Renders as a collapsible block.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'category', type: 'string', description: 'e.g. "Clothing", "Documents", "Electronics".' }),
            defineField({ name: 'items', type: 'array', of: [{ type: 'string' }] }),
          ],
          preview: {
            select: { category: 'category', items: 'items' },
            prepare: ({ category, items }) => ({
              title: category ?? 'Category',
              subtitle: Array.isArray(items) ? `${items.length} item${items.length === 1 ? '' : 's'}` : '',
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'destination.name', media: 'image' },
    prepare({ title, subtitle, media }) {
      return { title, subtitle: subtitle ? `📍 ${subtitle}` : '', media }
    },
  },
})
