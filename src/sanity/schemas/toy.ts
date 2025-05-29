import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'toy',
  title: 'Philosophical Toy',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'inventor',
      title: 'Inventor',
      type: 'string',
    }),
    defineField({
      name: 'year',
      title: 'Year Created',
      type: 'number',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'fullDescription',
      title: 'Full Description',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Detailed description with rich text support',
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          description: 'Important for SEO and accessibility',
        },
      ],
    }),
    defineField({
      name: 'modelUrl',
      title: '3D Model URL',
      type: 'url',
      description: 'URL to the GLTF/GLB 3D model file',
    }),
    defineField({
      name: 'materialUrls',
      title: 'Material URLs',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'name', type: 'string', title: 'Material Name' },
            { name: 'url', type: 'url', title: 'Texture URL' },
            { name: 'type', type: 'string', title: 'Texture Type', options: {
              list: ['base', 'normal', 'roughness', 'metalness', 'emissive', 'ao'],
            }},
          ],
        },
      ],
      description: 'Additional material textures for the 3D model',
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'category' } }],
    }),
    defineField({
      name: 'researchPapers',
      title: 'Research Papers',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'paper' } }],
      description: 'Related academic research papers',
    }),
    defineField({
      name: 'interactionInstructions',
      title: 'Interaction Instructions',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Instructions on how to interact with this toy',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      inventor: 'inventor',
      media: 'mainImage',
    },
    prepare(selection) {
      const { inventor } = selection;
      return {
        ...selection,
        subtitle: inventor ? `by ${inventor}` : '',
      };
    },
  },
}); 