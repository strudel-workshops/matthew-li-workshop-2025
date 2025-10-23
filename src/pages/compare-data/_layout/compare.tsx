import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Container, Paper, Stack, Alert, Typography, Chip, LinearProgress, Grid, Card, CardContent } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { PageHeader } from '../../../components/PageHeader';
import { DataGrid } from '@mui/x-data-grid';
import { createFileRoute } from '@tanstack/react-router';
import { AppLink } from '../../../components/AppLink';
import { setComparing } from '../-context/actions';
import { useCompareData } from '../-context/ContextProvider';
import { useCrossRecommendation } from '../../../hooks/useCrossRecommendation';
import { MovieWithRatings } from '../../../hooks/useMoviesWithRatings';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import PeopleIcon from '@mui/icons-material/People';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

export const Route = createFileRoute('/compare-data/_layout/compare')({
  component: ScenarioComparison,
});

/**
 * Comparison page for the compare-data Task Flow.
 * Displays a table with the selected items from `<ScenarioList>`
 * as the columns and the metrics as the rows.
 */
function ScenarioComparison() {
  const { state, dispatch } = useCompareData();

  // Get selected movies for cross-recommendation
  const selectedMovies = useMemo(() => {
    return state.data.filter(
      (d) => state.selectedRows.indexOf(d[state.dataIdField]) > -1
    ) as MovieWithRatings[];
  }, [state.data, state.selectedRows, state.dataIdField]);

  // Calculate cross-recommendation score for exactly 2 movies
  const crossRec = useCrossRecommendation(
    selectedMovies.length === 2 ? selectedMovies[0] : undefined,
    selectedMovies.length === 2 ? selectedMovies[1] : undefined
  );

  /**
   * Set comparing to true whenever this page renders.
   * Set it back to false when the component is torn down.
   */
  useEffect(() => {
    dispatch(setComparing(true));
    return () => {
      dispatch(setComparing(false));
    };
  }, []);

  return (
    <Box>
      <PageHeader
        // CUSTOMIZE: the title that displays at the top of the page
        pageTitle="Movie Comparison"
        // CUSTOMIZE: the subtitle that displays underneath the title
        description="Comparing selected movies side-by-side"
        actions={
          <Stack direction="row">
            <Box>
              <AppLink to="..">
                {/* CUSTOMIZE: the back button text */}
                <Button variant="contained" startIcon={<ArrowBackIcon />}>
                  Back to movie list
                </Button>
              </AppLink>
            </Box>
            <Box>
              <AppLink to="/compare-data/new">
                {/* CUSTOMIZE: the new button text */}
                <Button variant="contained">New movie</Button>
              </AppLink>
            </Box>
          </Stack>
        }
        sx={{
          padding: 3,
          backgroundColor: 'white',
        }}
      />
      <Container
        maxWidth="xl"
        sx={{
          marginTop: 3,
          marginBottom: 3,
        }}
      >
        <Paper
          sx={{
            '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
              borderRight: '1px solid',
              borderRightColor: 'neutral.main',
            },
            '& .compare-data--metric': {
              fontWeight: 'bold',
            },
          }}
        >
          {state.comparing && (
            <DataGrid
              rows={state.comparisonData}
              getRowId={(row) => row.metric!}
              columns={state.comparisonColumns}
              disableRowSelectionOnClick
              disableDensitySelector
              disableColumnFilter
            />
          )}
        </Paper>

        {/* Cross-Recommendation Score */}
        {selectedMovies.length === 2 && crossRec && (
          <Paper sx={{ padding: 3, marginTop: 3 }}>
            <Typography variant="h5" gutterBottom>
              Cross-Recommendation Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              How well do these movies work as recommendations for each other?
            </Typography>

            {/* Overall Confidence Score */}
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                <ThumbUpIcon color="primary" />
                <Typography variant="h6">
                  Recommendation Confidence: {crossRec.confidence}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={crossRec.confidence}
                sx={{
                  height: 10,
                  borderRadius: 1,
                  backgroundColor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor:
                      crossRec.confidence >= 70
                        ? 'success.main'
                        : crossRec.confidence >= 40
                        ? 'warning.main'
                        : 'error.main',
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {crossRec.confidence >= 70
                  ? '🎯 Strong match - Excellent cross-recommendation!'
                  : crossRec.confidence >= 40
                  ? '✓ Moderate match - Could work as a recommendation'
                  : '⚠️ Weak match - Not ideal for recommendations'}
              </Typography>
            </Box>

            {/* Score Breakdown */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <PeopleIcon color="primary" fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        User Overlap
                      </Typography>
                    </Stack>
                    <Typography variant="h4">{crossRec.userOverlap}%</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {crossRec.sharedUsers} shared fans
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <LocalOfferIcon color="primary" fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        Genre Match
                      </Typography>
                    </Stack>
                    <Typography variant="h4">{crossRec.genreMatch}%</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Shared themes
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <LocalOfferIcon color="primary" fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        Tag Similarity
                      </Typography>
                    </Stack>
                    <Typography variant="h4">{crossRec.tagSimilarity}%</Typography>
                    <Typography variant="caption" color="text.secondary">
                      User perceptions
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Common Appeal */}
            {crossRec.commonAppeal.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Common Appeal Factors:
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {crossRec.commonAppeal.map((appeal, index) => (
                    <Chip key={index} label={appeal} size="medium" />
                  ))}
                </Stack>
              </Box>
            )}
          </Paper>
        )}

        {/* Help message when not exactly 2 movies selected */}
        {selectedMovies.length !== 2 && state.comparing && (
          <Alert severity="info" sx={{ mt: 3 }}>
            Select exactly 2 movies to see cross-recommendation analysis
          </Alert>
        )}
      </Container>
    </Box>
  );
}
