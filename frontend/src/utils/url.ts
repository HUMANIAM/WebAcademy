import { ResourceRead } from '../types/resource';
import { resourceRepository } from '../repositories/resourceRepository';

/** Check if a resource exists by URL and return the resource or null */
export async function checkResourceExists(url: string): Promise<ResourceRead | null> {
  if (!url || url.length <= 8) {
    return null;
  }

  try {
    const response = await resourceRepository.lookupResourceByUrl(url);
    
    if (response.exists && response.resource) {
      return response.resource;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

