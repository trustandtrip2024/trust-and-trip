import { defineField, defineType } from 'sanity'
import { BookmarkIcon } from '@sanity/icons'

export const tagType = defineType({
  name: 'tag',
  title: 'Tag',
  type: 'document',
  icon: BookmarkIcon,
  description: 'Governed vocabulary for package tags. Replaces free-form strings to prevent typos and duplicates ("snow" vs "Snow" vs "snowy").',
  fields: [
    defineField({ name: 'label', type: 'string', validation: (R) => R.required() }),
    defineField({
      name: 'slug', type: 'slug', options: { source: 'label', maxLength: 48 },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'kind',
      title: 'Tag kind',
      type: 'string',
      description: 'Group tags for filtering UI. e.g. activity vs landscape vs season.',
      options: {
        list: [
          { title: 'Activity', value: 'activity' },
          { title: 'Landscape', value: 'landscape' },
          { title: 'Season', value: 'season' },
          { title: 'Audience', value: 'audience' },
          { title: 'Vibe', value: 'vibe' },
          { title: 'Other', value: 'other' },
        ],
      },
      initialValue: 'other',
    }),
    defineField({ name: 'synonyms', type: 'array', of: [{ type: 'string' }], description: 'Search alternatives. e.g. "trekking" → ["trek", "hiking"].' }),
  ],
  preview: {
    select: { title: 'label', subtitle: 'kind' },
  },
})
