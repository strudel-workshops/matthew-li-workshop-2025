import { Box, Container, Grid, Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { useMoviesWithRatings } from '../../hooks/useMoviesWithRatings';
import {
  useMoodClassification,
  MOOD_DEFINITIONS,
  MoodType,
} from '../../hooks/useMoodClassification';
import { MoodCard } from './-components/MoodCard';
import { MoodResults } from './-components/MoodResults';

export const Route = createFileRoute('/mood-discovery/')({
  component: MoodDiscovery,
});

/**
 * Mood-Based Discovery page
 * Users select a mood and see movies that match that emotional experience
 * Uses genres, tags, and rating patterns to classify movies
 */
function MoodDiscovery() {
  const allMovies = useMoviesWithRatings();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);

  // Get mood classification results
  const moodMovies = useMoodClassification(
    selectedMood || 'feel-good',
    allMovies,
    50
  );

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);
  };

  const selectedMoodDef = selectedMood
    ? MOOD_DEFINITIONS[selectedMood]
    : null;

  return (
    <Box>
      <PageHeader
        pageTitle="Mood-Based Discovery"
        description="Find movies that match your current mood or feeling"
        sx={{
          marginBottom: 1,
          padding: 2,
        }}
      />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Mood Selection Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            How are you feeling?
          </Typography>
          <Grid container spacing={2}>
            {Object.values(MOOD_DEFINITIONS).map((mood) => (
              <Grid item xs={12} sm={6} md={3} key={mood.id}>
                <MoodCard
                  mood={mood}
                  selected={selectedMood === mood.id}
                  onClick={() => handleMoodSelect(mood.id)}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Results Section */}
        {selectedMood && (
          <Box sx={{ mt: 4 }}>
            <MoodResults
              movies={moodMovies}
              moodName={selectedMoodDef?.name || ''}
              loading={!allMovies}
            />
          </Box>
        )}

        {/* Initial State - No Mood Selected */}
        {!selectedMood && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight={200}
            sx={{ mt: 4 }}
          >
            <Typography variant="h6" color="text.secondary">
              Select a mood above to discover movies
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}
