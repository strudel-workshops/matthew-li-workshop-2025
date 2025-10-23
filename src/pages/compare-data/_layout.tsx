import { Box } from '@mui/material';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useMoviesWithRatings } from '../../hooks/useMoviesWithRatings';
import { CompareDataProvider } from './-context/ContextProvider';

export const Route = createFileRoute('/compare-data/_layout')({
  component: CompareDataWrapper,
});

/**
 * Top-level wrapper for the compare-data Task Flow templates.
 * Inner pages are rendered inside the `<Outlet />` component
 */
function CompareDataWrapper() {
  // Load movies with rating statistics
  const movies = useMoviesWithRatings();

  // CUSTOMIZE: the columns for the main data table
  const columns = [
    {
      field: 'movieId',
      headerName: 'ID',
      width: 100,
      type: 'number',
    },
    {
      field: 'title',
      headerName: 'Title',
      width: 400,
      flex: 1,
      isComparisonMetric: true,
    },
    {
      field: 'genres',
      headerName: 'Genres',
      width: 300,
      isComparisonMetric: true,
    },
    {
      field: 'averageRating',
      headerName: 'Avg Rating',
      width: 120,
      type: 'number',
      isComparisonMetric: true,
      valueFormatter: (params: any) => params ? `${params} / 5.0` : 'N/A',
    },
    {
      field: 'medianRating',
      headerName: 'Median Rating',
      width: 140,
      type: 'number',
      isComparisonMetric: true,
      valueFormatter: (params: any) => params ? `${params} / 5.0` : 'N/A',
    },
    {
      field: 'totalRatings',
      headerName: 'Total Ratings',
      width: 140,
      type: 'number',
      isComparisonMetric: true,
      valueFormatter: (params: any) => params ? params.toLocaleString() : '0',
    },
  ];

  return (
    <Box>
      <CompareDataProvider
        data={movies || []}
        columns={columns}
        // CUSTOMIZE: the unique identifier field in the data
        dataIdField="movieId"
      >
        <Outlet />
      </CompareDataProvider>
    </Box>
  );
}
