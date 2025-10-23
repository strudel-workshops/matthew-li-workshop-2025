import { Box, Button, Container, Stack } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { useMoviesWithRatings, MovieWithRatings } from '../../hooks/useMoviesWithRatings';
import { useMovieRecommendations } from '../../hooks/useMovieRecommendations';
import { MovieSelector } from './-components/MovieSelector';
import { RecommendationResults } from './-components/RecommendationResults';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export const Route = createFileRoute('/recommended-movies/')({
  component: MovieRecommendations,
});

/**
 * Movie Recommendation page
 * Users select movies they like and receive personalized recommendations
 * Uses a hybrid recommendation algorithm combining genre similarity,
 * collaborative filtering, and tag matching
 */
function MovieRecommendations() {
  const allMovies = useMoviesWithRatings();
  const [selectedMovies, setSelectedMovies] = useState<MovieWithRatings[]>([]);
  const [activeMovieIds, setActiveMovieIds] = useState<string[]>([]);

  // Save selections to localStorage when they change
  useEffect(() => {
    if (selectedMovies.length > 0) {
      const ids = selectedMovies.map((m) => m.movieId);
      localStorage.setItem('selectedMovieIds', JSON.stringify(ids));
    }
  }, [selectedMovies]);

  // Load saved selections from localStorage on mount
  useEffect(() => {
    if (allMovies && allMovies.length > 0) {
      const savedIds = localStorage.getItem('selectedMovieIds');
      if (savedIds) {
        try {
          const ids = JSON.parse(savedIds) as string[];
          const movies = allMovies.filter((m) => ids.includes(m.movieId));
          if (movies.length > 0) {
            setSelectedMovies(movies);
          }
        } catch (error) {
          console.error('Error loading saved selections:', error);
        }
      }
    }
  }, [allMovies]);

  // Generate recommendations only for activeMovieIds (triggered by button)
  const recommendations = useMovieRecommendations(
    activeMovieIds,
    allMovies,
    20
  );

  const handleMoviesChange = (movies: MovieWithRatings[]) => {
    setSelectedMovies(movies);
    // Clear recommendations if no movies are selected
    if (movies.length === 0) {
      setActiveMovieIds([]);
    }
  };

  const handleGenerateRecommendations = () => {
    const ids = selectedMovies.map((m) => m.movieId);
    setActiveMovieIds(ids);
  };

  return (
    <Box>
      <PageHeader
        pageTitle="Movie Recommendations"
        description="Select movies you like to get personalized recommendations based on genre similarity, user ratings, and themes"
        sx={{
          marginBottom: 1,
          padding: 2,
        }}
      />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Movie Selection */}
        {allMovies && (
          <Stack spacing={2}>
            <MovieSelector
              allMovies={allMovies}
              selectedMovies={selectedMovies}
              onMoviesChange={handleMoviesChange}
              maxSelections={10}
            />
            {selectedMovies.length > 0 && (
              <Box display="flex" justifyContent="center">
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGenerateRecommendations}
                  startIcon={<AutoAwesomeIcon />}
                  disabled={selectedMovies.length === 0}
                >
                  Generate Recommendations
                </Button>
              </Box>
            )}
          </Stack>
        )}

        {/* Recommendation Results */}
        <Box sx={{ mt: 3 }}>
          <RecommendationResults
            recommendations={recommendations}
            loading={!allMovies}
          />
        </Box>
      </Container>
    </Box>
  );
}
