import { apiRequest } from '../services/api';
import {
  TrackCreate,
  TrackRead,
  TrackReadWithResources,
  TrackUpdate,
  TrackNameItem,
  ResourceSummary,
  TrackListResponse,
  TrackListParams
} from '../types/track';

export class TrackRepository {
  private static instance: TrackRepository;

  static getInstance(): TrackRepository {
    if (!TrackRepository.instance) {
      TrackRepository.instance = new TrackRepository();
    }
    return TrackRepository.instance;
  }

  async createTrack(data: TrackCreate): Promise<TrackRead> {
    return apiRequest<TrackRead>('/tracks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTrack(id: string): Promise<TrackRead> {
    return apiRequest<TrackRead>(`/tracks/${id}`);
  }

  async getTrackWithResources(id: string): Promise<TrackReadWithResources> {
    return apiRequest<TrackReadWithResources>(`/tracks/${id}/details`);
  }

  async listTracks(params?: TrackListParams): Promise<TrackListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.search) searchParams.append('search', params.search);
    if (params?.skill) params.skill.forEach(s => searchParams.append('skill', s));
    if (params?.level) params.level.forEach(l => searchParams.append('level', l));
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.page_size) searchParams.append('page_size', params.page_size.toString());
    
    const queryString = searchParams.toString();
    const url = queryString ? `/tracks?${queryString}` : '/tracks';
    
    return apiRequest<TrackListResponse>(url);
  }

  async getTrackNames(): Promise<TrackNameItem[]> {
    return apiRequest<TrackNameItem[]>('/tracks/names');
  }

  async updateTrack(id: string, data: TrackUpdate): Promise<TrackRead> {
    return apiRequest<TrackRead>(`/tracks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

// Export singleton instance
export const trackRepository = TrackRepository.getInstance();