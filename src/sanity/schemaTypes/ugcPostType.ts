import { defineField, defineType } from 'sanity'
import { ImageIcon } from '@sanity/icons'

export const ugcPostType = defineType({
  name: 'ugcPost',
  title: 'Traveler photograph (UGC)',
  type: 'document',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'image',
      title: 'Photograph',
      type: 'image',
      options: { hotspot: true },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'firstName',
      title: 'Traveler first name',
      type: 'string',
      validation: (R) => R.required(),
      description: 'First name only — never include full names without explicit consent.',
    }),
    defineField({
      name: 'destination',
      title: 'Destination',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'caption',
      title: 'Caption (optional)',
      type: 'string',
      validation: (R) => R.max(140),
    }),
    defineField({
      name: 'permissionGranted',
      title: 'Traveler granted permission to use this photo',
      type: 'boolean',
      initialValue: false,
      validation: (R) => R.required(),
      description: 'Only photographs with permissionGranted = true will appear on the site.',
    }),
    defineField({
      name: 'instagramHandle',
      title: 'Instagram handle (optional)',
      type: 'string',
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
    select: { title: 'firstName', subtitle: 'destination', media: 'image' },
    prepare: ({ title, subtitle, media }) => ({
      title: `${title} · ${subtitle}`,
      media,
    }),
  },
})
