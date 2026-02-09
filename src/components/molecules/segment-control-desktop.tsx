import { Typography, Divider, Box, IconButton, Button, Tooltip, Checkbox, FormControlLabel, MenuItem, Menu } from '@mui/material';
import { styled } from '@mui/material/styles';
import { TiExport } from 'react-icons/ti';
import SearchInput from '../atoms/search-input';
import fileUpload from '../../assets/icons/FileUpload2.png';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { DatePicker } from 'antd';
import { PiCalendarDotsDuotone } from 'react-icons/pi';
import ExportDropdown from './export-dropdown';
import { MdViewColumn } from 'react-icons/md';
import { useState } from 'react';

const HeaderContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
  width: '100%',
  padding: '0 16px',
  gap: '8px',
  boxSizing: 'border-box',
  flexWrap: 'wrap',
}));

const FilterButton = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  border: '1px solid grey',
  borderRadius: '4px',
  height: '30px',
  padding: '0 10px',
  cursor: 'pointer',
  color: '#5B7C9D',
  '&:hover': {
    borderColor: '#4a5c72',
    backgroundColor: 'rgba(91, 124, 157, 0.04)',
  },
}));

const SegmentControlDesktop = ({
  handleFilterIconClick,
  leftText,
  isEventExport,
  handleExport,
  handleUserManagementExport,
  isDriver,
  isIfta,
  isDownloading,
  selectedButton,
  handleDateRangeChange,
  localSearchQueries,
  onAddDriverClick,
  isVehicle,
  onAddVehicleClick,
  isDevice,
  isFleetList,
  searchQuery,
  handleSearchChange,
  selectAllChecked,
  onSelectAll,
  showSelectAll,
  onFileUploadClick,
  isUserManagement,
  handleAddUserClick,
  addFleet,
  handleAddFleet,
  onAddDeviceClick,
  isFMDevice,
  isUnInsuredFleet,
  role,
  isFnol,
  isInsurance,
  isUnInsuredFleetAdmin,
  isUnInsuredVehicle,
  isAdminDevice,
  isAdminDriver,
  isDocument,
  onUploadClick,
  uploadIcon,
  isFilterHide,
  visibleColumns: visibleColumnsProp,
  onToggleColumn,
  columns: columnsProp,
}: any) => {
  const insurerId = useSelector((state: any) => state?.auth?.userData?.currentInsurerId);

  const { RangePicker } = DatePicker;

  const showAddFleet = isUnInsuredFleetAdmin || (addFleet && insurerId === 'INS9999');

  const shouldShowExportDropdown = handleExport && isDownloading !== undefined;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const finalVisibleColumns = visibleColumnsProp || {};
  const columnsToShow = columnsProp || [];

  const handleOpenColumnMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseColumnMenu = () => {
    setAnchorEl(null);
  };

  const handleToggleColumn = (columnKey: string) => {
    if (onToggleColumn) {
      onToggleColumn(columnKey);
    }
  };

  return (
    <>
      <HeaderContainer>
        {showSelectAll ? (
          <Box sx={{ display: 'flex', flexDirection: 'row', padding: '20px 16px' }}>
            {showSelectAll && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectAllChecked}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }}
                  />
                }
                label={<Typography sx={{ fontSize: '0.875rem' }}>Select All</Typography>}
              />
            )}
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" alignItems="flex-start" padding="20px 0px">
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: '400' }}>
              {leftText}
            </Typography>
          </Box>
        )}
        <Box display="flex" alignItems="center" gap={2} justifyContent="flex-end">
          {isEventExport && <ExportDropdown handleExport={handleExport} isDownloading={isDownloading} isEventExport />}
          {isUserManagement && (
            <ExportDropdown handleExport={handleUserManagementExport} isDownloading={isDownloading} />
          )}

          {(isUnInsuredFleet && role === 'fleetManagerSuperUser' && isVehicle) ||
            (isUnInsuredVehicle && (
              <Button
                variant="outlined"
                sx={{
                  height: '30px',
                  backgroundColor: '#3F5C78',
                  color: '#fff',
                  '&:hover': {
                    color: '#000',
                  },
                  textTransform: 'none',
                }}
                onClick={onAddVehicleClick}
              >
                + Add Vehicle
              </Button>
            ))}
          {isUserManagement && (
            <Button
              variant="outlined"
              sx={{
                height: '30px',
                backgroundColor: '#3F5C78',
                color: '#fff',
                whiteSpace: 'nowrap',
                '&:hover': {
                  color: '#000',
                },
                textTransform: 'none',
              }}
              onClick={handleAddUserClick}
            >
              + Add User
            </Button>
          )}

          {showAddFleet && (
            <Button
              variant="outlined"
              sx={{
                height: '30px',
                backgroundColor: '#3F5C78',
                color: '#fff',
                whiteSpace: 'nowrap',
                '&:hover': {
                  color: '#000',
                },
                textTransform: 'none',
              }}
              onClick={handleAddFleet}
            >
              + Add Fleet
            </Button>
          )}

          {!isIfta && !isInsurance && !isDocument && !isFilterHide ? (
            <FilterButton onClick={handleFilterIconClick}>
              <IconButton sx={{ padding: 0, height: '24px', color: 'inherit' }}>
                <span className="material-icons" style={{ fontSize: '20px' }}>
                  filter_list
                </span>
              </IconButton>
              <Typography variant="body2" sx={{ marginLeft: '4px', fontSize: '14px' }}>
                Filters
              </Typography>
            </FilterButton>
          ) : (
            <></>
          )}
          {!isDocument && !isFilterHide && columnsToShow.length > 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <FilterButton onClick={handleOpenColumnMenu}>
                <IconButton sx={{ padding: 0, height: '24px', color: 'inherit' }}>
                  <MdViewColumn size={20} />
                </IconButton>
                <Typography variant="body2" sx={{ marginLeft: '4px', fontSize: '14px' }}>
                  Columns
                </Typography>
              </FilterButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseColumnMenu}
                disableAutoFocusItem
                PaperProps={{
                  sx: {
                    maxHeight: 400,
                    width: 250,
                  },
                }}
              >
                {columnsToShow.map((column: any) => (
                  <MenuItem
                    key={column.key}
                    disabled={!column.hideable}
                    onClick={() => column.hideable && handleToggleColumn(column.key)}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={finalVisibleColumns[column.key] !== false}
                          disabled={!column.hideable}
                          size="small"
                        />
                      }
                      label={column.label}
                      sx={{ width: '100%', m: 0 }}
                    />
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          ) : (
            <></>
          )}
          {isFnol && <ExportDropdown handleExport={handleExport} isDownloading={isDownloading} />}
          {isIfta && selectedButton === 'fuel' && (
            <Button
              variant="outlined"
              sx={{
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '0 10px',
                textTransform: 'none',
              }}
              onClick={onFileUploadClick}
            >
              <img src={fileUpload} alt="File Upload" style={{ width: 20, height: 20, marginRight: 8 }} />
              Upload Excel
            </Button>
          )}

          {isIfta && (
            <RangePicker
              onChange={handleDateRangeChange}
              allowClear={true}
              format="MM/DD/YYYY"
              suffixIcon={<PiCalendarDotsDuotone color="#3f5c78" size={18} />}
              style={{
                height: '30px',
                border: '1px solid rgba(63, 92, 120, 0.5)',
                borderRadius: '4px',
                fontSize: '14px',
                color: '#3f5c78',
              }}
              className="ant-picker-mui-styled"
            />
          )}

          {isIfta && <ExportDropdown handleExport={handleExport} isDownloading={isDownloading} />}

          {(isDriver || isDevice) && (
            <Button
              variant="outlined"
              sx={{
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '0 10px',
                textTransform: 'none',
              }}
              onClick={onFileUploadClick}
            >
              <img src={fileUpload} alt="File Upload" style={{ width: 20, height: 20, marginRight: 8 }} />
              Upload File
            </Button>
          )}
          {(isDriver || isAdminDriver) && (
            <Button
              variant="outlined"
              sx={{
                height: '30px',
                backgroundColor: '#3F5C78',
                color: '#fff',
                whiteSpace: 'nowrap',
                '&:hover': {
                  color: '#000',
                },
                textTransform: 'none',
              }}
              onClick={onAddDriverClick}
            >
              + Add Driver
            </Button>
          )}

          {(isAdminDevice || isDevice) && (
            <Button
              variant="outlined"
              sx={{
                height: '30px',
                backgroundColor: '#3F5C78',
                color: '#fff',
                whiteSpace: 'nowrap',
                '&:hover': {
                  color: '#000',
                },
                textTransform: 'none',
              }}
              onClick={onAddDeviceClick}
            >
              + Add Device
            </Button>
          )}
          {isDocument && (
            <Button
              variant="outlined"
              sx={{
                height: '30px',
                backgroundColor: '#3F5C78',
                color: '#fff',
                '&:hover': {
                  color: '#000',
                },
                textTransform: 'none',
              }}
              onClick={onUploadClick}
            >
              {uploadIcon && <img src={uploadIcon} alt="Upload" style={{ width: 20, height: 20, marginRight: 8 }} />}
              Upload
            </Button>
          )}
        </Box>
      </HeaderContainer>
      <Divider />
      <Divider />
    </>
  );
};

export default SegmentControlDesktop;
