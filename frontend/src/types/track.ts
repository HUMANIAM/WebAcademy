import { TrackLevel } from '../constants/backend';

/** Common track fields shared across all track types */
export interface TrackBase {
  title: string;
  short_description: string;
  level: TrackLevel;
  estimated_time?: string;
  image_url?: string;
  skills: string[];
}

/** Reference to an existing resource */
export interface ExistingResourceRef {
  kind: 'existing';
  resource_id: string;
  position: number;
}

/** New resource data to be created and linked to track */
export interface NewResourceItem {
  kind: 'new';
  resource: {
    title: string;
    short_description: string;
    url: string;
    platform: string;
    resource_type: string;
    level: TrackLevel;
    estimated_time?: string;
    image_url?: string;
    skills?: string[];
    default_funding_type: string;
  };
  position: number;
}

/** Track resource item - either existing resource or new resource */
export type TrackResourceItem = ExistingResourceRef | NewResourceItem;

/** Payload for creating a new track */
export interface TrackCreate extends TrackBase {
  resources: TrackResourceItem[]; // resources to add to track
}

/** Track returned from the API */
export interface TrackRead extends TrackBase {
  id: string;
  skills: string[]; // Override: always present (non-optional)
  image_url: string; // Override: always present (non-optional)
  created_at?: string;
  updated_at?: string;
}

/** Track returned from the API with full resource details */
export interface TrackReadWithResources extends TrackRead {
  resources: ResourceSummary[];
}

/** Payload for updating a track (all fields optional) */
export type TrackUpdate = Partial<TrackBase>;

/** Track name item for dropdowns/autocomplete */
export interface TrackNameItem {
  id: string;
  title: string;
}

/** Resource summary within a track */
export interface ResourceSummary {
  id: string;
  title: string;
  short_description: string;
  url: string;
  platform: string;
  type: string;
  level: TrackLevel;
  skills: string[];
  estimated_time?: string;
  image_url?: string;
  position: number;
}

/** Track resource position item (for internal use) */
export interface TrackResourcePosition {
  id: string;
  position: number;
}

/** UI display representation of a track (transformed from TrackRead) */
export interface TrackDisplay {
  id: string;
  title: string;
  description: string;
  image: string;
  level: TrackLevel;
  estimated_time?: string;
  skills: string[];
  resourceCount?: number;
}

/** Track list response with pagination info */
export interface TrackListResponse {
  items: TrackRead[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/** Track list filter parameters */
export interface TrackListParams {
  search?: string;
  skill?: string[];
  level?: string[];
  page?: number;
  page_size?: number;
}
