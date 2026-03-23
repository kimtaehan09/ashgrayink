import { MetadataRoute } from 'next'
import { galleryCategories } from '@/app/admin/(admin)/gallery/types';
 
const URL = 'https://ashgrayink.com';

export default function sitemap(): MetadataRoute.Sitemap {
  
  const galleryUrls = galleryCategories.map(category => ({
    url: `${URL}/gallery/${category.value}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as 'weekly',
    priority: 0.8,
  }));
  
  const allGalleryUrl = {
    url: `${URL}/gallery/all`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as 'weekly',
    priority: 0.8,
  }

  const staticUrls = [
    {
      url: URL,
      lastModified: new Date(),
      changeFrequency: 'monthly' as 'monthly',
      priority: 1,
    },
    {
      url: `${URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as 'yearly',
      priority: 0.5,
    },
    {
      url: `${URL}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as 'yearly',
      priority: 0.5,
    },
    {
        url: `${URL}/accessibility-statement`,
        lastModified: new Date(),
        changeFrequency: 'yearly' as 'yearly',
        priority: 0.5,
    }
  ];

  return [
    ...staticUrls,
    ...galleryUrls,
    allGalleryUrl,
  ];
}
