import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { useMoviesWithRatings } from '../../hooks/useMoviesWithRatings';
import {
  useTagCloud,
  useTagCloudStats,
  TagCloudFilters,
} from '../../hooks/useTagCloud';
import { FilterControls } from './-components/FilterControls';
import { TagCloudViz } from './-components/TagCloudViz';

export const Route = createFileRoute('/tag-cloud/')({
  component: TagCloudGenerator,
});

/**
 * Tag Cloud Generator page
 * Users filter movies by genre, year, and rating to generate
 * a visual tag cloud showing what people say about those movies
 */
function TagCloudGenerator() {
  const allMovies = useMoviesWithRatings();
  const [filters, setFilters] = useState<TagCloudFilters>({
    genres: [],
    yearRange: [1990, 2020],
    ratingRange: [0, 5],
    minMovies: 2,
  });

  // Generate tag cloud based on filters
  const tagCloud = useTagCloud(filters, allMovies, 100);
  const stats = useTagCloudStats(tagCloud);

  return (
    <Box>
      <PageHeader
        pageTitle="Tag Cloud Generator"
        description="Visualize what people say about movies based on your filters"
        sx={{
          marginBottom: 1,
          padding: 2,
        }}
      />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Grid container spacing={3}>
          {/* Filters Panel */}
          <Grid item xs={12} md={3}>
            <FilterControls filters={filters} onFiltersChange={setFilters} />
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={9}>
            <Stack spacing={3}>
              {/* Statistics */}
              {tagCloud.length > 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <Card>
                      <CardContent>
                        <Typography
                          color="text.secondary"
                          gutterBottom
                          variant="body2"
                        >
                          Total Tags
                        </Typography>
                        <Typography variant="h4">{stats.totalTags}</Typography>
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
                          Total Applications
                        </Typography>
                        <Typography variant="h4">
                          {stats.totalApplications.toLocaleString()}
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
                          Most Popular
                        </Typography>
                        <Typography variant="h6" noWrap>
                          {stats.mostPopular?.tag || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {stats.mostPopular?.count} uses
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
                          Avg Rating
                        </Typography>
                        <Typography variant="h4">
                          {stats.averageRating.toFixed(1)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          out of 5.0
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {/* Tag Cloud */}
              <TagCloudViz tags={tagCloud} />

              {/* Instructions */}
              {tagCloud.length === 0 && allMovies && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Welcome to the Tag Cloud Generator!
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Adjust the filters on the left to explore user-generated tags
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 2 }}
                  >
                    Try: Select "Sci-Fi" genre + 1990-2010 to see what people
                    say about sci-fi movies from that era
                  </Typography>
                </Box>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
