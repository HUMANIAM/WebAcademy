import { apiRequest } from '../services/api';
import { ResourceCreate, ResourceRead, ResourceUpdate, ResourceLookupResponse } from '../types/resource';

export interface ResourceListParams {
  search?: string;
  skill?: string[];
  level?: string[];
  resource_type?: string[];
  page?: number;
  page_size?: number;
}

export interface ResourceListResponse {
  items: ResourceRead[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export class ResourceRepository {
  private static instance: ResourceRepository;

  static getInstance(): ResourceRepository {
    if (!ResourceRepository.instance) {
      ResourceRepository.instance = new ResourceRepository();
    }
    return ResourceRepository.instance;
  }

  async createResource(data: ResourceCreate): Promise<ResourceRead> {
    return apiRequest<ResourceRead>('/resources', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getResource(id: string): Promise<ResourceRead> {
    return apiRequest<ResourceRead>(`/resources/${id}`);
  }

  async listResources(params?: ResourceListParams): Promise<ResourceListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.search) searchParams.append('search', params.search);
    if (params?.skill) params.skill.forEach(s => searchParams.append('skill', s));
    if (params?.level) params.level.forEach(l => searchParams.append('level', l));
    if (params?.resource_type) params.resource_type.forEach(r => searchParams.append('resource_type', r));
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.page_size) searchParams.append('page_size', params.page_size.toString());
    
    const queryString = searchParams.toString();
    const url = queryString ? `/resources?${queryString}` : '/resources';
    
    return apiRequest<ResourceListResponse>(url);
  }

  async updateResource(id: string, data: ResourceUpdate): Promise<ResourceRead> {
    return apiRequest<ResourceRead>(`/resources/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async lookupResourceByUrl(url: string): Promise<ResourceLookupResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('url', url);
    
    return apiRequest<ResourceLookupResponse>(`/resources/lookup?${searchParams.toString()}`);
  }
}

export const resourceRepository = ResourceRepository.getInstance();
