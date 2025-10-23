import { useMemo } from 'react';
import { useDataFromSource } from './useDataFromSource';

interface Rating {
  userId: string;
  movieId: string;
  rating: string;
  timestamp: string;
}

export interface TimelineDataPoint {
  date: Date;
  rating: number;
  movingAverage: number;
  count: number;
}

/**
 * Hook to generate ratings timeline data for a movie
 * Groups ratings by time period and calculates moving averages
 */
export const useMovieRatingsTimeline = (
  movieId: string | undefined
): TimelineDataPoint[] => {
  const allRatings = useDataFromSource('data/ratings.csv') as Rating[] | undefined;

  return useMemo(() => {
    if (!movieId || !allRatings) return [];

    // Filter ratings for this movie
    const movieRatings = allRatings
      .filter((r) => r.movieId === movieId)
      .map((r) => ({
        rating: parseFloat(r.rating),
        timestamp: parseInt(r.timestamp) * 1000, // Convert to milliseconds
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    if (movieRatings.length === 0) return [];

    // Group ratings by month
    const monthlyData = new Map<string, { sum: number; count: number; timestamp: number }>();

    movieRatings.forEach((rating) => {
      const date = new Date(rating.timestamp);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          sum: 0,
          count: 0,
          timestamp: rating.timestamp,
        });
      }

      const entry = monthlyData.get(monthKey)!;
      entry.sum += rating.rating;
      entry.count += 1;
    });

    // Convert to timeline points with moving average
    const timeline: TimelineDataPoint[] = Array.from(monthlyData.entries())
      .map(([key, data]) => ({
        date: new Date(data.timestamp),
        rating: data.sum / data.count,
        count: data.count,
        movingAverage: 0, // Will calculate below
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate 3-month moving average
    const windowSize = 3;
    timeline.forEach((point, index) => {
      const start = Math.max(0, index - Math.floor(windowSize / 2));
      const end = Math.min(timeline.length, index + Math.ceil(windowSize / 2));
      const window = timeline.slice(start, end);
      
      const totalRatings = window.reduce((sum, p) => sum + p.rating * p.count, 0);
      const totalCount = window.reduce((sum, p) => sum + p.count, 0);
      
      point.movingAverage = totalRatings / totalCount;
    });

    return timeline;
  }, [movieId, allRatings]);
};
