import { TabContext, TabList, TabPanel } from '@mui/lab';
import {
  Box,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Tab,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React from 'react';
import { LabelValueTable } from '../../components/LabelValueTable';
import { PageHeader } from '../../components/PageHeader';
import { useDetailQuery } from '../../hooks/useDetailQuery';
import { createFileRoute } from '@tanstack/react-router';
import StarIcon from '@mui/icons-material/Star';

export const Route = createFileRoute('/search-data-repositories/$id')({
  component: DatasetDetail,
});

/**
 * Featured movies table columns
 */
const featuredMoviesColumns: GridColDef[] = [
  {
    field: 'title',
    headerName: 'Movie Title',
    flex: 1,
  },
];

/**
 * Detail page for a movie collection
 */
function DatasetDetail() {
  const { id } = Route.useParams();
  const { data } = useDetailQuery({
    dataSource: 'data/movie-collections.json',
    dataIdField: 'id',
    paramId: id,
    queryMode: 'client',
    staticParams: null,
  });
  const collectionTitle = data ? data.title : 'Not Found';
  const [dataTabsValue, setDataTabsValue] = React.useState('1');

  const handleDataTabsChange = (
    event: React.SyntheticEvent,
    newValue: string
  ) => {
    setDataTabsValue(newValue);
  };

  return (
    <Box>
      <PageHeader
        pageTitle={collectionTitle}
        breadcrumbTitle="Collection Detail"
        sx={{
          marginBottom: 1,
          padding: 2,
        }}
      />
      <Container maxWidth="xl">
        <Grid container spacing={1} sx={{ pt: 1, pr: 2, pb: 2, pl: 2 }}>
          {data && (
            <>
              <Grid item md={8} xs={12}>
                <Paper sx={{ mb: 1, p: 3 }}>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="overline" color="text.secondary">
                        {data.category}
                      </Typography>
                      <Typography variant="h5" component="h1" gutterBottom>
                        {data.title}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        mb={2}
                      >
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <StarIcon sx={{ color: 'gold', fontSize: 20 }} />
                          <Typography variant="h6">
                            {data.avg_rating}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            / 5.0
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {data.movie_count} movies
                        </Typography>
                      </Stack>
                    </Box>

                    <Box>
                      <Typography variant="h6" component="h2" mb={1}>
                        About This Collection
                      </Typography>
                      <Typography paragraph>{data.description}</Typography>
                    </Box>

                    <Box>
                      <Typography variant="h6" component="h2" mb={1}>
                        Collection Details
                      </Typography>
                      <LabelValueTable
                        rows={[
                          { label: 'Curator', value: data.curator },
                          {
                            label: 'Published',
                            value: new Date(
                              data.publication_date
                            ).toLocaleDateString(),
                          },
                          {
                            label: 'Movies',
                            value: data.movie_count.toString(),
                          },
                          {
                            label: 'Average Rating',
                            value: `${data.avg_rating} / 5.0`,
                          },
                        ]}
                      />
                    </Box>
                  </Stack>
                </Paper>

                <Paper>
                  <TabContext value={dataTabsValue}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                      <TabList
                        onChange={handleDataTabsChange}
                        aria-label="Collection tabs"
                      >
                        <Tab label="Featured Movies" value="1" />
                        <Tab label="Collection Info" value="2" />
                      </TabList>
                    </Box>
                    <TabPanel value="1">
                      {data.featured_movies &&
                        data.featured_movies.length > 0 && (
                          <DataGrid
                            rows={data.featured_movies.map(
                              (title: string, index: number) => ({
                                id: index,
                                title,
                              })
                            )}
                            columns={featuredMoviesColumns}
                            disableColumnSelector
                            disableRowSelectionOnClick
                            autoHeight
                            sx={{
                              border: 'none',
                            }}
                          />
                        )}
                    </TabPanel>
                    <TabPanel value="2">
                      <Stack spacing={2}>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Summary
                          </Typography>
                          <Typography>{data.summary}</Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Category
                          </Typography>
                          <Typography>{data.category}</Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Curator
                          </Typography>
                          <Typography>{data.curator}</Typography>
                        </Box>
                      </Stack>
                    </TabPanel>
                  </TabContext>
                </Paper>
              </Grid>

              <Grid item md={4} xs={12}>
                <Paper>
                  <Stack p={2} spacing={3}>
                    <Box>
                      <Typography variant="h6" component="h2" mb={1}>
                        Tags
                      </Typography>
                      <Stack direction="row" flexWrap="wrap" gap={1}>
                        {data.tags &&
                          data.tags.map((tag: string) => (
                            <Chip key={tag} label={tag} size="small" />
                          ))}
                      </Stack>
                    </Box>

                    <Box>
                      <Typography variant="h6" component="h2" mb={1}>
                        Quick Stats
                      </Typography>
                      <LabelValueTable
                        rows={[
                          { label: 'Total Movies', value: data.movie_count },
                          {
                            label: 'Avg Rating',
                            value: `${data.avg_rating} ⭐`,
                          },
                          { label: 'Type', value: data.category },
                        ]}
                      />
                    </Box>

                    <Box>
                      <Typography variant="h6" component="h2" mb={2}>
                        Explore More
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Browse individual movies in the Explore Data section to
                        see detailed ratings, posters, and IMDB links.
                      </Typography>
                      <Typography variant="body2">
                        Use the Compare Data feature to compare movies
                        side-by-side within this collection.
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </>
          )}
          {!data && <Typography>Could not find this collection</Typography>}
        </Grid>
      </Container>
    </Box>
  );
}
