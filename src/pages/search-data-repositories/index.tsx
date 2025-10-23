import { Box, Stack } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { FilterContext } from '../../components/FilterContext';
import { PageHeader } from '../../components/PageHeader';
import { FiltersPanel } from './-components/FiltersPanel';
import { DataListPanel } from './-components/DataListPanel';
import { PreviewPanel } from './-components/PreviewPanel';
import { FilterConfig } from '../../types/filters.types';

export const Route = createFileRoute('/search-data-repositories/')({
  component: DatasetExplorer,
});

// CUSTOMIZE: the filter definitions
const filterConfigs: FilterConfig[] = [
  {
    field: 'category',
    label: 'Collection Type',
    operator: 'contains-one-of',
    filterComponent: 'CheckboxList',
    filterProps: {
      options: [
        {
          label: 'Genre Collection',
          value: 'Genre Collection',
        },
        {
          label: 'Decade Collection',
          value: 'Decade Collection',
        },
        {
          label: 'Awards Collection',
          value: 'Awards Collection',
        },
        {
          label: 'Family Collection',
          value: 'Family Collection',
        },
        {
          label: 'Specialty Collection',
          value: 'Specialty Collection',
        },
      ],
    },
  },
  {
    field: 'tags',
    label: 'Tags',
    operator: 'contains-one-of',
    filterComponent: 'CheckboxList',
    filterProps: {
      options: [
        {
          label: 'Classics',
          value: 'Classics',
        },
        {
          label: 'Comedy',
          value: 'Comedy',
        },
        {
          label: 'Drama',
          value: 'Drama',
        },
        {
          label: 'Action',
          value: 'Action',
        },
        {
          label: 'Sci-Fi',
          value: 'Sci-Fi',
        },
        {
          label: 'Romance',
          value: 'Romance',
        },
        {
          label: 'Thriller',
          value: 'Thriller',
        },
        {
          label: 'Family',
          value: 'Family',
        },
        {
          label: 'Independent',
          value: 'Independent',
        },
      ],
    },
  },
];

/**
 * The main explore page for the search-data-repositories Task Flow.
 * Displays a page header, `<FiltersPanel>`, `<DataListPanel>`, and `<PreviewPanel>`.
 */
function DatasetExplorer() {
  const [previewItem, setPreviewItem] = useState<any>();
  const [showFiltersPanel, setShowFiltersPanel] = useState(true);

  const handleCloseFilters = () => {
    setShowFiltersPanel(false);
  };

  const handleToggleFilters = () => {
    setShowFiltersPanel(!showFiltersPanel);
  };

  const handleClosePreview = () => {
    setPreviewItem(null);
  };

  return (
    <FilterContext>
      <Box>
        <PageHeader
          pageTitle="Movie Collections"
          description="Browse curated collections of movies organized by genre, decade, and theme"
          sx={{
            marginBottom: 1,
            padding: 2,
          }}
        />
        <Box>
          <Stack direction="row">
            {showFiltersPanel && (
              <Box
                sx={{
                  width: '350px',
                }}
              >
                <FiltersPanel
                  filterConfigs={filterConfigs}
                  onClose={handleCloseFilters}
                />
              </Box>
            )}
            <Box
              sx={{
                border: 'none',
                flex: 1,
                minHeight: '600px',
                minWidth: 0,
              }}
            >
              <DataListPanel
                filterConfigs={filterConfigs}
                onToggleFiltersPanel={handleToggleFilters}
                previewItem={previewItem}
                setPreviewItem={setPreviewItem}
              />
            </Box>
            {previewItem && (
              <Box
                sx={{
                  maxWidth: '600px',
                  minWidth: '400px',
                }}
              >
                <PreviewPanel
                  previewItem={previewItem}
                  onClose={handleClosePreview}
                />
              </Box>
            )}
          </Stack>
        </Box>
      </Box>
    </FilterContext>
  );
}
