/** Common resource fields shared across all resource types */
export interface ResourceBase {
  title: string;
  short_description: string;
  url: string;
  platform: string;
  resource_type: string;
  level?: string;
  estimated_time?: string;
  skills?: string[];
  author?: string;
  image_url?: string;
  default_funding_type: string;
}

/** Payload for creating a new resource */
export interface ResourceCreate extends ResourceBase {}

/** Resource returned from the API */
export interface ResourceRead extends ResourceBase {
  id: string;
  skills: string[]; // Override: always present (non-optional)
  image_url: string; // Override: always present (non-optional)
  created_at: string;
  provider_metadata: Record<string, any>;
}

/** Payload for updating a resource (all fields optional) */
export type ResourceUpdate = Partial<ResourceBase>;

/** Response from resource lookup endpoint */
export interface ResourceLookupResponse {
  exists: boolean;
  normalized_url: string;
  resource: ResourceRead | null;
}

// Note: ResourceFormData removed - use LearningItemFormData from AddLearningItemForm.tsx instead

/** UI display representation of a resource (transformed from ResourceRead) */
export interface ResourceDisplay {
  id: string;
  title: string;
  description: string;
  url: string;
  image: string;
  platform: string;
  author?: string;
  type: string;
  level: string;
  estimatedTime?: string;
  skills: string[];
}

/** Transform ResourceRead (backend) to ResourceDisplay (UI) */
export function toResourceDisplay(resource: ResourceRead): ResourceDisplay {
  return {
    id: resource.id,
    title: resource.title,
    description: resource.short_description,
    url: resource.url,
    image: resource.image_url,
    platform: resource.platform,
    author: resource.author,
    type: resource.resource_type,
    level: resource.level || 'Beginner',
    estimatedTime: resource.estimated_time,
    skills: resource.skills,
  };
}

export const VALID_PLATFORMS = ["Udemy", "Coursera", "Other"] as const;
export const VALID_RESOURCE_TYPES = ["Course", "Project", "Book", "Article & Blog", "Video & Talk"] as const;
export const VALID_FUNDING_TYPES = ["gift_code", "reimbursement", "virtual_card", "org_subscription"] as const;

export type Platform = typeof VALID_PLATFORMS[number];
export type ResourceType = typeof VALID_RESOURCE_TYPES[number];
export type FundingType = typeof VALID_FUNDING_TYPES[number];
