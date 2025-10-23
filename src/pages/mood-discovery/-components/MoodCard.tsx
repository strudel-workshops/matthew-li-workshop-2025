import { Card, CardActionArea, CardContent, Typography, Box } from '@mui/material';
import { MoodDefinition } from '../../../hooks/useMoodClassification';

interface MoodCardProps {
  mood: MoodDefinition;
  selected: boolean;
  onClick: () => void;
}

/**
 * Card component for displaying a mood option
 * Shows emoji, name, and description
 */
export const MoodCard: React.FC<MoodCardProps> = ({
  mood,
  selected,
  onClick,
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        border: selected ? 2 : 0,
        borderColor: 'primary.main',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: 3,
        }}
      >
        <CardContent sx={{ width: '100%', padding: 0 }}>
          <Box
            sx={{
              fontSize: '3rem',
              mb: 2,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {mood.emoji}
          </Box>
          <Typography
            variant="h6"
            component="div"
            gutterBottom
            align="center"
            sx={{ fontWeight: 'bold' }}
          >
            {mood.name}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ minHeight: '40px' }}
          >
            {mood.description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
