import React from 'react';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { LabelValueTable } from '../../../components/LabelValueTable';
import { DataGrid } from '@mui/x-data-grid';
import { AppLink } from '../../../components/AppLink';
import { useTMDBPoster } from '../../../hooks/useTMDBPoster';
import { useMovieRatings } from '../../../hooks/useMovieRatings';

interface PreviewPanelProps {
  /**
   * Data for the selected row from the main table
   */
  previewItem: any;
  /**
   * Function to handle hiding
   */
  onClose: () => void;
}

/**
 * Panel to show extra information about a row in a separate panel
 * next to the `<DataTablePanel>`.
 */
export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  previewItem,
  onClose,
}) => {
  const { posterUrl, loading } = useTMDBPoster(previewItem.tmdbId);
  const ratingStats = useMovieRatings(previewItem.movieId);

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        padding: 2,
      }}
    >
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Stack direction="row">
            <Typography variant="h6" component="h3" flex={1}>
              <AppLink to="/explore-data/$id" params={{ id: previewItem.movieId }}>
                {previewItem.title}
              </AppLink>
            </Typography>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Typography variant="body2">
            {previewItem.genres}
          </Typography>
        </Stack>
        {loading && (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress size={40} />
          </Box>
        )}
        {posterUrl && !loading && (
          <Box>
            <img
              src={posterUrl}
              alt={`${previewItem.title} poster`}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '8px',
              }}
            />
          </Box>
        )}
        <Box>
          <Typography fontWeight="medium" mb={1}>
            Movie Information
          </Typography>
          <LabelValueTable
            rows={[
              { label: 'Movie ID', value: previewItem.movieId },
              { label: 'Title', value: previewItem.title },
              { label: 'Release Year', value: previewItem.releaseYear || 'Unknown' },
              { label: 'Genres', value: previewItem.genres },
              { 
                label: 'Average Rating', 
                value: ratingStats ? `${ratingStats.averageRating} / 5.0 (${ratingStats.totalRatings} ratings)` : 'Loading...' 
              },
              {
                label: 'IMDB',
                value: previewItem.imdbUrl ? (
                  <Link
                    href={previewItem.imdbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                  >
                    View on IMDB <OpenInNewIcon fontSize="small" />
                  </Link>
                ) : (
                  'N/A'
                ),
              },
            ]}
          />
        </Box>
        {ratingStats && ratingStats.recentRatings.length > 0 && (
          <Box>
            <Typography fontWeight="medium" mb={1}>
              Recent Ratings
            </Typography>
            <DataGrid
              rows={ratingStats.recentRatings}
              getRowId={(row) => `${row.userId}-${row.timestamp}`}
              columns={[
                {
                  field: 'userId',
                  headerName: 'User',
                  width: 100,
                  renderCell: (params) => `User #${params.value}`,
                  field: 'rating',
                  headerName: 'Rating',
                  width: 80,
                },
                {
                  field: 'date',
                  headerName: 'Date',
                  width: 150,
                },
              ]}
              disableRowSelectionOnClick
              autoHeight
              hideFooter
            />
          </Box>
        )}
        <Stack direction="row" spacing={1}>
          <AppLink to="/explore-data/$id" params={{ id: previewItem.movieId }}>
            <Button variant="contained">View details</Button>
          </AppLink>
        </Stack>
      </Stack>
    </Paper>
  );
};
