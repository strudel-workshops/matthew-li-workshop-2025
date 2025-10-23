import { useEffect, useState } from 'react';
import { useDataFromSource } from './useDataFromSource';

interface Movie {
  movieId: string;
  title: string;
  genres: string;
}

interface Rating {
  userId: string;
  movieId: string;
  rating: string;
  timestamp: string;
}

export interface MovieWithRatings extends Movie {
  averageRating: number;
  totalRatings: number;
  medianRating: number;
}

/**
 * Custom hook to load movies data and calculate rating statistics for each movie
 */
export const useMoviesWithRatings = (): MovieWithRatings[] | undefined => {
  const movies = useDataFromSource('data/movies.csv') as Movie[] | undefined;
  const allRatings = useDataFromSource('data/ratings.csv') as Rating[] | undefined;
  const [mergedData, setMergedData] = useState<MovieWithRatings[] | undefined>();

  useEffect(() => {
    if (movies && allRatings) {
      // Group ratings by movieId
      const ratingsByMovie = new Map<string, number[]>();
      allRatings.forEach((rating) => {
        const ratings = ratingsByMovie.get(rating.movieId) || [];
        ratings.push(parseFloat(rating.rating));
        ratingsByMovie.set(rating.movieId, ratings);
      });

      // Merge movies with their rating statistics
      const merged = movies.map((movie) => {
        const ratings = ratingsByMovie.get(movie.movieId) || [];
        
        let averageRating = 0;
        let medianRating = 0;
        
        if (ratings.length > 0) {
          // Calculate average
          const sum = ratings.reduce((acc, r) => acc + r, 0);
          averageRating = Math.round((sum / ratings.length) * 10) / 10;
          
          // Calculate median
          const sorted = [...ratings].sort((a, b) => a - b);
          medianRating = sorted.length % 2 === 0
            ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
            : sorted[Math.floor(sorted.length / 2)];
          medianRating = Math.round(medianRating * 10) / 10;
        }

        const movieWithRatings: MovieWithRatings = {
          ...movie,
          averageRating,
          totalRatings: ratings.length,
          medianRating,
        };
        return movieWithRatings;
      });

      setMergedData(merged);
    }
  }, [movies, allRatings]);

  return mergedData;
};
