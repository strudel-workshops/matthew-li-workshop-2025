import { useEffect, useState, useMemo } from 'react';
import { useDataFromSource } from './useDataFromSource';
import { MovieWithRatings } from './useMoviesWithRatings';

interface Rating {
  userId: string;
  movieId: string;
  rating: string;
  timestamp: string;
}

interface Tag {
  userId: string;
  movieId: string;
  tag: string;
  timestamp: string;
}

export interface RecommendedMovie extends MovieWithRatings {
  score: number;
  matchPercentage: number;
  reasons: string[];
  genreMatch: number;
  collaborativeScore: number;
  tagMatch: number;
}

/**
 * Custom hook to generate movie recommendations based on user-selected movies
 * Uses a hybrid approach combining genre similarity, collaborative filtering, and tag matching
 */
export const useMovieRecommendations = (
  selectedMovieIds: string[],
  allMovies: MovieWithRatings[] | undefined,
  maxRecommendations: number = 20
): RecommendedMovie[] => {
  const allRatings = useDataFromSource('data/ratings.csv') as Rating[] | undefined;
  const allTags = useDataFromSource('data/tags.csv') as Tag[] | undefined;
  const [recommendations, setRecommendations] = useState<RecommendedMovie[]>([]);

  // Pre-index ratings by movieId for O(1) lookup
  const ratingsByMovie = useMemo(() => {
    if (!allRatings) return new Map<string, Rating[]>();
    
    const map = new Map<string, Rating[]>();
    allRatings.forEach((rating) => {
      const ratings = map.get(rating.movieId) || [];
      ratings.push(rating);
      map.set(rating.movieId, ratings);
    });
    return map;
  }, [allRatings]);

  // Pre-index tags by movieId for O(1) lookup
  const tagsByMovie = useMemo(() => {
    if (!allTags) return new Map<string, Set<string>>();
    
    const map = new Map<string, Set<string>>();
    allTags.forEach((tag) => {
      const tags = map.get(tag.movieId) || new Set<string>();
      tags.add(tag.tag.toLowerCase().trim());
      map.set(tag.movieId, tags);
    });
    return map;
  }, [allTags]);

  useEffect(() => {
    if (!allMovies || !allRatings || !allTags || selectedMovieIds.length === 0) {
      setRecommendations([]);
      return;
    }

    // Get selected movies
    const selectedMovies = allMovies.filter((m) =>
      selectedMovieIds.includes(m.movieId)
    );

    if (selectedMovies.length === 0) {
      setRecommendations([]);
      return;
    }

    // Filter candidate movies (exclude already selected ones)
    const candidates = allMovies.filter(
      (m) => !selectedMovieIds.includes(m.movieId)
    );

    // Calculate scores for each candidate
    const scoredCandidates: RecommendedMovie[] = candidates.map((candidate) => {
      const genreMatch = calculateGenreSimilarity(candidate, selectedMovies);
      const collaborativeScore = calculateCollaborativeScoreOptimized(
        candidate,
        selectedMovies,
        ratingsByMovie
      );
      const tagMatch = calculateTagSimilarityOptimized(
        candidate,
        selectedMovies,
        tagsByMovie
      );

      // Weighted scoring: Genre (40%), Collaborative (40%), Tags (20%)
      const score =
        genreMatch * 0.4 + collaborativeScore * 0.4 + tagMatch * 0.2;

      // Generate reasons for recommendation
      const reasons = generateReasons(
        candidate,
        selectedMovies,
        genreMatch,
        collaborativeScore,
        tagMatch
      );

      return {
        ...candidate,
        score,
        matchPercentage: Math.round(score * 100),
        reasons,
        genreMatch,
        collaborativeScore,
        tagMatch,
      };
    });

    // Sort by score and take top N
    const topRecommendations = scoredCandidates
      .filter((r) => r.score > 0.1) // Filter out very low scores
      .sort((a, b) => b.score - a.score)
      .slice(0, maxRecommendations);

    setRecommendations(topRecommendations);
  }, [selectedMovieIds, allMovies, allRatings, allTags, maxRecommendations]);

  return recommendations;
};

/**
 * Calculate genre similarity between a candidate and selected movies
 */
function calculateGenreSimilarity(
  candidate: MovieWithRatings,
  selectedMovies: MovieWithRatings[]
): number {
  const candidateGenres = new Set(
    candidate.genres.split('|').filter((g) => g.trim() !== '')
  );

  if (candidateGenres.size === 0) return 0;

  let totalSimilarity = 0;
  selectedMovies.forEach((selected) => {
    const selectedGenres = new Set(
      selected.genres.split('|').filter((g) => g.trim() !== '')
    );

    // Calculate Jaccard similarity
    const intersection = new Set(
      [...candidateGenres].filter((g) => selectedGenres.has(g))
    );
    const union = new Set([...candidateGenres, ...selectedGenres]);

    if (union.size > 0) {
      totalSimilarity += intersection.size / union.size;
    }
  });

  return selectedMovies.length > 0 ? totalSimilarity / selectedMovies.length : 0;
}

/**
 * Calculate collaborative filtering score based on user rating patterns
 */
