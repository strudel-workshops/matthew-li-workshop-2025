import { createFileRoute } from '@tanstack/react-router';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { PageHeader } from '../../components/PageHeader';
import { useMoviesWithLinks } from '../../hooks/useMoviesWithLinks';
import { useTMDBPoster } from '../../hooks/useTMDBPoster';
import { useMovieRatings } from '../../hooks/useMovieRatings';
import { useMovieTags } from '../../hooks/useMovieTags';
import { useMovieRatingsTimeline } from '../../hooks/useMovieRatingsTimeline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Plot from 'react-plotly.js';

export const Route = createFileRoute('/explore-data/$id')({
  component: DataDetailPage,
});

/**
 * Detail view for a selected row from the` <DataExplorer>` in the explore-data Task Flow.
 */
function DataDetailPage() {
  const { id } = Route.useParams();

  // Load movies with IMDB links merged
  const movies = useMoviesWithLinks();
  const data = movies?.find((movie) => movie.movieId === id);

  // Load movie poster, ratings, tags, and timeline
  const { posterUrl, loading } = useTMDBPoster(data?.tmdbId);
  const ratingStats = useMovieRatings(data?.movieId);
  const tagData = useMovieTags(data?.movieId);
  const timelineData = useMovieRatingsTimeline(data?.movieId);

  return (
    <Box>
      <PageHeader
        // CUSTOMIZE: page header field
        pageTitle={data ? data.title : ''}
        // CUSTOMIZE: breadcrumb title text
        breadcrumbTitle="Movie Detail"
        sx={{
          marginBottom: 1,
          padding: 2,
        }}
      />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Grid container spacing={3}>
          {/* Movie Poster */}
          <Grid item xs={12} md={3}>
            {loading && (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight={400}
              >
                <CircularProgress />
              </Box>
            )}
            {posterUrl && !loading && (
              <img
                src={posterUrl}
                alt={`${data?.title} poster`}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                }}
              />
            )}
          </Grid>

          {/* Movie Information */}
          <Grid item xs={12} md={9}>
            <Paper sx={{ padding: 3, marginBottom: 3 }}>
              <Stack spacing={2}>
                <Stack>
                  <Typography variant="body2" color="text.secondary">
                    Movie ID
                  </Typography>
                  <Typography variant="body1">
                    {data && data.movieId}
                  </Typography>
                </Stack>
                <Stack>
                  <Typography variant="body2" color="text.secondary">
                    Title
                  </Typography>
                  <Typography variant="h6">{data && data.title}</Typography>
                </Stack>
                <Stack>
                  <Typography variant="body2" color="text.secondary">
                    Genres
                  </Typography>
                  <Typography variant="body1">{data && data.genres}</Typography>
                </Stack>
                {data?.releaseYear && (
                  <Stack>
                    <Typography variant="body2" color="text.secondary">
                      Release Year
                    </Typography>
                    <Typography variant="body1">{data.releaseYear}</Typography>
                  </Stack>
                )}
                <Stack>
                  <Typography variant="body2" color="text.secondary">
                    IMDB
                  </Typography>
                  {data && data.imdbUrl ? (
                    <Link
                      href={data.imdbUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      View on IMDB <OpenInNewIcon fontSize="small" />
                    </Link>
                  ) : (
                    <Typography>N/A</Typography>
                  )}
                </Stack>
              </Stack>
            </Paper>

            {/* Rating Statistics Cards */}
            {ratingStats && ratingStats.totalRatings > 0 && (
              <Grid container spacing={2} sx={{ marginBottom: 3 }}>
                <Grid item xs={12} sm={3}>
                  <Card>
                    <CardContent>
                      <Typography
                        color="text.secondary"
                        gutterBottom
                        variant="body2"
                      >
                        Average Rating
                      </Typography>
                      <Typography variant="h4">
                        {ratingStats.averageRating}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        out of 5.0
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Card>
                    <CardContent>
                      <Typography
                        color="text.secondary"
                        gutterBottom
                        variant="body2"
                      >
                        Median Rating
                      </Typography>
                      <Typography variant="h4">
                        {ratingStats.medianRating}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        out of 5.0
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Card>
                    <CardContent>
                      <Typography
                        color="text.secondary"
                        gutterBottom
                        variant="body2"
                      >
                        Total Ratings
                      </Typography>
                      <Typography variant="h4">
                        {ratingStats.totalRatings.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        users
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Card>
                    <CardContent>
                      <Typography
                        color="text.secondary"
                        gutterBottom
                        variant="body2"
                      >
                        Most Common
                      </Typography>
                      <Typography variant="h4">
                        {
                          ratingStats.distribution.reduce((max, curr) =>
                            curr.count > max.count ? curr : max
                          ).rating
                        }
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        stars
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Rating Distribution Chart */}
            {ratingStats && ratingStats.distribution.length > 0 && (
              <Paper sx={{ padding: 2, marginBottom: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Rating Distribution
                </Typography>
                <Plot
                  data={[
                    {
                      x: ratingStats.distribution.map((d) => d.rating),
                      y: ratingStats.distribution.map((d) => d.count),
                      type: 'bar',
                      marker: {
                        color: '#1976d2',
                      },
                    },
                  ]}
                  layout={{
                    xaxis: {
                      title: 'Rating (stars)',
                      dtick: 0.5,
                    },
                    yaxis: {
                      title: 'Number of Ratings',
                    },
                    margin: { t: 20, r: 20, b: 60, l: 60 },
                    height: 400,
                  }}
                  config={{
                    displayModeBar: false,
                  }}
                  style={{ width: '100%' }}
                  useResizeHandler
                />
              </Paper>
            )}

            {/* Ratings Over Time Chart */}
            {timelineData && timelineData.length > 0 && (
              <Paper sx={{ padding: 2, marginBottom: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Ratings Over Time
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  How ratings evolved from {timelineData[0].date.toLocaleDateString()} to{' '}
                  {timelineData[timelineData.length - 1].date.toLocaleDateString()}
                </Typography>
                <Plot
                  data={[
                    {
                      x: timelineData.map((d) => d.date),
                      y: timelineData.map((d) => d.rating),
                      type: 'scatter',
                      mode: 'markers',
                      name: 'Monthly Average',
                      marker: {
                        size: timelineData.map((d) => Math.min(d.count * 2 + 4, 20)),
                        color: '#90caf9',
                        opacity: 0.6,
                        line: {
                          color: '#1976d2',
                          width: 1,
                        },
                      },
                    },
                    {
                      x: timelineData.map((d) => d.date),
                      y: timelineData.map((d) => d.movingAverage),
                      type: 'scatter',
                      mode: 'lines',
                      name: '3-Month Moving Avg',
                      line: {
                        color: '#1976d2',
                        width: 3,
                      },
                    },
                  ]}
                  layout={{
                    xaxis: {
                      title: 'Date',
                      type: 'date',
                    },
                    yaxis: {
                      title: 'Average Rating',
                      range: [0, 5.5],
                      dtick: 0.5,
                    },
                    showlegend: true,
                    legend: {
                      x: 0,
                      y: 1.15,
                      orientation: 'h',
                    },
                    margin: { t: 40, r: 20, b: 60, l: 60 },
                    height: 400,
                    hovermode: 'closest',
                  }}
                  config={{
                    displayModeBar: false,
                  }}
                  style={{ width: '100%' }}
                  useResizeHandler
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Bubble size represents number of ratings that month. Line shows trend over time.
                </Typography>
              </Paper>
            )}

            {/* User-Generated Tags */}
            {tagData && tagData.tags.length > 0 && (
              <Paper sx={{ padding: 3 }}>
                <Typography variant="h6" gutterBottom>
                  User-Generated Tags
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {tagData.totalTags} tags from MovieLens users
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {tagData.tags.slice(0, 20).map((tag) => (
                    <Chip
                      key={tag.tag}
                      label={`${tag.tag} (${tag.count})`}
                      size="medium"
                      sx={{
                        fontSize: tag.count > 2 ? '0.95rem' : '0.875rem',
                        fontWeight: tag.count > 2 ? 'bold' : 'normal',
                      }}
                    />
                  ))}
                </Stack>
                {tagData.tags.length > 20 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Showing top 20 of {tagData.tags.length} unique tags
                  </Typography>
                )}
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
