import { defineField, defineType } from 'sanity'
import { DocumentTextIcon } from '@sanity/icons'

export const blogPostType = defineType({
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({ name: 'title', type: 'string', validation: (R) => R.required() }),
    defineField({
      name: 'slug', type: 'slug', options: { source: 'title', maxLength: 96 },
      validation: (R) => R.required(),
    }),
    defineField({ name: 'category', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'excerpt', type: 'text', rows: 2, validation: (R) => R.required() }),
    defineField({
      name: 'content', title: 'Content (paragraphs)', type: 'text', rows: 12,
      description: 'Separate paragraphs with a blank line. Wrap a paragraph in quotes for a blockquote.',
    }),
    defineField({
      name: 'image', title: 'Cover Image', type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', type: 'string', title: 'Alt text' })],
    }),
    defineField({ name: 'author', type: 'string', initialValue: 'Trust and Trip' }),
    defineField({ name: 'date', type: 'date' }),
    defineField({ name: 'readTime', title: 'Read Time', type: 'string', description: 'e.g. "5 min read"' }),
    defineField({ name: 'featured', type: 'boolean', initialValue: false }),
    defineField({
      name: 'tags', type: 'array', of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'category', media: 'image' },
  },
})
