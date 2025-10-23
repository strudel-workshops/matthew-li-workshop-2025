import { useMemo } from 'react';
import { MovieWithRatings } from './useMoviesWithRatings';
import { useDataFromSource } from './useDataFromSource';

interface Tag {
  userId: string;
  movieId: string;
  tag: string;
  timestamp: string;
}

interface Rating {
  userId: string;
  movieId: string;
  rating: string;
  timestamp: string;
}

export interface MoodMovie extends MovieWithRatings {
  moodScore: number;
  matchReasons: string[];
}

export type MoodType =
  | 'feel-good'
  | 'emotional'
  | 'thrilling'
  | 'thought-provoking'
  | 'dark'
  | 'epic'
  | 'lighthearted'
  | 'inspiring';

export interface MoodDefinition {
  id: MoodType;
  name: string;
  emoji: string;
  description: string;
  genres: string[];
  keywords: string[];
  ratingMin: number;
  ratingMax: number;
  variancePreference: 'low' | 'medium' | 'any';
}

// Define mood characteristics
export const MOOD_DEFINITIONS: Record<MoodType, MoodDefinition> = {
  'feel-good': {
    id: 'feel-good',
    name: 'Feel-Good',
    emoji: '😊',
    description: 'Uplifting stories with happy endings',
    genres: ['Comedy', 'Family', 'Animation', 'Romance'],
    keywords: ['feel-good', 'heartwarming', 'fun', 'uplifting', 'charming', 'delightful'],
    ratingMin: 3.8,
    ratingMax: 5.0,
    variancePreference: 'low',
  },
  emotional: {
    id: 'emotional',
    name: 'Emotional Journey',
    emoji: '😢',
    description: 'Touching dramas that move you',
    genres: ['Drama', 'Romance'],
    keywords: ['emotional', 'touching', 'tearjerker', 'moving', 'powerful', 'dramatic'],
    ratingMin: 3.5,
    ratingMax: 5.0,
    variancePreference: 'medium',
  },
  thrilling: {
    id: 'thrilling',
    name: 'Thrilling & Intense',
    emoji: '😱',
    description: 'Edge-of-your-seat excitement',
    genres: ['Action', 'Thriller', 'Horror', 'Mystery'],
    keywords: ['suspense', 'intense', 'thrilling', 'action', 'exciting', 'gripping'],
    ratingMin: 3.0,
    ratingMax: 5.0,
    variancePreference: 'any',
  },
  'thought-provoking': {
    id: 'thought-provoking',
    name: 'Thought-Provoking',
    emoji: '🤔',
    description: 'Complex stories that make you think',
    genres: ['Sci-Fi', 'Mystery', 'Drama', 'Documentary'],
    keywords: ['mind-bending', 'philosophical', 'complex', 'thought-provoking', 'cerebral', 'intelligent'],
    ratingMin: 3.5,
    ratingMax: 5.0,
    variancePreference: 'any',
  },
  dark: {
    id: 'dark',
    name: 'Dark & Gritty',
    emoji: '🌑',
    description: 'Noir and dark thematic elements',
    genres: ['Film-Noir', 'Crime', 'Thriller', 'Horror'],
    keywords: ['dark', 'noir', 'gritty', 'bleak', 'disturbing', 'atmospheric'],
    ratingMin: 3.3,
    ratingMax: 4.7,
    variancePreference: 'medium',
  },
  epic: {
    id: 'epic',
    name: 'Epic & Grand',
    emoji: '🎭',
    description: 'Large-scale adventures and epics',
    genres: ['Adventure', 'Fantasy', 'War', 'Action'],
    keywords: ['epic', 'visually stunning', 'grand', 'spectacular', 'masterpiece', 'adventure'],
    ratingMin: 3.7,
    ratingMax: 5.0,
    variancePreference: 'low',
  },
  lighthearted: {
    id: 'lighthearted',
    name: 'Lighthearted Fun',
    emoji: '😂',
    description: 'Easy, fun entertainment',
    genres: ['Comedy', 'Romance', 'Animation'],
    keywords: ['funny', 'lighthearted', 'comedy', 'amusing', 'entertaining', 'witty'],
    ratingMin: 3.3,
    ratingMax: 5.0,
    variancePreference: 'low',
  },
  inspiring: {
    id: 'inspiring',
    name: 'Uplifting & Inspiring',
    emoji: '💪',
    description: 'Stories that motivate and inspire',
    genres: ['Drama', 'Documentary', 'Adventure'],
    keywords: ['inspiring', 'uplifting', 'motivational', 'triumph', 'hopeful', 'courage'],
    ratingMin: 3.8,
    ratingMax: 5.0,
    variancePreference: 'low',
  },
};

/**
 * Custom hook to classify movies by mood
 * Returns movies sorted by how well they match a specific mood
 */
