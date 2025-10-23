import {
  Autocomplete,
  Box,
  Chip,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { MovieWithRatings } from '../../../hooks/useMoviesWithRatings';

interface MovieSelectorProps {
  allMovies: MovieWithRatings[];
  selectedMovies: MovieWithRatings[];
  onMoviesChange: (movies: MovieWithRatings[]) => void;
  maxSelections?: number;
}

/**
 * Component for searching and selecting movies
 * Uses Material UI Autocomplete for search functionality
 */
export const MovieSelector: React.FC<MovieSelectorProps> = ({
  allMovies,
  selectedMovies,
  onMoviesChange,
  maxSelections = 10,
}) => {
  const handleSelectionChange = (
    _event: any,
    newValue: MovieWithRatings[]
  ) => {
    // Limit to maxSelections
    if (newValue.length <= maxSelections) {
      onMoviesChange(newValue);
    }
  };

  // Format movie title for display
  const getMovieLabel = (movie: MovieWithRatings) => {
    return `${movie.title} (${movie.genres})`;
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Select Movies You Like
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Choose 3-5 movies you enjoy to get personalized recommendations
        (max {maxSelections})
      </Typography>

      <Autocomplete
        multiple
        options={allMovies}
        value={selectedMovies}
        onChange={handleSelectionChange}
        getOptionLabel={getMovieLabel}
        filterSelectedOptions
        filterOptions={(options, state) => {
          // Only filter if user has typed something
          if (!state.inputValue) {
            return options.slice(0, 100); // Show top 100 initially
          }
          
          // Simple case-insensitive filtering
          const inputLower = state.inputValue.toLowerCase();
          return options.filter((option) =>
            option.title.toLowerCase().includes(inputLower)
          ).slice(0, 100); // Limit to 100 results
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search for movies..."
            placeholder="Type to search"
            variant="outlined"
          />
        )}
        renderTags={(value, getTagProps) =>
          value.map((movie, index) => (
            <Chip
              label={movie.title}
              {...getTagProps({ index })}
              color="primary"
              sx={{ m: 0.5 }}
            />
          ))
        }
        renderOption={(props, movie) => (
          <Box component="li" {...props} key={movie.movieId}>
            <Box>
              <Typography variant="body1">{movie.title}</Typography>
              <Typography variant="caption" color="text.secondary">
                {movie.genres} • ★ {movie.averageRating}/5.0 •{' '}
                {movie.totalRatings.toLocaleString()} ratings
              </Typography>
            </Box>
          </Box>
        )}
        isOptionEqualToValue={(option, value) =>
          option.movieId === value.movieId
        }
        sx={{ mt: 2 }}
      />

      {selectedMovies.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Selected {selectedMovies.length} movie{selectedMovies.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
