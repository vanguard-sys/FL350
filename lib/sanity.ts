
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const getEnv = (key: string, fallback: string) => {
  if (typeof process !== 'undefined' && process?.env?.[key]) return process.env[key];
  return fallback;
};

const projectId = getEnv('SANITY_PROJECT_ID', 'placeholder-id');
const dataset = getEnv('SANITY_DATASET', 'production');

export const isSanityConfigured = projectId !== 'placeholder-id' && projectId !== 'placeholder';

export const sanityClient = createClient({
  projectId: isSanityConfigured ? projectId : 'placeholder-id', 
  dataset,
  useCdn: true,
  apiVersion: '2024-03-25',
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: any) {
  return builder.image(source);
}

export const PRODUCTS_QUERY = `*[_type == "product"]{
  "id": _id,
  name,
  category,
  price,
  description,
  "image": image.asset->url,
  specs,
  features
}`;
