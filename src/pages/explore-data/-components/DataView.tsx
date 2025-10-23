import { Alert, Box, LinearProgress, Link, Skeleton } from '@mui/material';
import { GridPaginationModel, GridColDef } from '@mui/x-data-grid';
import React, { useState } from 'react';
import { useFilters } from '../../../components/FilterContext';
import { SciDataGrid } from '../../../components/SciDataGrid';
import { filterData } from '../../../utils/filters.utils';
import { FilterConfig } from '../../../types/filters.types';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useMoviesWithLinks } from '../../../hooks/useMoviesWithLinks';

interface DataViewProps {
  filterConfigs: FilterConfig[];
  searchTerm: string;
  setPreviewItem: React.Dispatch<React.SetStateAction<any>>;
}
/**
 * Query the data rows and render as an interactive table
 */
export const DataView: React.FC<DataViewProps> = ({
  filterConfigs,
  searchTerm,
  setPreviewItem,
}) => {
  const { activeFilters } = useFilters();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  // CUSTOMIZE: the unique ID field for the data source
  const dataIdField = 'movieId';
  // CUSTOMIZE: query mode, 'client' or 'server'
  const queryMode = 'client';
  // Load movies with IMDB links merged
  const data = useMoviesWithLinks();
  const isPending = !data;
  const isFetching = false;
  const isError = false;
  const error = null;

  const handleRowClick = (rowData: any) => {
    setPreviewItem(rowData.row);
  };

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    // Reset page to first when the page size changes
    const newPage = model.pageSize !== pageSize ? 0 : model.page;
    const newPageSize = model.pageSize;
    setPage(newPage);
    setPageSize(newPageSize);
  };

  // Show a loading skeleton while the initial query is pending
  if (isPending) {
    const emptyRows = new Array(pageSize).fill(null);
    const indexedRows = emptyRows.map((row, i) => i);
    return (
      <Box
        sx={{
          padding: 2,
        }}
      >
        {indexedRows.map((row) => (
          <Skeleton key={row} height={50} />
        ))}
      </Box>
    );
  }

  // Show an error message if the query fails
  if (isError && error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  // Show the data when the query completes
  return (
    <>
      {isFetching && <LinearProgress variant="indeterminate" />}
      <SciDataGrid
        rows={filterData(data, activeFilters, filterConfigs, searchTerm)}
        pagination
        paginationMode={queryMode}
        onPaginationModelChange={handlePaginationModelChange}
        getRowId={(row) => row[dataIdField]}
        // CUSTOMIZE: the table columns
        columns={
          [
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
            },
            {
              field: 'genres',
              headerName: 'Genres',
              width: 300,
            },
            {
              field: 'imdbUrl',
              headerName: 'IMDB',
              width: 100,
              renderCell: (params) => {
                if (params.value) {
                  return (
                    <Link
                      href={params.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      Link <OpenInNewIcon fontSize="small" />
                    </Link>
                  );
                }
                return null;
              },
            },
          ] as GridColDef[]
        }
        disableColumnSelector
        autoHeight
        initialState={{
          pagination: { paginationModel: { page, pageSize } },
        }}
        onRowClick={handleRowClick}
      />
    </>
  );
};
