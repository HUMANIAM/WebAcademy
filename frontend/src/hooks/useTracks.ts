import { useState, useCallback } from 'react';
import { trackRepository } from '../repositories/trackRepository';
import { TrackCreate, TrackRead, TrackReadWithResources, TrackUpdate, TrackNameItem, TrackListResponse, TrackListParams } from '../types/track';
import { ApiError } from '../services/api';

interface UseTracksState {
  tracks: TrackRead[];
  trackNames: TrackNameItem[];
  totalTracks: number;
  totalTrackPages: number;
  loading: boolean;
  error: string | null;
}

interface UseTracksActions {
  createTrack: (data: TrackCreate) => Promise<TrackRead>;
  getTrack: (id: string) => Promise<TrackRead>;
  getTrackWithResources: (id: string) => Promise<TrackReadWithResources>;
  listTracks: (params?: TrackListParams) => Promise<TrackListResponse>;
  getTrackNames: () => Promise<TrackNameItem[]>;
  updateTrack: (id: string, data: TrackUpdate) => Promise<TrackRead>;
  clearError: () => void;
}

export function useTracks(): UseTracksState & UseTracksActions {
  const [state, setState] = useState<UseTracksState>({
    tracks: [],
    trackNames: [],
    totalTracks: 0,
    totalTrackPages: 0,
    loading: false,
    error: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState((prev: UseTracksState) => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev: UseTracksState) => ({ ...prev, error }));
  }, []);

  const setTracks = useCallback((tracks: TrackRead[] | ((prev: TrackRead[]) => TrackRead[])) => {
    if (typeof tracks === 'function') {
      setState((prev: UseTracksState) => ({ ...prev, tracks: tracks(prev.tracks) }));
    } else {
      setState((prev: UseTracksState) => ({ ...prev, tracks }));
    }
  }, []);

  const setTrackNames = useCallback((trackNames: TrackNameItem[]) => {
    setState((prev: UseTracksState) => ({ ...prev, trackNames }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const createTrack = useCallback(async (data: TrackCreate): Promise<TrackRead> => {
    try {
      setLoading(true);
      setError(null);
      const track = await trackRepository.createTrack(data);
      setTracks(prev => [...prev, track]);
      return track;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to create track';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setTracks]);

  const getTrack = useCallback(async (id: string): Promise<TrackRead> => {
    try {
      setLoading(true);
      setError(null);
      const track = await trackRepository.getTrack(id);
      return track;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to get track';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const getTrackWithResources = useCallback(async (id: string): Promise<TrackReadWithResources> => {
    try {
      setLoading(true);
      setError(null);
      const track = await trackRepository.getTrackWithResources(id);
      return track;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to get track with resources';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const listTracks = useCallback(async (params?: TrackListParams): Promise<TrackListResponse> => {
    try {
      setLoading(true);
      setError(null);
      const response = await trackRepository.listTracks(params);
      setTracks(response.items);
      setState(prev => ({ ...prev, totalTracks: response.total, totalTrackPages: response.total_pages }));
      return response;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to list tracks';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setTracks]);

  const getTrackNames = useCallback(async (): Promise<TrackNameItem[]> => {
    try {
      setLoading(true);
      setError(null);
      const trackNames = await trackRepository.getTrackNames();
      setTrackNames(trackNames);
      return trackNames;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to get track names';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setTrackNames]);

  const updateTrack = useCallback(async (id: string, data: TrackUpdate): Promise<TrackRead> => {
    try {
      setLoading(true);
      setError(null);
      const track = await trackRepository.updateTrack(id, data);
      setTracks((prevTracks: TrackRead[]) => prevTracks.map((t: TrackRead) => t.id === id ? track : t));
      return track;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to update track';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setTracks]);

  return {
    ...state,
    createTrack,
    getTrack,
    getTrackWithResources,
    listTracks,
    getTrackNames,
    updateTrack,
    clearError,
  };
}
