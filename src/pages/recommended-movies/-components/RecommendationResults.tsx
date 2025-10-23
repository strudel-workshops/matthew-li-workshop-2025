import {
  Box,
  Button,
  Card,
  CardActions,
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
import { RecommendedMovie } from '../../../hooks/useMovieRecommendations';

interface RecommendationResultsProps {
  recommendations: RecommendedMovie[];
  loading?: boolean;
}

/**
 * Component for displaying movie recommendations in a grid layout
 * Shows match percentage, rating, and reasons for each recommendation
 */
export const RecommendationResults: React.FC<RecommendationResultsProps> = ({
  recommendations,
  loading = false,
}) => {
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
      >
        <Typography variant="body1" color="text.secondary">
          Select some movies above to get personalized recommendations
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Recommended For You
      </Typography>
      <Grid container spacing={3}>
        {recommendations.map((movie) => (
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
                {/* Match Percentage */}
                <Box sx={{ mb: 2 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography variant="h6" component="div" color="primary">
                      {movie.matchPercentage}% Match
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
                    value={movie.matchPercentage}
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

                {/* Reasons */}
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    gutterBottom
                  >
                    Why recommended:
                  </Typography>
                  <Stack spacing={0.5}>
                    {movie.reasons.slice(0, 3).map((reason, index) => (
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

              <CardActions>
                <Link
                  to="/explore-data/$id"
                  params={{ id: movie.movieId }}
                  style={{ marginLeft: 'auto', textDecoration: 'none' }}
                >
                  <Button size="small">View Details</Button>
                </Link>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
