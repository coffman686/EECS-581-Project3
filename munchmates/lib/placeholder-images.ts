// lib/placeholder-images.ts
// Provides a typed interface to placeholder images stored in JSON.

import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

// Export list of images with placeholder from data
export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
