import { useEffect, useState } from 'react';
import { useDataFromSource } from './useDataFromSource';

interface Movie {
  movieId: string;
  title: string;
  genres: string;
}

interface Link {
  movieId: string;
  imdbId: string;
  tmdbId: string;
}

export interface MovieWithLinks extends Movie {
  imdbId?: string;
  tmdbId?: string;
  imdbUrl?: string;
  releaseYear?: string;
}

/**
 * Custom hook to load movies data and merge it with links data
 * to provide IMDB and TMDB links for each movie
 */
export const useMoviesWithLinks = (): MovieWithLinks[] | undefined => {
  const movies = useDataFromSource('data/movies.csv') as Movie[] | undefined;
  const links = useDataFromSource('data/links.csv') as Link[] | undefined;
  const [mergedData, setMergedData] = useState<MovieWithLinks[] | undefined>();

  useEffect(() => {
    if (movies && links) {
      // Create a map of movieId to link data for quick lookup
      const linksMap = new Map<string, Link>();
      links.forEach((link) => {
        linksMap.set(link.movieId, link);
      });

      // Merge movies with their corresponding links and extract release year
      const merged = movies.map((movie) => {
        const link = linksMap.get(movie.movieId);
        
        // Extract year from title (e.g., "Toy Story (1995)" -> "1995")
        const yearMatch = movie.title.match(/\((\d{4})\)/);
        const releaseYear = yearMatch ? yearMatch[1] : undefined;
        
        const movieWithLinks: MovieWithLinks = {
          ...movie,
          imdbId: link?.imdbId,
          tmdbId: link?.tmdbId,
          imdbUrl: link?.imdbId ? `https://www.imdb.com/title/tt${link.imdbId}/` : undefined,
          releaseYear,
        };
        return movieWithLinks;
      });

      setMergedData(merged);
    }
  }, [movies, links]);

  return mergedData;
};
