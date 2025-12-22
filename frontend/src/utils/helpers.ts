import { ResourceCreate, ResourceRead, ResourceDisplay } from '../types/resource';
import { ResourceSummary, TrackResourceItem } from '../types/track';
import { TrackLevel } from '../constants/backend';
import { LearningItemFormData, emptyLearningItemFormData } from '../components/AddLearningItemForm';

export function generateTempId(): string {
  return `unknown-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function isTmpId(id: string): boolean {
  return id.startsWith('unknown-');
}
/** Convert ResourceRead (backend) to LearningItemFormData (form) */
export function toLearningItemFormData(resource: ResourceRead): LearningItemFormData {
  const { min, max, unit } = parseEstimatedTime(resource.estimated_time);
  return {
    ...emptyLearningItemFormData,
    title: resource.title || "",
    description: resource.short_description || "",
    url: resource.url || "",
    platform: resource.platform || "",
    medium: resource.resource_type || "",
    level: resource.level || "",
    estimatedTimeMin: min,
    estimatedTimeMax: max,
    estimatedTimeUnit: unit,
    author: resource.author || "",
    image: resource.image_url || "",
    skills: resource.skills || [],
  };
}

/** Convert ResourceSummary (track resource) to LearningItemFormData (form) */
export function resourceSummaryToFormData(resource: ResourceSummary): LearningItemFormData {
  const { min, max, unit } = parseEstimatedTime(resource.estimated_time);
  return {
    ...emptyLearningItemFormData,
    title: resource.title || "",
    description: resource.short_description || "",
    url: resource.url || "",
    platform: resource.platform || "",
    medium: resource.type || "",
    level: resource.level || "",
    estimatedTimeMin: min,
    estimatedTimeMax: max,
    estimatedTimeUnit: unit,
    author: "", // ResourceSummary doesn't include author
    image: resource.image_url || "",
    skills: resource.skills || [],
  };
}

/** Convert LearningItemFormData to ResourceSummary (for track resources) */
export function toResourceSummary(form: LearningItemFormData, id: string = '', position: number = 0): ResourceSummary {
  return {
    id,
    title: form.title,
    short_description: form.description,
    url: form.url || '',
    platform: form.platform || '',
    type: form.medium || '',
    level: (form.level as TrackLevel) || 'Beginner',
    skills: form.skills || [],
    estimated_time: buildEstimatedTime(form.estimatedTimeMin, form.estimatedTimeMax, form.estimatedTimeUnit) || '',
    image_url: form.image || '',
    position
  };
}

/** Convert ResourceSummary[] to TrackResourceItem[] for backend */
export function toTrackResourceItems(resources: ResourceSummary[]): TrackResourceItem[] {
  return resources.map((resource, index) => {
    // If resource has a real ID (not temporary), it's an existing published resource
    if (resource.id && !isTmpId(resource.id)) {
      return {
        kind: 'existing' as const,
        resource_id: resource.id,
        position: index
      };
    } else {
      // New resource to be created and linked to track
      return {
        kind: 'new' as const,
        resource: {
          title: resource.title,
          short_description: resource.short_description,
          url: resource.url,
          platform: resource.platform || 'Other',
          resource_type: resource.type || 'Course',
          level: resource.level as TrackLevel,
          skills: resource.skills,
          estimated_time: resource.estimated_time,
          image_url: resource.image_url,
          default_funding_type: 'reimbursement'
        },
        position: index
      };
    }
  });
}

/** Map form data to ResourceCreate for backend API */
export function toResourceCreate(form: LearningItemFormData): ResourceCreate {
  return {
    title: form.title,
    short_description: form.description,
    url: form.url || '',
    platform: form.platform || 'Other',
    resource_type: form.medium || 'Course',
    level: form.level || undefined,
    estimated_time: buildEstimatedTime(form.estimatedTimeMin, form.estimatedTimeMax, form.estimatedTimeUnit),
    skills: form.skills.length > 0 ? form.skills : undefined,
    author: form.author || undefined,
    image_url: form.image || undefined,
    default_funding_type: 'reimbursement',
  };
}

/** Helper to build estimated_time string from parts (for form submission) */
export function buildEstimatedTime(min?: string, max?: string, unit?: string): string | undefined {
  const minVal = min?.trim();
  const maxVal = max?.trim();
  const unitVal = unit?.trim();
  
  if (!unitVal || (!minVal && !maxVal)) return undefined;
  if (minVal && maxVal) return `${minVal} - ${maxVal} ${unitVal}`;
  if (minVal) return `${minVal} ${unitVal}`;
  if (maxVal) return `${maxVal} ${unitVal}`;
  return undefined;
}

/** Helper to parse estimated_time string into parts (for form editing) */
export function parseEstimatedTime(estimatedTime?: string): { min: string; max: string; unit: string } {
  if (!estimatedTime) return { min: "", max: "", unit: "" };
  
  // Match "min - max unit" format
  const rangeMatch = estimatedTime.match(/^(\d+)\s*-\s*(\d+)\s+(.+)$/);
  if (rangeMatch) return { min: rangeMatch[1], max: rangeMatch[2], unit: rangeMatch[3] };
  
  // Match "value unit" format
  const singleMatch = estimatedTime.match(/^(\d+)\s+(.+)$/);
  if (singleMatch) return { min: singleMatch[1], max: "", unit: singleMatch[2] };
  
  return { min: "", max: "", unit: "" };
}
