import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  TextField,
  IconButton,
} from '@mui/material';
import Video from '../../../assets/icons/video.png';
import Pagination from '../../../components/molecules/pagination';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import { formatDateTimeAlpha } from '../../../utility/utilities';
import { StyledDataCell } from '../../../components/atoms/table-body-cell';
import { StyledHeadCell } from '../../insurer/trip-list/table-row-cell';
import ChipWithIcon from '../../../components/atoms/chip-with-icon';
import debounce from 'lodash/debounce';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import Link from '../../../assets/icons/link.png';
import Delete from '../../../assets/icons/delete.png';
import DeleteConfirmationDialog from './delete-confirmation-popup';
import environment from '../../../environments/environment';
import SnapshotImageDisplay from '../../../components/modals/snapshot';
import { useSearchParams } from 'react-router-dom';
import LastPing from '../../../assets/icons/lastping.png';

const UnassignedListTable: React.FC<any> = ({
  deviceInformation,
  onPageChange,
  onSearch,
  onSort,
  currentPage,
  setCurrentPage,
  searchQueries,
  setSearchQueries,
  setSortColumn,
  sortColumn,
  sortDirection,
  setSortDirection,
  onLinkDevice,
  onDeleteDevice,
  onDeviceVideo,
  visibleColumns,
}) => {
  const [localSearchQueries, setLocalSearchQueries] = useState<Record<string, any>>({});
  const [processedTrips, setProcessedTrips] = useState<any[]>([]);
  const [applyBackdropFilter, setApplyBackdropFilter] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<any>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const tableRef = useRef<HTMLTableElement | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLocalSearchQueries(searchQueries);
  }, [searchQueries]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    setApplyBackdropFilter(target.scrollLeft > 0);
  };

  const debouncedSearch = useCallback(
    debounce((queries: any) => {
      onSearch(queries);
      setSearchQueries(queries);
    }, 1000),
    [onSearch, setSearchQueries]
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleColumnSearch = (column: string, value: any) => {
    const newQueries = { ...localSearchQueries, [column]: value };
    setLocalSearchQueries(newQueries);
    debouncedSearch(newQueries);
  };

  const handleDateChange = (date: any, key: string) => {
    if (!date) {
      const newQueries = { ...localSearchQueries, [key]: null };
      setLocalSearchQueries(newQueries);
      debouncedSearch(newQueries);
      return;
    }

    let formattedValue;

    if (key === 'shipmentDate') {
      formattedValue = date.format('MM/DD/YYYY');
    } else {
      formattedValue = date.startOf('day').valueOf();
    }

    const newQueries = { ...localSearchQueries, [key]: formattedValue };
    setLocalSearchQueries(newQueries);
    debouncedSearch(newQueries);
  };

  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    setSortColumn(column);
    setSortDirection(direction);
    onSort(column, direction);
  };

  const handleLinkClick = (e: any, device: any) => {
    e.stopPropagation();
    e.preventDefault();
    onLinkDevice(device);
  };

  const handleVideoClick = (e: any, device: any) => {
    e.stopPropagation();
    e.preventDefault();
    onDeviceVideo(device);
  };

  const handleDeleteClick = (e: React.MouseEvent, device: any) => {
    e.stopPropagation();
    e.preventDefault();
    setDeviceToDelete({ device });
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    console.log('deviceId', deviceToDelete);
    if (deviceToDelete) {
      onDeleteDevice(deviceToDelete?.device?.deviceId, deviceToDelete?.device?.lonestarId);
    }
    setDeleteConfirmOpen(false);
    setDeviceToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeviceToDelete(null);
  };

  const columns = [
    { label: 'Fleet Name', key: 'name', minWidth: '130px', hideable: true },
    { label: 'Fleet ID', key: 'lonestarId', minWidth: '100px', hideable: true },
    { label: 'Device Provider', key: 'partnerName', minWidth: '110px', hideable: true },
    { label: 'Device ID', key: 'deviceId', minWidth: '110px', hideable: false },
    { label: 'Device Status', key: 'status', minWidth: '100px', hideable: true },
    { label: 'IMEI Number', key: 'imei', minWidth: '120px', hideable: true },
    { label: 'Last Status Ping', key: 'lastStatusPing', minWidth: '140px', hideable: true },
    { label: 'Last Location Ping', key: 'lastLocationPing', minWidth: '140px', hideable: true },
    { label: 'Vehicle ID', key: 'vehicleId', minWidth: '100px', hideable: true },
    { label: 'VIN', key: 'vin', minWidth: '140px', hideable: true },
    { label: 'Device Snapshots', key: 'snapshot', minWidth: '110px', hideable: false },
    { label: 'Action', key: 'actions', minWidth: '90px', hideable: false },
  ];

  const totalPages =
    Math.ceil(deviceInformation?.pageDetails?.totalRecords / deviceInformation?.pageDetails?.pageSize) || 1;

  return (
    <Box sx={{ maxWidth: '81vw', overflowX: 'auto' }}>
      <TableContainer
        ref={containerRef}
        component={Paper}
        onScroll={handleScroll}
        sx={{
          overflowX: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '14px',
            cursor: 'pointer',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#5B7C9D',
            borderRadius: '5px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#4a5c72',
          },
        }}
      >
        <Table ref={tableRef} sx={{ minWidth: '100%' }}>
          <TableHead>
            <TableRow>
              {columns
                .filter((col) => !visibleColumns || (visibleColumns as any)[col.key] !== false)
                .map(({ label, key, minWidth }, index) => (
                  <StyledHeadCell
                    key={key}
                    sx={{
                      width: minWidth,
                      minWidth: minWidth,
                      position: index === 0 || index === columns.length - 1 ? 'sticky' : 'static',
                      left: index === 0 ? 0 : 'auto',
                      right: index === columns.length - 1 ? 0 : 'auto',
                      zIndex: index === 0 || index === columns.length - 1 ? 2 : 'auto',
                      backdropFilter: 'blur(50px)',
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Typography
                        sx={{
                          whiteSpace: 'nowrap',
                          color: '#000!important',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                        }}
                        component={'span'}
                      >
                        {label}
                        <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                          {key !== 'startLocation' && key !== 'endLocation' && key != 'actions' && key != 'snapshot' && (
                            <>
                              <TbTriangleFilled
                                size={9}
                                color={sortColumn === key && sortDirection === 'ASC' ? '#000' : 'rgba(0,0,0,0.5)'}
                                onClick={() => handleSort(key, 'ASC')}
                              />
                              <TbTriangleInvertedFilled
                                size={9}
                                color={sortColumn === key && sortDirection === 'DESC' ? '#000' : 'rgba(0,0,0,0.5)'}
                                onClick={() => handleSort(key, 'DESC')}
                              />
                            </>
                          )}
                        </Box>
                      </Typography>

                      {['lastStatusPing', 'lastLocationPing', 'shipmentDate']?.includes(key) ? (
                        <DatePicker
                          value={localSearchQueries[key] ? dayjs(localSearchQueries[key]) : null}
                          onChange={(date) => handleDateChange(date, key)}
                          placeholder={``}
                          format="MM-DD-YYYY"
                          style={{ marginTop: 8, width: '100%' }}
                        />
                      ) : (
                        key !== 'actions' && (
                          <TextField
                            size="small"
                            variant="outlined"
                            value={localSearchQueries[key] || ''}
                            onChange={(e) => handleColumnSearch(key, e.target.value)}
                            disabled={key === 'snapshot'}
                            sx={{
                              mt: 1,
                              '& .MuiOutlinedInput-root': {
                                width: '100%',
                                height: '30px',
                                backgroundColor: key === 'snapshot' ? '#f0f0f0' : 'white',
                              },
                              '& .MuiOutlinedInput-root.Mui-disabled': {
                                backgroundColor: '#f0f0f0',
                              },
                            }}
                          />
                        )
                      )}
                    </Box>
                  </StyledHeadCell>
                ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {deviceInformation?.devices && deviceInformation?.devices?.length > 0 ? (
              deviceInformation?.devices?.map((device: any) => (
                <TableRow
                  key={device.deviceId}
                  sx={{
                    backgroundColor:
                      device.isLastPingStatusFourteenDaysAgo === 'inactive'
                        ? '#FFF8ED'
                        : device.isOrphaned
                          ? '#f0f0f0'
                          : 'transparent',
                    color: device.isOrphaned ? '#a1a1a1' : 'inherit',
                    cursor: device.isOrphaned ? 'default' : 'pointer',
                    '&:hover': {
                      backgroundColor:
                        device.isLastPingStatusFourteenDaysAgo === 'inactive'
                          ? '#FFF8ED'
                          : device.isOrphaned
                            ? '#f0f0f0'
                            : '#f5f5f5',
                    },
                  }}
                >
                  {columns
                    .filter((col) => !visibleColumns || (visibleColumns as any)[col.key] !== false)
                    .map(({ key }) => {
                      if (key === 'name') {
                        return (
                          <StyledDataCell
                            key={key}
                            sx={{
                              position: 'sticky',
                              left: 0,
                              zIndex: 3,
                              whiteSpace: 'nowrap',
                              backdropFilter: applyBackdropFilter ? 'blur(50px)' : 'none',
                              background:
                                device.isLastPingStatusFourteenDaysAgo === 'inactive'
                                  ? '#FFF8ED'
                                  : applyBackdropFilter
                                    ? '#f5f5f5'
                                    : 'inherit',
                              boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                              {device.isLastPingStatusFourteenDaysAgo === 'inactive' && (
                                <img
                                  src={LastPing}
                                  alt="Last Ping Alert"
                                  width={16}
                                  height={16}
                                  title='"Last Status Ping" was more than 14 days ago'
                                />
                              )}
                              <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
                                {device?.lookup_fleetcompanies?.[0]?.name || 'NA'}
                              </Typography>{' '}
                            </Box>
                          </StyledDataCell>
                        );
                      }
                      if (key === 'lonestarId') {
                        return <StyledDataCell key={key}>{device?.lonestarId || 'NA'}</StyledDataCell>;
                      }
                      if (key === 'partnerName') {
                        return <StyledDataCell key={key}>{device?.deviceProvider || 'NA'}</StyledDataCell>;
                      }
                      if (key === 'deviceId') {
                        return <StyledDataCell key={key}>{device?.deviceId || 'NA'}</StyledDataCell>;
                      }
                      if (key === 'status') {
                        return (
                          <StyledDataCell key={key}>
                            <ChipWithIcon
                              status={
                                device?.status === 'DeviceOffline'
                                  ? 'Offline'
                                  : device?.status === 'DeviceOnline'
                                    ? 'Online'
                                    : 'NA'
                              }
                            />
                          </StyledDataCell>
                        );
                      }
                      if (key === 'imei') {
                        return <StyledDataCell key={key}>{device?.imei || 'NA'}</StyledDataCell>;
                      }
                      if (key === 'lastStatusPing') {
                        return (
                          <StyledDataCell key={key}>
                            {formatDateTimeAlpha(device?.statusTsInMilliseconds) || 'NA'}
                          </StyledDataCell>
                        );
                      }
                      if (key === 'lastLocationPing') {
                        return (
                          <StyledDataCell key={key}>
                            {formatDateTimeAlpha(device?.lastLiveTrack?.tsInMilliSeconds) || 'NA'}
                          </StyledDataCell>
                        );
                      }
                      if (key === 'vehicleId') {
                        return (
                          <StyledDataCell key={key}>{device?.lookup_vehicles?.[0]?.vehicleId || 'NA'}</StyledDataCell>
                        );
                      }
                      if (key === 'vin') {
                        return <StyledDataCell key={key}>{device?.lookup_vehicles?.[0]?.vin || 'NA'}</StyledDataCell>;
                      }
                      if (key === 'snapshot') {
                        return (
                          <StyledDataCell key={key}>
                            <SnapshotImageDisplay snapshots={device?.snapshot} mediaBaseUrl={environment.mediaBaseUrl} />
                          </StyledDataCell>
                        );
                      }
                      if (key === 'actions') {
                        return (
                          <StyledDataCell
                            key={key}
                            sx={{
                              position: 'sticky',
                              right: 0,
                              zIndex: 1,
                              whiteSpace: 'nowrap',
                              backdropFilter: 'blur(50px)',
                              background: applyBackdropFilter ? '#f5f5f5' : 'inherit',
                              boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                              padding: '10px',
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              <IconButton onClick={(e: any) => handleLinkClick(e, device)}>
                                <img src={Link} alt="Link" width={20} height={20} />
                              </IconButton>

                              <IconButton onClick={(e) => handleDeleteClick(e, device)}>
                                <img src={Delete} alt="Delete" width={20} height={20} />
                              </IconButton>

                              <IconButton onClick={(e: any) => handleVideoClick(e, device)}>
                                <img src={Video} alt="Link" width={20} height={20} />
                              </IconButton>
                            </Box>
                          </StyledDataCell>
                        );
                      }
                      return null;
                    })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <StyledDataCell colSpan={columns.length}>
                  <Typography> No Devices Found</Typography>
                </StyledDataCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalRecords={deviceInformation?.pageDetails?.totalRecords}
        pageSize={deviceInformation?.pageDetails?.pageSize}
        isDefaultList={true}
      />
      {deviceToDelete && (
        <DeleteConfirmationDialog
          open={deleteConfirmOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          deviceId={deviceToDelete?.device?.deviceId}
        />
      )}
    </Box>
  );
};

export default UnassignedListTable;
