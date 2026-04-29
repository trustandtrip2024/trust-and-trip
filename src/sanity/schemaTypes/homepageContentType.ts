import { defineField, defineType } from 'sanity'
import { HomeIcon } from '@sanity/icons'

// Reusable group: eyebrow + title + italic tail + lede.
// Each field is captured separately so the rendered <em> in the title
// stays a real <em> rather than parsed HTML.
const sectionCopy = (parentName: string, label: string) =>
  defineField({
    name: parentName,
    title: label,
    type: 'object',
    options: { collapsible: true, collapsed: true },
    fields: [
      defineField({ name: 'eyebrow',     title: 'Eyebrow',      type: 'string' }),
      defineField({ name: 'titleStart',  title: 'Title (start)', type: 'string', description: 'Plain part before the italic word(s).' }),
      defineField({ name: 'titleItalic', title: 'Title (italic tail)', type: 'string', description: 'Will render in serif italic + amber accent.' }),
      defineField({ name: 'lede',        title: 'Lede paragraph', type: 'text', rows: 3 }),
    ],
  })

export const homepageContentType = defineType({
  name: 'homepageContent',
  title: 'Homepage content',
  type: 'document',
  icon: HomeIcon,
  // Singleton — gated to a single document via structure.ts.
  // Document-level actions (e.g. removing "create" / "delete") can be
  // applied through Sanity's `documentActions` config in sanity.config.ts.
  fields: [
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      options: { collapsible: true },
      fields: [
        defineField({ name: 'eyebrow',          type: 'string' }),
        defineField({ name: 'titleStart',       type: 'string' }),
        defineField({ name: 'titleItalic',      type: 'string' }),
        defineField({ name: 'lede',             type: 'text', rows: 3 }),
        defineField({ name: 'searchPlaceholder',type: 'string', description: 'e.g. Where to? Try "Bali"…' }),
        defineField({ name: 'ctaLabel',         type: 'string', description: 'Search button. e.g. Plan my trip — free' }),
        defineField({ name: 'trustStrip',       type: 'string', description: 'Single line: ⭐ 4.9 on Google · 8,000+ travelers …' }),

        // ─── Hero media ────────────────────────────────────────────────
        defineField({
          name: 'image',
          title: 'Hero background image',
          type: 'image',
          options: { hotspot: true },
          description: 'Optional. Falls back to the hard-coded hero photo when empty.',
        }),
        defineField({
          name: 'imageUrl',
          title: 'Hero image URL (override)',
          type: 'url',
          description: 'Optional. External image (Unsplash etc.). Takes precedence only if no Sanity image is uploaded.',
        }),
        defineField({
          name: 'videoUrl',
          title: 'Hero video URL (YouTube / Vimeo)',
          type: 'url',
          description:
            'Optional. When set, the hero shows a play button over the image. Click swaps the still for an autoplay iframe (LCP stays the static image).',
          validation: (R) =>
            R.uri({ scheme: ['http', 'https'] })
              .custom((v?: string) => {
                if (!v) return true;
                return /youtube\.com|youtu\.be|youtube-nocookie\.com|vimeo\.com|player\.vimeo\.com/i.test(v)
                  ? true
                  : 'Must be a YouTube or Vimeo URL.';
              }),
        }),
        defineField({
          name: 'videoPosterUrl',
          title: 'Video poster image (override)',
          type: 'url',
          description:
            'Optional. Custom thumbnail shown before play. Defaults to the hero image when empty.',
        }),
      ],
    }),

    sectionCopy('recentlyCrafted', 'Recently crafted'),
    defineField({
      name: 'threeSteps',
      title: 'Three steps',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'eyebrow',     type: 'string' }),
        defineField({ name: 'titleStart',  type: 'string' }),
        defineField({ name: 'titleItalic', type: 'string' }),
        defineField({ name: 'lede',        type: 'text', rows: 2 }),
        defineField({ name: 'closingLine', type: 'string', description: 'e.g. Free until you\'re sure. That\'s the promise.' }),
        defineField({
          name: 'steps',
          type: 'array',
          of: [{
            type: 'object',
            fields: [
              defineField({ name: 'n',    title: 'Number', type: 'string', description: 'e.g. 01' }),
              defineField({ name: 'title', type: 'string' }),
              defineField({ name: 'body',  type: 'text', rows: 2 }),
            ],
            preview: { select: { title: 'title', subtitle: 'n' } },
          }],
          validation: (R) => R.length(3),
        }),
      ],
    }),

    sectionCopy('byHowYouTravel', 'By how you travel'),
    sectionCopy('pilgrimFeature', 'Pilgrim feature'),
    sectionCopy('packagesByDuration', 'Packages by duration'),
    sectionCopy('destinations', 'Destinations'),
    sectionCopy('reviews', 'Reviews'),
    sectionCopy('ugc', 'Love from the gram'),

    defineField({
      name: 'pillars',
      title: 'Why Trust and Trip — pillars',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'eyebrow',     type: 'string' }),
        defineField({ name: 'titleStart',  type: 'string' }),
        defineField({ name: 'titleItalic', type: 'string' }),
        defineField({ name: 'lede',        type: 'text', rows: 2 }),
        defineField({ name: 'closingLine', type: 'string' }),
        defineField({
          name: 'pillars',
          type: 'array',
          of: [{
            type: 'object',
            fields: [
              defineField({
                name: 'icon', type: 'string',
                description: 'Lucide icon name (Sparkles, Heart, Eye, Compass, ShieldCheck, Award).',
              }),
              defineField({ name: 'title',    type: 'string' }),
              defineField({ name: 'headline', type: 'string' }),
              defineField({ name: 'body',     type: 'text', rows: 3 }),
            ],
            preview: { select: { title: 'title', subtitle: 'headline' } },
          }],
          validation: (R) => R.min(2).max(4),
        }),
      ],
    }),

    sectionCopy('press', 'Press / partners'),

    defineField({
      name: 'finalCta',
      title: 'Final CTA',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'eyebrow',     type: 'string' }),
        defineField({ name: 'titleStart',  type: 'string' }),
        defineField({ name: 'titleItalic', type: 'string' }),
        defineField({ name: 'lede',        type: 'text', rows: 2 }),
        defineField({ name: 'ctaLabel',    type: 'string' }),
        defineField({ name: 'microcopy',   type: 'string' }),
      ],
    }),

    defineField({
      name: 'newsletter',
      title: 'Newsletter',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'eyebrow',         type: 'string' }),
        defineField({ name: 'titleStart',      type: 'string' }),
        defineField({ name: 'titleItalic',     type: 'string' }),
        defineField({ name: 'lede',            type: 'text', rows: 2 }),
        defineField({ name: 'placeholder',     type: 'string' }),
        defineField({ name: 'buttonLabel',     type: 'string' }),
        defineField({ name: 'footerMicrocopy', type: 'string' }),
      ],
    }),
  ],
  preview: {
    select: { title: 'hero.titleStart' },
    prepare: ({ title }) => ({ title: 'Homepage content', subtitle: title ?? '' }),
  },
})
