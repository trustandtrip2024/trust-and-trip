import { type SchemaTypeDefinition } from 'sanity'
import { destinationType } from './destinationType'
import { packageType } from './packageType'
import { blogPostType } from './blogPostType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [destinationType, packageType, blogPostType],
}
