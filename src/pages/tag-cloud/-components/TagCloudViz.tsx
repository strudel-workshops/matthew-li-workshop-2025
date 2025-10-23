import { Box, Chip, Paper, Typography } from '@mui/material';
import { TagCloudItem } from '../../../hooks/useTagCloud';

interface TagCloudVizProps {
  tags: TagCloudItem[];
  onTagClick?: (tag: TagCloudItem) => void;
}

/**
 * Visual tag cloud component
 * Tags sized by frequency and colored by average rating
 */
export const TagCloudViz: React.FC<TagCloudVizProps> = ({
  tags,
  onTagClick,
}) => {
  if (tags.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No tags found for selected filters
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Try adjusting your filters
        </Typography>
      </Paper>
    );
  }

  // Calculate size scaling
  const maxCount = Math.max(...tags.map((t) => t.count));
  const minCount = Math.min(...tags.map((t) => t.count));

  const getSize = (count: number): 'small' | 'medium' => {
    const normalized = (count - minCount) / (maxCount - minCount || 1);
    return normalized > 0.5 ? 'medium' : 'small';
  };

  const getFontSize = (count: number): number => {
    const normalized = (count - minCount) / (maxCount - minCount || 1);
    return 0.875 + normalized * 0.5; // 0.875rem to 1.375rem
  };

  const getColor = (
    averageRating: number
  ): 'default' | 'primary' | 'secondary' | 'success' | 'warning' => {
    if (averageRating >= 4.2) return 'success';
    if (averageRating >= 3.8) return 'primary';
    if (averageRating >= 3.0) return 'secondary';
    return 'default';
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.5,
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 300,
        }}
      >
        {tags.map((tag) => (
          <Chip
            key={tag.tag}
            label={`${tag.tag} (${tag.count})`}
            size={getSize(tag.count)}
            color={getColor(tag.averageRating)}
            onClick={() => onTagClick?.(tag)}
            sx={{
              fontSize: `${getFontSize(tag.count)}rem`,
              fontWeight: tag.count > maxCount * 0.7 ? 'bold' : 'normal',
              cursor: onTagClick ? 'pointer' : 'default',
              transition: 'transform 0.2s',
              '&:hover': onTagClick
                ? {
                    transform: 'scale(1.1)',
                  }
                : {},
            }}
          />
        ))}
      </Box>

      {/* Legend */}
      <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          Color indicates average rating:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="★ 4.2+" size="small" color="success" />
          <Chip label="★ 3.8+" size="small" color="primary" />
          <Chip label="★ 3.0+" size="small" color="secondary" />
          <Chip label="★ < 3.0" size="small" color="default" />
        </Box>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          Size indicates frequency • Number shows tag count
        </Typography>
      </Box>
    </Paper>
  );
};
