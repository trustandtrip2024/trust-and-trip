import { defineField, defineType } from 'sanity'
import { TagIcon } from '@sanity/icons'

export const partnerLogoType = defineType({
  name: 'partnerLogo',
  title: 'Partner / accreditation logo',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Partner name',
      type: 'string',
      validation: (R) => R.required(),
      description: 'e.g. "Kerala Tourism", "IATO".',
    }),
    defineField({
      name: 'kind',
      title: 'Kind',
      type: 'string',
      options: {
        list: [
          { title: 'Tourism board', value: 'tourism' },
          { title: 'Press / publication', value: 'press' },
          { title: 'Accreditation', value: 'accreditation' },
          { title: 'Booking partner', value: 'booking' },
        ],
        layout: 'radio',
      },
      initialValue: 'tourism',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo (SVG or PNG; transparent background preferred)',
      type: 'image',
      options: { hotspot: false },
    }),
    defineField({
      name: 'href',
      title: 'External link (optional)',
      type: 'url',
      validation: (R) => R.uri({ allowRelative: false, scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'flag',
      title: 'Flag emoji (used by tourism marquee)',
      type: 'string',
      description: 'e.g. 🇮🇳 — only used when kind = "tourism".',
    }),
    defineField({
      name: 'accentColor',
      title: 'Accent colour (hex, marquee strip)',
      type: 'string',
      description: 'e.g. #006400 — only used by the partner marquee.',
    }),
    defineField({
      name: 'order',
      title: 'Display order',
      type: 'number',
      initialValue: 100,
    }),
    defineField({
      name: 'active',
      title: 'Show on site',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'kind', media: 'logo' },
  },
})
