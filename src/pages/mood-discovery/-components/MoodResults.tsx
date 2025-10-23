import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { Link } from '@tanstack/react-router';
import StarIcon from '@mui/icons-material/Star';
import { MoodMovie } from '../../../hooks/useMoodClassification';

interface MoodResultsProps {
  movies: MoodMovie[];
  moodName: string;
  loading?: boolean;
}

/**
 * Component to display movies matching a selected mood
 * Shows match percentage, rating, and reasons
 */
export const MoodResults: React.FC<MoodResultsProps> = ({
  movies,
  moodName,
  loading = false,
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (movies.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
        flexDirection="column"
        gap={2}
      >
        <Typography variant="h6" color="text.secondary">
          No movies found for this mood
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try selecting a different mood
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        {moodName} Movies ({movies.length})
      </Typography>
      <Grid container spacing={3}>
        {movies.map((movie) => (
          <Grid item xs={12} sm={6} md={4} key={movie.movieId}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Mood Match Percentage */}
                <Box sx={{ mb: 2 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography variant="h6" component="div" color="primary">
                      {movie.moodScore}% Match
                    </Typography>
                    <Chip
                      icon={<StarIcon />}
                      label={`${movie.averageRating}/5.0`}
                      size="small"
                      color={movie.averageRating >= 4.0 ? 'success' : 'default'}
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={movie.moodScore}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>

                {/* Movie Title */}
                <Typography
                  variant="h6"
                  component="div"
                  gutterBottom
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {movie.title}
                </Typography>

                {/* Genres */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                  sx={{ mb: 2 }}
                >
                  {movie.genres}
                </Typography>

                {/* Rating Stats */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {movie.totalRatings.toLocaleString()} ratings •{' '}
                    {movie.medianRating} median
                  </Typography>
                </Box>

                {/* Match Reasons */}
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    gutterBottom
                  >
                    Why it matches:
                  </Typography>
                  <Stack spacing={0.5}>
                    {movie.matchReasons.slice(0, 3).map((reason, index) => (
                      <Typography
                        key={index}
                        variant="caption"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          '&:before': {
                            content: '"•"',
                            marginRight: 0.5,
                            color: 'primary.main',
                          },
                        }}
                      >
                        {reason}
                      </Typography>
                    ))}
                  </Stack>
                </Box>
              </CardContent>

              {/* View Details Link */}
              <Box sx={{ p: 2, pt: 0 }}>
                <Link
                  to="/explore-data/$id"
                  params={{ id: movie.movieId }}
                  style={{ textDecoration: 'none' }}
                >
                  <Typography
                    variant="body2"
                    color="primary"
                    sx={{
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    View Details →
                  </Typography>
                </Link>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
