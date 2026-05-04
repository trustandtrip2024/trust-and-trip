import { defineField, defineType } from 'sanity'
import { PinIcon } from '@sanity/icons'

export const countryType = defineType({
  name: 'country',
  title: 'Country',
  type: 'document',
  icon: PinIcon,
  fields: [
    defineField({ name: 'name', type: 'string', validation: (R) => R.required() }),
    defineField({
      name: 'slug', type: 'slug', options: { source: 'name', maxLength: 96 },
      validation: (R) => R.required(),
    }),
    defineField({ name: 'iso2', title: 'ISO 3166-1 alpha-2', type: 'string', description: 'e.g. "IN", "ID", "TH". Used for flag emoji + currency lookup.', validation: (R) => R.length(2).uppercase() }),
    defineField({
      name: 'region', title: 'Region', type: 'string',
      options: { list: ['Asia', 'Europe', 'Americas', 'Africa', 'Oceania', 'Middle East'] },
      validation: (R) => R.required(),
    }),
    defineField({ name: 'currency', title: 'Currency code', type: 'string', description: 'ISO 4217 — e.g. "INR", "IDR", "USD".' }),
    defineField({ name: 'timezone', type: 'string', description: 'IANA tz — e.g. "Asia/Kolkata".' }),
    defineField({
      name: 'visaDefault',
      title: 'Default visa info (Indian passport)',
      type: 'object',
      description: 'Inherited by every package in this country unless overridden on the package.',
      fields: [
        defineField({ name: 'required', type: 'boolean', initialValue: true }),
        defineField({ name: 'visaType', type: 'string', description: 'e.g. "Visa on arrival", "e-Visa", "Schengen", "Visa-free".' }),
        defineField({ name: 'processingDays', type: 'number' }),
        defineField({ name: 'notes', type: 'text', rows: 2 }),
      ],
    }),
    defineField({ name: 'flagEmoji', type: 'string', description: 'Optional manual override. Auto-derived from iso2 if empty.' }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'region', flag: 'flagEmoji' },
    prepare: ({ title, subtitle, flag }) => ({ title: flag ? `${flag} ${title}` : title, subtitle }),
  },
})
