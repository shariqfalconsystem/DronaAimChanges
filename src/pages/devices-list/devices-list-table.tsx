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
import { useNavigate } from 'react-router-dom';
import Pagination from '../../components/molecules/pagination';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import useTableFilter from '../../common/hooks/useTableFilters';
import { formatDateTimeAlpha } from '../../utility/utilities';
import { StyledDataCell } from '../../components/atoms/table-body-cell';
import { toast } from 'react-toastify';
import { StyledHeadCell } from '../trip-list/table-row-cell';
import ChipWithIcon from '../../components/atoms/chip-with-icon';
import debounce from 'lodash/debounce';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import SnapshotImageDisplay from '../../components/modals/snapshot';
import environment from '../../environments/environment';
import Video from '../../assets/icons/video.png';
import LastPing from '../../assets/icons/lastping.png';

const DevicesListTable: React.FC<any> = ({
  deviceInformation,
  onPageChange,
  onSearch,
  onSort,
  currentPage,
  searchQueries,
  setSearchQueries,
  setSortColumn,
  sortColumn,
  sortDirection,
  setSortDirection,
  onDeviceVideo,
  visibleColumns,
}) => {
  const [localSearchQueries, setLocalSearchQueries] = useState<Record<string, any>>({});
  const [processedTrips, setProcessedTrips] = useState<any[]>([]);
  const [applyBackdropFilter, setApplyBackdropFilter] = useState(false);

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

    if (value === '') {
      delete newQueries[column];
    }

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

  const handleVideoClick = (e: any, device: any) => {
    e.stopPropagation();
    e.preventDefault();
    onDeviceVideo(device);
  };

  const columns = [
    { label: 'Device ID', key: 'deviceId', minWidth: '100px' },
    { label: 'Device Status', key: 'status', minWidth: '90px' },
    { label: 'Device Provider', key: 'partnerName', minWidth: '100px' },
    { label: 'IMEI Number', key: 'imei', minWidth: '110px' },
    { label: 'Last Status Ping', key: 'lastStatusPing', minWidth: '140px' },
    { label: 'Last Location Ping', key: 'lastLocationPing', minWidth: '140px' },
    { label: 'Vehicle ID', key: 'vehicleId', minWidth: '100px' },
    { label: 'VIN', key: 'vin', minWidth: '140px' },
    { label: 'Shipping Provider', key: 'shippingProviderName', minWidth: '110px' },
    { label: 'Tracking Number', key: 'trackingNumber', minWidth: '110px' },
    { label: 'Date of Shipment', key: 'shipmentDate', minWidth: '100px' },
    { label: 'Device Snapshots', key: 'snapshot', minWidth: '100px' },
    { label: 'Action', key: 'actions', minWidth: '70px' },
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
                .filter((col) => !visibleColumns || visibleColumns[col.key] !== false)
                .map(({ label, key, minWidth }, index, filteredArray) => (
                  <StyledHeadCell
                    key={key}
                    sx={{
                      minWidth: minWidth,
                      position: index === 0 || index === filteredArray.length - 1 ? 'sticky' : 'static',
                      left: index === 0 ? 0 : 'auto',
                      right: index === filteredArray.length - 1 ? 0 : 'auto',
                      zIndex: index === 0 || index === filteredArray.length - 1 ? 2 : 'auto',
                      backdropFilter: applyBackdropFilter ? 'blur(50px)' : 'none',
                      boxShadow:
                        index === 0
                          ? '2px 0 5px rgba(0,0,0,0.1)'
                          : index === filteredArray.length - 1
                            ? '-2px 0 5px rgba(0,0,0,0.1)'
                            : 'none',
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
                            disabled={key === 'snapshot'}
                            onChange={(e) => handleColumnSearch(key, e.target.value)}
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
                    .filter((col) => !visibleColumns || visibleColumns[col.key] !== false)
                    .map(({ key, minWidth }, index, filteredArray) => {
                      const commonProps = {
                        key,
                        sx: {
                          minWidth,
                          position: index === 0 || index === filteredArray.length - 1 ? 'sticky' : 'static',
                          left: index === 0 ? 0 : 'auto',
                          right: index === filteredArray.length - 1 ? 0 : 'auto',
                          zIndex: index === 0 || index === filteredArray.length - 1 ? 2 : 'auto',
                          backdropFilter: applyBackdropFilter ? 'blur(50px)' : 'none',
                          background:
                            device.isLastPingStatusFourteenDaysAgo === 'inactive'
                              ? '#FFF8ED'
                              : applyBackdropFilter
                                ? '#f5f5f5'
                                : 'inherit',
                          boxShadow:
                            index === 0
                              ? '2px 0 5px rgba(0,0,0,0.1)'
                              : index === filteredArray.length - 1
                                ? '-2px 0 5px rgba(0,0,0,0.1)'
                                : 'none',
                        },
                      };

                      if (key === 'deviceId') {
                        return (
                          <StyledDataCell {...commonProps}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 1 }}>
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
                                {device.deviceId || 'NA'}
                              </Typography>
                            </Box>
                          </StyledDataCell>
                        );
                      }
                      if (key === 'status') {
                        return (
                          <StyledDataCell {...commonProps}>
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
                      if (key === 'partnerName') {
                        return <StyledDataCell {...commonProps}>{device?.deviceProvider || 'NA'}</StyledDataCell>;
                      }
                      if (key === 'imei') {
                        return <StyledDataCell {...commonProps}>{device?.imei || 'NA'}</StyledDataCell>;
                      }
                      if (key === 'lastStatusPing') {
                        return (
                          <StyledDataCell {...commonProps}>
                            {formatDateTimeAlpha(device?.statusTsInMilliseconds) || 'NA'}
                          </StyledDataCell>
                        );
                      }
                      if (key === 'lastLocationPing') {
                        return (
                          <StyledDataCell {...commonProps}>
                            {formatDateTimeAlpha(device?.lastLiveTrack?.tsInMilliSeconds) || 'NA'}
                          </StyledDataCell>
                        );
                      }
                      if (key === 'vehicleId') {
                        return (
                          <StyledDataCell {...commonProps}>
                            {device?.lookup_vehicles[0]?.vehicleId || 'NA'}
                          </StyledDataCell>
                        );
                      }
                      if (key === 'vin') {
                        return (
                          <StyledDataCell {...commonProps}>{device?.lookup_vehicles[0]?.vin || 'NA'}</StyledDataCell>
                        );
                      }
                      if (key === 'shippingProviderName') {
                        return <StyledDataCell {...commonProps}>{device?.shippingProviderName || 'NA'}</StyledDataCell>;
                      }
                      if (key === 'trackingNumber') {
                        return <StyledDataCell {...commonProps}>{device?.trackingNumber || 'NA'}</StyledDataCell>;
                      }
                      if (key === 'shipmentDate') {
                        return <StyledDataCell {...commonProps}>{device?.shipmentDate || 'NA'}</StyledDataCell>;
                      }
                      if (key === 'snapshot') {
                        return (
                          <StyledDataCell {...commonProps}>
                            <SnapshotImageDisplay
                              snapshots={device?.snapshot}
                              mediaBaseUrl={environment.mediaBaseUrl}
                            />
                          </StyledDataCell>
                        );
                      }
                      if (key === 'actions') {
                        return (
                          <StyledDataCell {...commonProps}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
                  <Typography variant="body1"> No Devices Found </Typography>
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
    </Box>
  );
};

export default DevicesListTable;
