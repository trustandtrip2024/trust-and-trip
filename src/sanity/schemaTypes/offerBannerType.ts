import { defineField, defineType } from 'sanity'
import { TagIcon } from '@sanity/icons'

export const offerBannerType = defineType({
  name: 'offerBanner',
  title: 'Offer banner (homepage strip)',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (R) => R.required().max(40),
      description: 'Headline shown on the banner (e.g. "Bali for Two").',
    }),
    defineField({
      name: 'eyebrow',
      type: 'string',
      validation: (R) => R.max(28),
      description: 'Small label above the title (e.g. "Honeymoon", "Yatra 2026").',
    }),
    defineField({
      name: 'sub',
      type: 'string',
      validation: (R) => R.max(120),
      description: 'One-line subtitle below the title (e.g. "5N from ₹38,500 · Book by Aug 15").',
    }),
    defineField({
      name: 'ctaLabel',
      type: 'string',
      initialValue: 'View deal',
      validation: (R) => R.max(24),
    }),
    defineField({
      name: 'href',
      title: 'Click destination',
      type: 'string',
      validation: (R) => R.required(),
      description: 'Internal path (/destinations/bali) or full URL.',
    }),
    defineField({
      name: 'badge',
      type: 'string',
      validation: (R) => R.max(20),
      description: 'Top-right urgency tag (e.g. "20% off", "Limited slots").',
    }),
    defineField({
      name: 'gradient',
      type: 'string',
      description: 'Tailwind gradient classes applied to the banner background.',
      options: {
        list: [
          { title: 'Teal deep', value: 'from-tat-teal-deep via-tat-teal to-tat-teal/70' },
          { title: 'Gold / Orange', value: 'from-tat-orange via-tat-gold to-tat-gold/80' },
          { title: 'Charcoal Pilgrim', value: 'from-tat-charcoal via-tat-charcoal/90 to-tat-teal-deep' },
          { title: 'Teal / Charcoal', value: 'from-tat-teal via-tat-teal-deep to-tat-charcoal' },
          { title: 'Gold soft', value: 'from-tat-gold/90 via-tat-gold to-tat-orange/80' },
          { title: 'Cream / Charcoal', value: 'from-tat-cream-warm via-tat-paper to-tat-charcoal/40' },
        ],
      },
      initialValue: 'from-tat-teal-deep via-tat-teal to-tat-teal/70',
    }),
    defineField({
      name: 'image',
      type: 'image',
      options: { hotspot: true },
      description: 'Optional. When set, overlays the gradient with the photograph (gradient stays as fallback).',
    }),
    defineField({
      name: 'expiresAt',
      title: 'Expires at',
      type: 'datetime',
      description: 'Optional. When set, drives a live countdown on the banner. Banner hides automatically after expiry.',
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
    select: { title: 'title', subtitle: 'eyebrow', media: 'image', expiresAt: 'expiresAt' },
    prepare: ({ title, subtitle, media, expiresAt }) => ({
      title,
      subtitle: [subtitle, expiresAt && `expires ${new Date(expiresAt).toLocaleDateString()}`].filter(Boolean).join(' · '),
      media,
    }),
  },
})
