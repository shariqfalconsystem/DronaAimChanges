import React, { useState } from 'react';
import { Box, Button, Menu, MenuItem, Checkbox, FormControlLabel } from '@mui/material';
import { MdViewColumn } from 'react-icons/md';

interface Column {
  label: string;
  key: string;
  hideable: boolean;
}

interface ColumnFilterProps {
  columns: Column[];
  visibleColumns: Record<string, boolean>;
  onToggleColumn: (columnKey: string) => void;
}

const ColumnFilter: React.FC<ColumnFilterProps> = ({ columns, visibleColumns, onToggleColumn }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleToggle = (columnKey: string, hideable: boolean) => {
    if (hideable) {
      onToggleColumn(columnKey);
    }
  };

  return (
    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
      <Button
        variant="outlined"
        startIcon={<MdViewColumn />}
        onClick={handleOpenMenu}
        sx={{
          textTransform: 'none',
          borderColor: '#5B7C9D',
          color: '#5B7C9D',
          '&:hover': {
            borderColor: '#4a5c72',
            backgroundColor: 'rgba(91, 124, 157, 0.04)',
          },
        }}
      >
        Columns
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            maxHeight: 400,
            width: 250,
          },
        }}
      >
        {columns.map((column) => (
          <MenuItem
            key={column.key}
            disabled={!column.hideable}
            onClick={() => handleToggle(column.key, column.hideable)}
          >
            <FormControlLabel
              control={
                <Checkbox checked={visibleColumns[column.key]} disabled={!column.hideable} size="small" />
              }
              label={column.label}
              sx={{ width: '100%', m: 0 }}
            />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default ColumnFilter;