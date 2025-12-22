import { useState, useCallback, useRef, useEffect } from 'react';
import { skillRepository } from '../repositories/skillRepository';

interface UseSkillSearchOptions {
  debounceMs?: number;
  limit?: number;
}

interface UseSkillSearchResult {
  results: string[];
  isLoading: boolean;
  error: string | null;
  search: (query: string) => void;
  fetchInitial: () => void;
  clearResults: () => void;
}

export function useSkillSearch(options: UseSkillSearchOptions = {}): UseSkillSearchResult {
  const {
    debounceMs = 300,
    limit = 20,
  } = options;

  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debounceTimerRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  // Fetch initial skills (empty query)
  const fetchInitial = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      const skills = await skillRepository.searchSkills('', limit);
      setResults(skills);
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch skills');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  const search = useCallback((query: string) => {
    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const trimmedQuery = query.trim();

    // Empty query - fetch all skills
    if (!trimmedQuery) {
      fetchInitial();
      return;
    }

    setIsLoading(true);

    // Debounce the API call for typed queries
    debounceTimerRef.current = window.setTimeout(async () => {
      abortControllerRef.current = new AbortController();

      try {
        const skills = await skillRepository.searchSkills(trimmedQuery, limit);
        setResults(skills);
        setError(null);
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to search skills');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);
  }, [debounceMs, limit, fetchInitial]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    results,
    isLoading,
    error,
    search,
    fetchInitial,
    clearResults,
  };
}
