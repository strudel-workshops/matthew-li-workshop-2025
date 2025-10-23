import { Box } from '@mui/material';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useDataFromSource } from '../../hooks/useDataFromSource';
import { CompareDataProvider } from './-context/ContextProvider';

export const Route = createFileRoute('/compare-data/_layout')({
  component: CompareDataWrapper,
});

/**
 * Top-level wrapper for the compare-data Task Flow templates.
 * Inner pages are rendered inside the `<Outlet />` component
 */
function CompareDataWrapper() {
  // CUSTOMIZE: the data source for the main data table.
  const movies = useDataFromSource('data/movies.csv');

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
