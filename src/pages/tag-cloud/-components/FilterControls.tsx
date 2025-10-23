import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Paper,
  Slider,
  Stack,
  Typography,
} from '@mui/material';
import { TagCloudFilters } from '../../../hooks/useTagCloud';

interface FilterControlsProps {
  filters: TagCloudFilters;
  onFiltersChange: (filters: TagCloudFilters) => void;
}

const GENRE_OPTIONS = [
  'Action',
  'Adventure',
  'Animation',
  'Children',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Fantasy',
  'Film-Noir',
  'Horror',
  'Musical',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'War',
  'Western',
];

/**
 * Filter controls for tag cloud
 * Allows filtering by genre, year, rating, and minimum movie count
 */
export const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFiltersChange,
}) => {
  const handleGenreChange = (genre: string, checked: boolean) => {
    const newGenres = checked
      ? [...filters.genres, genre]
      : filters.genres.filter((g) => g !== genre);
    onFiltersChange({ ...filters, genres: newGenres });
  };

  const handleYearChange = (_event: Event, value: number | number[]) => {
    onFiltersChange({
      ...filters,
      yearRange: value as [number, number],
    });
  };

  const handleRatingChange = (_event: Event, value: number | number[]) => {
    onFiltersChange({
      ...filters,
      ratingRange: value as [number, number],
    });
  };

  const handleMinMoviesChange = (_event: Event, value: number | number[]) => {
    onFiltersChange({
      ...filters,
      minMovies: value as number,
    });
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Filter Movies
      </Typography>

      <Stack spacing={3}>
        {/* Genre Filter */}
        <FormControl component="fieldset">
          <FormLabel component="legend">Genres</FormLabel>
          <FormGroup row>
            {GENRE_OPTIONS.map((genre) => (
              <FormControlLabel
                key={genre}
                control={
                  <Checkbox
                    checked={filters.genres.includes(genre)}
                    onChange={(e) => handleGenreChange(genre, e.target.checked)}
                    size="small"
                  />
                }
                label={<Typography variant="body2">{genre}</Typography>}
              />
            ))}
          </FormGroup>
          {filters.genres.length === 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              No genres selected = all genres
            </Typography>
          )}
        </FormControl>

        {/* Year Range */}
        <Box>
          <FormLabel>
            Release Year: {filters.yearRange[0]} - {filters.yearRange[1]}
          </FormLabel>
          <Slider
            value={filters.yearRange}
            onChange={handleYearChange}
            min={1920}
            max={2020}
            valueLabelDisplay="auto"
            sx={{ mt: 2 }}
          />
        </Box>

        {/* Rating Range */}
        <Box>
          <FormLabel>
            Rating: {filters.ratingRange[0].toFixed(1)} - {filters.ratingRange[1].toFixed(1)} stars
          </FormLabel>
          <Slider
            value={filters.ratingRange}
            onChange={handleRatingChange}
            min={0}
            max={5}
            step={0.1}
            valueLabelDisplay="auto"
            sx={{ mt: 2 }}
          />
        </Box>

        {/* Minimum Movies */}
        <Box>
          <FormLabel>
            Minimum {filters.minMovies} movie{filters.minMovies !== 1 ? 's' : ''} per tag
          </FormLabel>
          <Slider
            value={filters.minMovies}
            onChange={handleMinMoviesChange}
            min={1}
            max={10}
            marks
            valueLabelDisplay="auto"
            sx={{ mt: 2 }}
          />
          <Typography variant="caption" color="text.secondary">
            Hide rare tags that appear in fewer movies
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};
