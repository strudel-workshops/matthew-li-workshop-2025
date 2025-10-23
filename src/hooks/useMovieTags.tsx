import { useEffect, useState } from 'react';
import { useDataFromSource } from './useDataFromSource';

interface Tag {
  userId: string;
  movieId: string;
  tag: string;
  timestamp: string;
}

export interface MovieTagData {
  tags: Array<{
    tag: string;
    count: number;
  }>;
  totalTags: number;
}

/**
 * Hook to get user-generated tags for a specific movie
 * Tags are aggregated and sorted by frequency
 */
export const useMovieTags = (movieId: string | undefined): MovieTagData | null => {
  const allTags = useDataFromSource('data/tags.csv') as Tag[] | undefined;
  const [tagData, setTagData] = useState<MovieTagData | null>(null);

  useEffect(() => {
    if (!movieId || !allTags) {
      setTagData(null);
      return;
    }

    // Filter tags for this movie
    const movieTags = allTags.filter((t) => t.movieId === movieId);

    if (movieTags.length === 0) {
      setTagData({
        tags: [],
        totalTags: 0,
      });
      return;
    }

    // Count tag frequency (case-insensitive)
    const tagCounts = new Map<string, number>();
    movieTags.forEach((t) => {
      const normalizedTag = t.tag.toLowerCase().trim();
      tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) || 0) + 1);
    });

    // Convert to array and sort by frequency
    const sortedTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    setTagData({
      tags: sortedTags,
      totalTags: movieTags.length,
    });
  }, [movieId, allTags]);

  return tagData;
};
