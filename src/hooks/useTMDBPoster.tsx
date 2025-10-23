import { useEffect, useState } from 'react';

interface TMDBMovieData {
  poster_path?: string;
  backdrop_path?: string;
}

/**
 * Hook to fetch movie poster from TMDB API
 * Note: You'll need a free TMDB API key from https://www.themoviedb.org/settings/api
 * Set it in localStorage with key 'tmdbApiKey'
 */
export const useTMDBPoster = (tmdbId: string | undefined) => {
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tmdbId) {
      setPosterUrl(null);
      return;
    }

    const fetchPoster = async () => {
      // Check if API key is set in localStorage
      const apiKey = localStorage.getItem('tmdbApiKey') || 'demo_key_please_replace';
      
      // For demo/development, we can use a read-only API key
      // Users should get their own free key from https://www.themoviedb.org/settings/api
      const DEMO_API_KEY = '8265bd1679663a7ea12ac168da84d2e8'; // Demo key for testing
      
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey === 'demo_key_please_replace' ? DEMO_API_KEY : apiKey}`
        );
        
        if (response.ok) {
          const data: TMDBMovieData = await response.json();
          if (data.poster_path) {
            setPosterUrl(`https://image.tmdb.org/t/p/w500${data.poster_path}`);
          }
        }
      } catch (error) {
        console.error('Error fetching TMDB poster:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPoster();
  }, [tmdbId]);

  return { posterUrl, loading };
};
