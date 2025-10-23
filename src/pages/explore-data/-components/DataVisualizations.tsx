import { Box, Grid, Paper, Typography } from '@mui/material';
import Plot from 'react-plotly.js';
import { useMemo } from 'react';
import { MovieWithRatings } from '../../../hooks/useMoviesWithRatings';

interface DataVisualizationsProps {
  movies: MovieWithRatings[];
}

/**
 * Aggregate visualizations for the Explore Data page
 * Shows Movies Over Time, Quality Heatmap, and Popularity vs Quality Scatter
 */
export const DataVisualizations: React.FC<DataVisualizationsProps> = ({ movies }) => {
  // Filter out movies without ratings
  const moviesWithRatings = useMemo(() => 
    movies.filter(m => m.totalRatings > 0), 
    [movies]
  );

  // 1. Movies Over Time - Extract years, count, and calculate average rating
  const moviesOverTime = useMemo(() => {
    const yearData = new Map<number, { count: number; ratingSum: number; ratingCount: number }>();
    
    moviesWithRatings.forEach((movie) => {
      const match = movie.title.match(/\((\d{4})\)/);
      if (match) {
        const year = parseInt(match[1]);
        if (year >= 1900 && year <= 2020) {
          const existing = yearData.get(year) || { count: 0, ratingSum: 0, ratingCount: 0 };
          yearData.set(year, {
            count: existing.count + 1,
            ratingSum: existing.ratingSum + movie.averageRating,
            ratingCount: existing.ratingCount + 1,
          });
        }
      }
    });

    const years = Array.from(yearData.keys()).sort((a, b) => a - b);
    const counts = years.map(year => yearData.get(year)?.count || 0);
    const avgRatings = years.map(year => {
      const data = yearData.get(year);
      return data ? Number((data.ratingSum / data.ratingCount).toFixed(2)) : 0;
    });

    return { years, counts, avgRatings };
  }, [moviesWithRatings]);

  // 2. Quality Heatmap - Average rating by genre and decade
  const qualityHeatmap = useMemo(() => {
    interface GenreDecadeData {
      [key: string]: { sum: number; count: number };
    }
    
    const data: GenreDecadeData = {};
    const genres = new Set<string>();
    const decades = new Set<number>();

    moviesWithRatings.forEach((movie) => {
      // Extract year and convert to decade
      const match = movie.title.match(/\((\d{4})\)/);
      if (!match) return;
      
      const year = parseInt(match[1]);
      if (year < 1920 || year > 2020) return;
      
      const decade = Math.floor(year / 10) * 10;
      decades.add(decade);

      // Split genres
      const movieGenres = movie.genres.split('|');
      
      movieGenres.forEach((genre) => {
        if (genre === '(no genres listed)') return;
        genres.add(genre);
        
        const key = `${genre}-${decade}`;
        if (!data[key]) {
          data[key] = { sum: 0, count: 0 };
        }
        data[key].sum += movie.averageRating;
        data[key].count += 1;
      });
    });

    // Convert to format for heatmap
    const genreList = Array.from(genres).sort();
    const decadeList = Array.from(decades).sort();
    
    const zData = genreList.map(genre =>
      decadeList.map(decade => {
        const key = `${genre}-${decade}`;
        const d = data[key];
        return d ? Number((d.sum / d.count).toFixed(2)) : null;
      })
    );

    return { genres: genreList, decades: decadeList, zData };
  }, [moviesWithRatings]);

  // 3. Popularity vs Quality Scatter
  const scatterData = useMemo(() => {
    return moviesWithRatings
      .filter(m => m.totalRatings >= 20) // Only show movies with at least 20 ratings
      .map(movie => ({
        x: movie.totalRatings,
        y: movie.averageRating,
        title: movie.title,
        genres: movie.genres,
      }));
  }, [moviesWithRatings]);

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={3}>
        {/* Movies Over Time */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Movies Over Time
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Number of movies released per year
            </Typography>
            <Plot
              data={[
                {
                  x: moviesOverTime.years,
                  y: moviesOverTime.counts,
                  type: 'scatter',
                  mode: 'lines',
                  name: 'Number of Movies',
                  fill: 'tozeroy',
                  line: { color: '#1976d2', width: 2 },
                  fillcolor: 'rgba(25, 118, 210, 0.2)',
                  yaxis: 'y',
                },
                {
                  x: moviesOverTime.years,
                  y: moviesOverTime.avgRatings,
                  type: 'scatter',
                  mode: 'lines',
                  name: 'Avg Rating',
                  line: { color: '#ff6b6b', width: 2, dash: 'dash' },
                  yaxis: 'y2',
                },
              ]}
              layout={{
                xaxis: {
                  title: 'Year',
                  gridcolor: '#e0e0e0',
                },
                yaxis: {
                  title: 'Number of Movies',
                  gridcolor: '#e0e0e0',
                  side: 'left',
                },
                yaxis2: {
                  title: 'Average Rating',
                  overlaying: 'y',
                  side: 'right',
                  range: [0, 5],
                  gridcolor: 'transparent',
                },
                margin: { t: 20, r: 60, b: 50, l: 60 },
                height: 350,
                hovermode: 'x unified',
                legend: {
                  x: 0.02,
                  y: 0.98,
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                },
              }}
              config={{
                displayModeBar: false,
              }}
              style={{ width: '100%' }}
              useResizeHandler
            />
          </Paper>
        </Grid>

        {/* Popularity vs Quality Scatter */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Popularity vs Quality
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Find hidden gems (top-right) vs cult classics (high rating, fewer reviews)
            </Typography>
            <Plot
              data={[
                {
                  x: scatterData.map(d => d.x),
                  y: scatterData.map(d => d.y),
                  type: 'scatter',
                  mode: 'markers',
                  marker: {
                    size: 6,
                    color: scatterData.map(d => d.y),
                    colorscale: 'Viridis',
                    showscale: true,
                    colorbar: {
                      title: 'Rating',
                      thickness: 15,
                      len: 0.7,
                    },
                  },
                  text: scatterData.map(d => `${d.title}<br>Rating: ${d.y}<br>Reviews: ${d.x}`),
                  hovertemplate: '%{text}<extra></extra>',
                },
              ]}
              layout={{
                xaxis: {
                  title: 'Number of Ratings (Popularity)',
                  type: 'log',
                  gridcolor: '#e0e0e0',
                },
                yaxis: {
                  title: 'Average Rating (Quality)',
                  range: [0, 5],
                  gridcolor: '#e0e0e0',
                },
                margin: { t: 20, r: 20, b: 50, l: 50 },
                height: 350,
                hovermode: 'closest',
              }}
              config={{
                displayModeBar: false,
              }}
              style={{ width: '100%' }}
              useResizeHandler
            />
          </Paper>
        </Grid>

        {/* Quality Heatmap */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Average Rating by Genre and Decade
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Which genres had their golden age? Darker red = higher rated
            </Typography>
            <Plot
              data={[
                {
                  z: qualityHeatmap.zData,
                  x: qualityHeatmap.decades,
                  y: qualityHeatmap.genres,
                  type: 'heatmap',
                  colorscale: [[0, '#ffffcc'], [0.2, '#ffeda0'], [0.4, '#fed976'], [0.6, '#feb24c'], [0.8, '#fd8d3c'], [1, '#fc4e2a']],
                  reversescale: false,
                  hovertemplate: 'Genre: %{y}<br>Decade: %{x}s<br>Avg Rating: %{z:.2f}<extra></extra>',
                  colorbar: {
                    title: 'Avg Rating',
                    thickness: 15,
                    len: 0.5,
                  },
                },
              ]}
              layout={{
                xaxis: {
                  title: 'Decade',
                  side: 'bottom',
                  tickmode: 'linear',
                  dtick: 10,
                },
                yaxis: {
                  title: 'Genre',
                },
                margin: { t: 20, r: 100, b: 50, l: 100 },
                height: 500,
              }}
              config={{
                displayModeBar: false,
              }}
              style={{ width: '100%' }}
              useResizeHandler
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
