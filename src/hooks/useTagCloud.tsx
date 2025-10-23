import { useMemo } from 'react';
import { MovieWithRatings } from './useMoviesWithRatings';
import { useDataFromSource } from './useDataFromSource';

interface Tag {
  userId: string;
  movieId: string;
  tag: string;
  timestamp: string;
}

export interface TagCloudItem {
  tag: string;
  count: number;
  averageRating: number;
  movieIds: string[];
}

export interface TagCloudFilters {
  genres: string[];
  yearRange: [number, number];
  ratingRange: [number, number];
  minMovies: number;
}

/**
 * Custom hook to generate tag cloud data based on movie filters
 * Returns tags with their frequency, average rating, and related movies
 */
export const useTagCloud = (
  filters: TagCloudFilters,
  allMovies: MovieWithRatings[] | undefined,
  limit: number = 100
): TagCloudItem[] => {
  const allTags = useDataFromSource('data/tags.csv') as Tag[] | undefined;

  return useMemo(() => {
    if (!allMovies || !allTags) return [];

    // Filter movies based on criteria
    const filteredMovies = allMovies.filter((movie) => {
      // Extract year from title (assumes format "Title (YYYY)")
      const yearMatch = movie.title.match(/\((\d{4})\)/);
      const year = yearMatch ? parseInt(yearMatch[1]) : 0;

      // Genre filter
      const movieGenres = movie.genres.split('|').map((g) => g.trim());
      const genreMatch =
        filters.genres.length === 0 ||
        filters.genres.some((g) => movieGenres.includes(g));

      // Year filter
      const yearInRange =
        year >= filters.yearRange[0] && year <= filters.yearRange[1];

      // Rating filter
      const ratingMatch =
        movie.averageRating >= filters.ratingRange[0] &&
        movie.averageRating <= filters.ratingRange[1];

      return genreMatch && yearInRange && ratingMatch;
    });

    if (filteredMovies.length === 0) return [];

    // Get movie IDs from filtered movies
    const filteredMovieIds = new Set(
      filteredMovies.map((m) => m.movieId)
    );

    // Count tags for filtered movies
    const tagMap = new Map<string, {
      count: number;
      movieIds: Set<string>;
      totalRating: number;
    }>();

    allTags.forEach((tag) => {
      if (filteredMovieIds.has(tag.movieId)) {
        const normalizedTag = tag.tag.toLowerCase().trim();
        
        if (!tagMap.has(normalizedTag)) {
          tagMap.set(normalizedTag, {
            count: 0,
            movieIds: new Set(),
            totalRating: 0,
          });
        }

        const entry = tagMap.get(normalizedTag)!;
        entry.count++;
        entry.movieIds.add(tag.movieId);

        // Add movie rating for average calculation
        const movie = filteredMovies.find((m) => m.movieId === tag.movieId);
        if (movie) {
          entry.totalRating += movie.averageRating;
        }
      }
    });

    // Convert to array and calculate averages
    const tagCloud: TagCloudItem[] = Array.from(tagMap.entries())
      .map(([tag, data]) => ({
        tag,
        count: data.count,
        averageRating: data.totalRating / data.movieIds.size,
        movieIds: Array.from(data.movieIds),
      }))
      .filter((item) => item.movieIds.length >= filters.minMovies)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return tagCloud;
  }, [filters, allMovies, allTags, limit]);
};

/**
 * Get statistics about the tag cloud
 */
export const useTagCloudStats = (
  tagCloud: TagCloudItem[]
): {
  totalTags: number;
  totalApplications: number;
  mostPopular: TagCloudItem | null;
  averageRating: number;
} => {
  return useMemo(() => {
    if (tagCloud.length === 0) {
      return {
        totalTags: 0,
        totalApplications: 0,
        mostPopular: null,
        averageRating: 0,
      };
    }

    const totalApplications = tagCloud.reduce((sum, item) => sum + item.count, 0);
    const totalRating = tagCloud.reduce(
      (sum, item) => sum + item.averageRating * item.count,
      0
    );

    return {
      totalTags: tagCloud.length,
      totalApplications,
      mostPopular: tagCloud[0],
      averageRating: totalRating / totalApplications,
    };
  }, [tagCloud]);
};
