import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React from 'react';
import { AppLink } from '../../../components/AppLink';
import { LabelValueTable } from '../../../components/LabelValueTable';

/**
 * Columns for featured movies table
 */
const featuredMoviesColumns: GridColDef[] = [
  {
    field: 'title',
    headerName: 'Movie',
    flex: 1,
  },
];

interface PreviewPanelProps {
  /**
   * Data for the selected card from the main list
   */
  previewItem: any;
  /**
   * Function to handle hiding
   */
  onClose: () => void;
}

/**
 * Panel to show extra information about a card in a separate panel
 * next to the `<DataListPanel>`.
 */
export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  previewItem,
  onClose,
}) => {
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
              <AppLink
                to="/search-data-repositories/$id"
                params={{ id: previewItem.id }}
                underline="hover"
              >
                {previewItem.title}
              </AppLink>
            </Typography>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {previewItem.category}
          </Typography>
        </Stack>
        <Box>
          <Typography fontWeight="medium" mb={1}>
            Collection Details
          </Typography>
          <LabelValueTable
            rows={[
              { label: 'Curator', value: previewItem.curator },
              { label: 'Movie Count', value: previewItem.movie_count },
              { label: 'Avg Rating', value: `${previewItem.avg_rating} / 5.0` },
              {
                label: 'Published',
                value: new Date(
                  previewItem.publication_date
                ).toLocaleDateString(),
              },
            ]}
          />
        </Box>
        {previewItem.description && (
          <Box>
            <Typography fontWeight="medium" mb={1}>
              Description
            </Typography>
            <Typography>{previewItem.description}</Typography>
          </Box>
        )}
        {previewItem.summary && (
          <Box>
            <Typography fontWeight="medium" mb={1}>
              Summary
            </Typography>
            <Typography>{previewItem.summary}</Typography>
          </Box>
        )}
        {previewItem.tags && (
          <Box>
            <Typography fontWeight="medium" mb={1}>
              Tags
            </Typography>
            <Typography>
              {previewItem.tags.map((tag: string, i: number) => {
                if (previewItem.tags && i < previewItem.tags.length - 1) {
                  return <span key={`${tag}-${i}`}>{`${tag}, `}</span>;
                } else {
                  return <span key={`${tag}-${i}`}>{tag}</span>;
                }
              })}
            </Typography>
          </Box>
        )}
        {previewItem.featured_movies &&
          previewItem.featured_movies.length > 0 && (
            <Box>
              <Typography fontWeight="medium" mb={1}>
                Featured Movies
              </Typography>
              <DataGrid
                getRowId={(row) => row.title}
                rows={previewItem.featured_movies.map((title: string) => ({
                  title,
                }))}
                columns={featuredMoviesColumns}
                disableRowSelectionOnClick
                autoHeight
                hideFooter
              />
            </Box>
          )}
        <Stack direction="row" spacing={1}>
          <AppLink
            to="/search-data-repositories/$id"
            params={{ id: previewItem.id }}
          >
            <Button variant="contained">View Collection Details</Button>
          </AppLink>
        </Stack>
      </Stack>
    </Paper>
  );
};
