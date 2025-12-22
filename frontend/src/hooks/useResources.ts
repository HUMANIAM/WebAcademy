import { useState, useCallback } from 'react';
import { resourceRepository, ResourceListParams, ResourceListResponse } from '../repositories/resourceRepository';
import { ResourceCreate, ResourceRead, ResourceUpdate, ResourceLookupResponse } from '../types/resource';
import { ApiError } from '../services/api';

interface UseResourcesState {
  resources: ResourceRead[];
  total: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
}

interface UseResourcesActions {
  createResource: (data: ResourceCreate) => Promise<ResourceRead>;
  getResource: (id: string) => Promise<ResourceRead>;
  listResources: (params?: ResourceListParams) => Promise<ResourceListResponse>;
  updateResource: (id: string, data: ResourceUpdate) => Promise<ResourceRead>;
  clearError: () => void;
}

export function useResources(): UseResourcesState & UseResourcesActions {
  const [state, setState] = useState<UseResourcesState>({
    resources: [],
    total: 0,
    totalPages: 0,
    currentPage: 1,
    loading: false,
    error: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setResources = useCallback((resources: ResourceRead[]) => {
    setState(prev => ({ ...prev, resources }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const createResource = useCallback(async (data: ResourceCreate): Promise<ResourceRead> => {
    setLoading(true);
    setError(null);
    
    try {
      const newResource = await resourceRepository.createResource(data);
      
      // Add to local state
      setState(prev => ({
        ...prev,
        resources: [...prev.resources, newResource],
        loading: false,
      }));
      
      return newResource;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to create resource';
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  }, [setLoading, setError]);

  const getResource = useCallback(async (id: string): Promise<ResourceRead> => {
    setLoading(true);
    setError(null);
    
    try {
      const resource = await resourceRepository.getResource(id);
      setLoading(false);
      return resource;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to get resource';
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  }, [setLoading, setError]);

  const listResources = useCallback(async (params?: ResourceListParams): Promise<ResourceListResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await resourceRepository.listResources(params);
      setState(prev => ({
        ...prev,
        resources: response.items,
        total: response.total,
        totalPages: response.total_pages,
        currentPage: response.page,
        loading: false,
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to list resources';
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  }, [setLoading, setError]);

  const updateResource = useCallback(async (id: string, data: ResourceUpdate): Promise<ResourceRead> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedResource = await resourceRepository.updateResource(id, data);
      
      // Update local state
      setState(prev => ({
        ...prev,
        resources: prev.resources.map(r => r.id === id ? updatedResource : r),
        loading: false,
      }));
      
      return updatedResource;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to update resource';
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  }, [setLoading, setError]);

  return {
    ...state,
    createResource,
    getResource,
    listResources,
    updateResource,
    clearError,
  };
}