function calculateCollaborativeScore(
  candidate: MovieWithRatings,
  selectedMovies: MovieWithRatings[],
  allRatings: Rating[]
): number {
  // Find users who rated selected movies highly (>= 4.0)
  const relevantUsers = new Set<string>();
  selectedMovies.forEach((selected) => {
    allRatings
      .filter(
        (r) =>
          r.movieId === selected.movieId && parseFloat(r.rating) >= 4.0
      )
      .forEach((r) => relevantUsers.add(r.userId));
  });

  if (relevantUsers.size === 0) return 0;

  // Find ratings for candidate movie from these users
  const candidateRatings = allRatings.filter(
    (r) => r.movieId === candidate.movieId && relevantUsers.has(r.userId)
  );

  if (candidateRatings.length === 0) return 0;

  // Calculate average rating from relevant users
  const avgRating =
    candidateRatings.reduce((sum, r) => sum + parseFloat(r.rating), 0) /
    candidateRatings.length;

  // Normalize to 0-1 scale (assuming 5.0 max rating)
  // Weight by number of ratings (more ratings = more confident)
  const confidence = Math.min(candidateRatings.length / 10, 1);
  return (avgRating / 5.0) * confidence;
}

/**
 * Calculate tag similarity between candidate and selected movies
 */
function calculateTagSimilarity(
  candidate: MovieWithRatings,
  selectedMovies: MovieWithRatings[],
  allTags: Tag[]
): number {
  // Get tags for candidate
  const candidateTags = new Set(
    allTags
      .filter((t) => t.movieId === candidate.movieId)
      .map((t) => t.tag.toLowerCase().trim())
  );

  if (candidateTags.size === 0) return 0;

  // Get tags for selected movies
  const selectedTags = new Set<string>();
  selectedMovies.forEach((selected) => {
    allTags
      .filter((t) => t.movieId === selected.movieId)
      .forEach((t) => selectedTags.add(t.tag.toLowerCase().trim()));
  });

  if (selectedTags.size === 0) return 0;

  // Calculate Jaccard similarity
  const intersection = new Set(
    [...candidateTags].filter((t) => selectedTags.has(t))
  );
  const union = new Set([...candidateTags, ...selectedTags]);

  return union.size > 0 ? intersection.size / union.size : 0;
}

/**
 * Optimized collaborative filtering using pre-indexed ratings
 */
function calculateCollaborativeScoreOptimized(
  candidate: MovieWithRatings,
  selectedMovies: MovieWithRatings[],
  ratingsByMovie: Map<string, Rating[]>
): number {
  // Find users who rated selected movies highly (>= 4.0)
  const relevantUsers = new Set<string>();
  selectedMovies.forEach((selected) => {
    const ratings = ratingsByMovie.get(selected.movieId) || [];
    ratings
      .filter((r) => parseFloat(r.rating) >= 4.0)
      .forEach((r) => relevantUsers.add(r.userId));
  });

  if (relevantUsers.size === 0) return 0;

  // Find ratings for candidate movie from these users using indexed map
  const candidateRatings = (ratingsByMovie.get(candidate.movieId) || [])
    .filter((r) => relevantUsers.has(r.userId));

  if (candidateRatings.length === 0) return 0;

  // Calculate average rating from relevant users
  const avgRating =
    candidateRatings.reduce((sum, r) => sum + parseFloat(r.rating), 0) /
    candidateRatings.length;

  // Normalize to 0-1 scale (assuming 5.0 max rating)
  // Weight by number of ratings (more ratings = more confident)
  const confidence = Math.min(candidateRatings.length / 10, 1);
  return (avgRating / 5.0) * confidence;
}

/**
 * Optimized tag similarity using pre-indexed tags
 */
function calculateTagSimilarityOptimized(
  candidate: MovieWithRatings,
  selectedMovies: MovieWithRatings[],
  tagsByMovie: Map<string, Set<string>>
): number {
  // Get tags for candidate using indexed map
  const candidateTags = tagsByMovie.get(candidate.movieId);
  
  if (!candidateTags || candidateTags.size === 0) return 0;

  // Get tags for selected movies using indexed map
  const selectedTags = new Set<string>();
  selectedMovies.forEach((selected) => {
    const tags = tagsByMovie.get(selected.movieId);
    if (tags) {
      tags.forEach((t) => selectedTags.add(t));
    }
  });

  if (selectedTags.size === 0) return 0;

  // Calculate Jaccard similarity
  const intersection = new Set(
    [...candidateTags].filter((t) => selectedTags.has(t))
  );
  const union = new Set([...candidateTags, ...selectedTags]);

  return union.size > 0 ? intersection.size / union.size : 0;
}

/**
 * Generate human-readable reasons for why a movie is recommended
 */
function generateReasons(
  candidate: MovieWithRatings,
  selectedMovies: MovieWithRatings[],
  genreMatch: number,
  collaborativeScore: number,
  tagMatch: number
): string[] {
  const reasons: string[] = [];

  // Genre-based reasons
  if (genreMatch > 0.5) {
    const candidateGenres = candidate.genres.split('|').filter((g) => g.trim());
    const matchingMovies = selectedMovies.filter((selected) => {
      const selectedGenres = selected.genres.split('|');
      return candidateGenres.some((g) => selectedGenres.includes(g));
    });

    if (matchingMovies.length > 0) {
      const movieTitle = matchingMovies[0].title.replace(/\s*\(\d{4}\)$/, '');
      reasons.push(`Similar genres to "${movieTitle}"`);
    }
  }

  // Collaborative filtering reasons
  if (collaborativeScore > 0.6) {
    reasons.push('Highly rated by users with similar taste');
  }

  // Tag-based reasons
  if (tagMatch > 0.3) {
    reasons.push('Similar themes and topics');
  }

  // Overall rating
  if (candidate.averageRating >= 4.0) {
    reasons.push(`Highly rated (${candidate.averageRating}/5.0)`);
  }

  // Popularity
  if (candidate.totalRatings >= 100) {
    reasons.push('Popular choice');
  }

  return reasons.length > 0 ? reasons : ['Recommended based on your selections'];
}
