import React from 'react';
import { Grid, Typography, IconButton, Box } from '@mui/material';
import { LuRefreshCcw } from 'react-icons/lu';
import { RiRefreshLine } from '@remixicon/react';
import SearchInput from '../../components/atoms/search-input';

interface HelpCenterHeaderProps {
  onSearchChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  searchText?: string;
  isLanding?: boolean;
}
const HelpCenterHeader: React.FC<HelpCenterHeaderProps> = ({ onSearchChange, searchText, isLanding }) => {
  return (
    <Box
      sx={{
        boxShadow: '0px 4px 4px 0px #00000040',
        bgcolor: '#fff',
        py: 2,
        px: 1,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Grid container spacing={2} alignItems="center" px={{ xs: 2, md: 3 }}>
        <Grid item xs={12} sm="auto" display="flex" alignItems="center">
          <Typography variant="h6">
            Help Center
          </Typography>
          <IconButton onClick={() => window.location.reload()}>
            <RiRefreshLine />
          </IconButton>
        </Grid>
        <Grid item xs={12} sm={true} sx={{ maxWidth: { sm: 400 }, ml: { sm: 'auto' } }}>
          {isLanding && (
            <SearchInput
              placeholder="Search"
              onChange={onSearchChange}
              value={searchText}
              fullWidth
              size="small"
              sx={{
                backgroundColor: '#f5f7fa',
                borderRadius: '20px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '20px',
                },
              }}
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default HelpCenterHeader;