export const useMoodClassification = (
  mood: MoodType,
  allMovies: MovieWithRatings[] | undefined,
  limit: number = 50
): MoodMovie[] => {
  const allTags = useDataFromSource('data/tags.csv') as Tag[] | undefined;
  const allRatings = useDataFromSource('data/ratings.csv') as Rating[] | undefined;

  // Pre-index tags by movieId
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

  // Calculate rating variance for each movie
  const varianceByMovie = useMemo(() => {
    if (!allRatings) return new Map<string, number>();

    const map = new Map<string, number>();
    const ratingsByMovie = new Map<string, number[]>();

    // Group ratings by movie
    allRatings.forEach((rating) => {
      const ratings = ratingsByMovie.get(rating.movieId) || [];
      ratings.push(parseFloat(rating.rating));
      ratingsByMovie.set(rating.movieId, ratings);
    });

    // Calculate variance for each movie
    ratingsByMovie.forEach((ratings, movieId) => {
      if (ratings.length > 1) {
        const mean = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        const variance =
          ratings.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) /
          ratings.length;
        map.set(movieId, variance);
      } else {
        map.set(movieId, 0);
      }
    });

    return map;
  }, [allRatings]);

  return useMemo(() => {
    if (!allMovies || !allTags || !allRatings) return [];

    const moodDef = MOOD_DEFINITIONS[mood];
    const scoredMovies: MoodMovie[] = [];

    allMovies.forEach((movie) => {
      // Calculate genre match
      const genreMatch = calculateGenreMatch(movie, moodDef);

      // Calculate tag match
      const tagMatch = calculateTagMatch(movie, moodDef, tagsByMovie);

      // Calculate rating fit
      const ratingFit = calculateRatingFit(movie, moodDef, varianceByMovie);

      // Combined mood score (0-100)
      const moodScore = Math.round(
        genreMatch * 40 + tagMatch * 40 + ratingFit * 20
      );

      // Only include movies with meaningful scores
      if (moodScore >= 30) {
        const matchReasons = generateMatchReasons(
          genreMatch,
          tagMatch,
          ratingFit,
          movie,
          moodDef
        );

        scoredMovies.push({
          ...movie,
          moodScore,
          matchReasons,
        });
      }
    });

    // Sort by mood score and return top N
    return scoredMovies
      .sort((a, b) => b.moodScore - a.moodScore)
      .slice(0, limit);
  }, [mood, allMovies, allTags, allRatings, tagsByMovie, varianceByMovie, limit]);
};

/**
 * Calculate how well a movie's genres match the mood
 */
function calculateGenreMatch(
  movie: MovieWithRatings,
  moodDef: MoodDefinition
): number {
  const movieGenres = movie.genres.split('|').map((g) => g.trim());
  const matchingGenres = movieGenres.filter((g) =>
    moodDef.genres.includes(g)
  );

  if (matchingGenres.length === 0) return 0;

  // More matching genres = higher score
  return Math.min(matchingGenres.length / moodDef.genres.length, 1);
}

/**
 * Calculate how well a movie's tags match the mood keywords
 */
function calculateTagMatch(
  movie: MovieWithRatings,
  moodDef: MoodDefinition,
  tagsByMovie: Map<string, Set<string>>
): number {
  const movieTags = tagsByMovie.get(movie.movieId);
  if (!movieTags || movieTags.size === 0) return 0;

  const matchingKeywords = moodDef.keywords.filter((keyword) =>
    Array.from(movieTags).some((tag) => tag.includes(keyword.toLowerCase()))
  );

  if (matchingKeywords.length === 0) return 0;

  // More matching keywords = higher score
  return Math.min(matchingKeywords.length / moodDef.keywords.length, 1);
}

/**
 * Calculate how well a movie's rating pattern fits the mood
 */
function calculateRatingFit(
  movie: MovieWithRatings,
  moodDef: MoodDefinition,
  varianceByMovie: Map<string, number>
): number {
  let score = 0;

  // Rating within preferred range
  if (
    movie.averageRating >= moodDef.ratingMin &&
    movie.averageRating <= moodDef.ratingMax
  ) {
    score += 0.5;
  }

  // Variance matches preference
  const variance = varianceByMovie.get(movie.movieId) || 0;
  if (moodDef.variancePreference === 'low' && variance < 0.5) {
    score += 0.5;
  } else if (moodDef.variancePreference === 'medium' && variance < 1.0) {
    score += 0.5;
  } else if (moodDef.variancePreference === 'any') {
    score += 0.5;
  }

  return score;
}

/**
 * Generate human-readable reasons for the match
 */
function generateMatchReasons(
  genreMatch: number,
  tagMatch: number,
  ratingFit: number,
  movie: MovieWithRatings,
  moodDef: MoodDefinition
): string[] {
  const reasons: string[] = [];

  if (genreMatch > 0.5) {
    const matchingGenres = movie.genres
      .split('|')
      .filter((g) => moodDef.genres.includes(g.trim()));
    reasons.push(`${matchingGenres.join(', ')} genres`);
  }

  if (tagMatch > 0.3) {
    reasons.push('Matching themes and tags');
  }

  if (movie.averageRating >= 4.0) {
    reasons.push(`Highly rated (${movie.averageRating}/5.0)`);
  }

  if (movie.totalRatings >= 100) {
    reasons.push('Popular choice');
  }

  return reasons.length > 0 ? reasons : ['Matches mood criteria'];
}
