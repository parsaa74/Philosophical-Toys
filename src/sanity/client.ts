import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';

// This is the configuration for the Sanity client
// Replace with your actual project ID and dataset when ready
export const config = {
  projectId: 'your-project-id', // replace with actual project ID
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: process.env.NODE_ENV === 'production',
};

export const client = createClient(config);

// Helper function to generate image URLs from Sanity image references
const builder = imageUrlBuilder(client);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any) {
  return builder.image(source);
}

// Fetch toys from Sanity
export async function getToys() {
  return client.fetch(`*[_type == "toy"] | order(name asc) {
    _id,
    name,
    slug,
    inventor,
    year,
    description,
    "imageUrl": mainImage.asset->url,
    modelUrl
  }`);
}

// Fetch a specific toy by slug
export async function getToyBySlug(slug: string) {
  return client.fetch(`*[_type == "toy" && slug.current == $slug][0] {
    _id,
    name, 
    slug,
    inventor,
    year,
    description,
    fullDescription,
    mainImage {
      asset->,
      alt
    },
    modelUrl,
    materialUrls,
    "categories": categories[]->{ _id, title },
    "researchPapers": researchPapers[]->{ _id, title, url },
    interactionInstructions
  }`, { slug });
}

// Fetch categories
export async function getCategories() {
  return client.fetch(`*[_type == "category"] | order(title asc) {
    _id,
    title,
    description
  }`);
}

// Fetch toys by category
export async function getToysByCategory(categoryId: string) {
  return client.fetch(`*[_type == "toy" && $categoryId in categories[]._ref] | order(name asc) {
    _id,
    name,
    slug,
    inventor,
    year,
    description,
    "imageUrl": mainImage.asset->url,
    modelUrl
  }`, { categoryId });
} 