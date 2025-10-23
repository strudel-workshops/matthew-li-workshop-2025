import { useEffect, useState } from 'react';
import { useDataFromSource } from './useDataFromSource';

interface Rating {
  userId: string;
  movieId: string;
  rating: string;
  timestamp: string;
}

export interface MovieRatingStats {
  averageRating: number;
  totalRatings: number;
  medianRating: number;
  recentRatings: Array<{
    userId: string;
    rating: number;
    timestamp: string;
    date: string;
  }>;
  distribution: Array<{
    rating: number;
    count: number;
  }>;
}

/**
 * Hook to get rating statistics for a specific movie
 */
export const useMovieRatings = (movieId: string | undefined): MovieRatingStats | null => {
  const allRatings = useDataFromSource('data/ratings.csv') as Rating[] | undefined;
  const [stats, setStats] = useState<MovieRatingStats | null>(null);

  useEffect(() => {
    if (!movieId || !allRatings) {
      setStats(null);
      return;
    }

    // Filter ratings for this movie
    const movieRatings = allRatings.filter((r) => r.movieId === movieId);

    if (movieRatings.length === 0) {
      setStats({
        averageRating: 0,
        medianRating: 0,
        totalRatings: 0,
        recentRatings: [],
        distribution: [],
      });
      return;
    }

    // Calculate average
    const ratings = movieRatings.map((r) => parseFloat(r.rating));
    const sum = ratings.reduce((acc, r) => acc + r, 0);
    const average = sum / ratings.length;
    
    // Calculate median
    const sorted = [...ratings].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

    // Calculate distribution (count for each rating value)
    const distributionMap = new Map<number, number>();
    ratings.forEach((rating) => {
      distributionMap.set(rating, (distributionMap.get(rating) || 0) + 1);
    });
    
    // Convert to array and sort by rating
    const distribution = Array.from(distributionMap.entries())
      .map(([rating, count]) => ({ rating, count }))
      .sort((a, b) => a.rating - b.rating);

    // Get recent ratings (last 10, sorted by timestamp)
    const sortedRatings = movieRatings
      .map((r) => ({
        userId: r.userId,
        rating: parseFloat(r.rating),
        timestamp: r.timestamp,
        date: new Date(parseInt(r.timestamp) * 1000).toLocaleDateString(),
      }))
      .sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp))
      .slice(0, 10);

    setStats({
      averageRating: Math.round(average * 10) / 10,
      medianRating: Math.round(median * 10) / 10,
      totalRatings: movieRatings.length,
      recentRatings: sortedRatings,
      distribution,
    });
  }, [movieId, allRatings]);

  return stats;
};
