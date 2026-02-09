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
  Tooltip,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Pagination from '../../../components/molecules/pagination';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import ActiveNavigation from '../../../assets/icons/active-navigation.png';
import CompletedNavigation from '../../../assets/icons/completed-box.png';
import {
  formatLocalizedDateTime,
  formatScore,
  formatUserDateTime,
  splitAddressInTwoLines,
  getLocalDateFromUtc,
} from '../../../utility/utilities';
import { StyledHeadCell } from './table-row-cell';
import { StyledDataCell } from '../../../components/atoms/table-body-cell';
import { toast } from 'react-toastify';
import debounce from 'lodash/debounce';
import { DatePicker } from 'antd';
import formatDateTimeForTripTable from '../../../components/atoms/date-time-lines';
import { paths } from '../../../common/constants/routes';
import Orphan from '../../../assets/icons/orphan.png';

const TripListTable = ({
  tripsInformation,
  onPageChange,
  onSearch,
  onSort,
  currentPage,
  setCurrentPage,
  filterCriteria,
  searchQueries,
  setSearchQueries,
  setSortColumn,
  sortColumn,
  sortDirection,
  setSortDirection,
  visibleColumns,
}: any) => {
  const navigate = useNavigate();
  const [applyBackdropFilter, setApplyBackdropFilter] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const tableRef = useRef<HTMLTableElement | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [localSearchQueries, setLocalSearchQueries] = useState<Record<string, any>>({});

  useEffect(() => {
    setLocalSearchQueries(searchQueries);
  }, [searchQueries]);

  const handleDateChange = (date: any, key: string) => {
    if (!date) {
      const newQueries = { ...localSearchQueries, [key]: null };
      setLocalSearchQueries(newQueries);
      debouncedSearch(newQueries);
      return;
    }

    let utcTimestamp;
    if (key === 'startDate') {
      utcTimestamp = Date.UTC(date.year(), date.month(), date.date(), 0, 0, 0, 0);
    } else {
      utcTimestamp = Date.UTC(date.year(), date.month(), date.date(), 23, 59, 59, 999);
    }

    const newQueries = {
      ...localSearchQueries,
      [key]: utcTimestamp,
    };
    setLocalSearchQueries(newQueries);
    debouncedSearch(newQueries);
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    setApplyBackdropFilter(target.scrollLeft > 0);
  };

  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    setSortColumn(column);
    setSortDirection(direction);
    setCurrentPage(1);
    setSearchParams({ page: '1' });
    onSort(column, direction);
  };

  const debouncedSearch = useCallback(
    debounce((queries: any) => {
      onSearch(queries);
      setCurrentPage(1);
      setSearchParams({ page: '1' });
      setSearchQueries(queries);
    }, 1000),
    [onSearch, setSearchQueries, setCurrentPage, setSearchParams]
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

  const columns = [
    { label: 'Insured ID', key: 'insuredId', minWidth: '100px', hideable: true },
    { label: 'Fleet Name', key: 'name', minWidth: '130px', hideable: true },
    { label: 'Trip ID', key: 'tripId', minWidth: '100px', hideable: false },
    { label: 'Driver', key: 'driver', minWidth: '130px', hideable: true },
    { label: 'Phone', key: 'phoneNumber', minWidth: '110px', hideable: true },
    { label: 'VIN', key: 'vin', minWidth: '140px', hideable: true },
    { label: 'IMEI Number', key: 'imei', minWidth: '140px', hideable: true },
    { label: 'Start Date', key: 'startDate', minWidth: '130px', hideable: true },
    { label: 'End Date', key: 'endDate', minWidth: '130px', hideable: true },
    { label: 'Start Location', key: 'startAddress', minWidth: '180px', hideable: true },
    { label: 'End Location', key: 'endAddress', minWidth: '180px', hideable: true },
    { label: 'Trip Distance', key: 'totalDistanceInMiles', minWidth: '100px', hideable: true },
    { label: 'Events', key: 'incidentCount', minWidth: '80px', hideable: true },
    { label: 'Trip Score', key: 'tripScore', minWidth: '90px', hideable: true },
  ];

  const handleRowClick = (trip: any) => {
    if (trip.isOrphaned) {
      toast.warning('This is a truncated trip');
    } else {
      navigate(`${paths.INSURERTRIPDETAILS}/${trip.tripId}/?vin=${trip.vin}`, {
        state: trip,
      });
    }
  };

  const totalPages =
    Math.ceil(tripsInformation?.pageDetails?.totalRecords / tripsInformation?.pageDetails?.pageSize) || 1;

  return (
    <Box
      ref={containerRef}
      sx={{
        whiteSpace: 'nowrap',
        width: '80vw',
      }}
    >
      <TableContainer
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
        <Table
          ref={tableRef}
          sx={{
            minWidth: '100%',
          }}
        >
          <TableHead>
            <TableRow>
              {columns
                .filter((col) => !visibleColumns || visibleColumns[col.key] !== false)
                .map(({ label, key, minWidth }, index) => (
                  <StyledHeadCell
                    key={key}
                    sx={{
                      position: index === 0 ? 'sticky' : 'static',
                      left: index === 0 ? 0 : 'auto',
                      zIndex: index === 0 ? 2 : 'auto',
                      backdropFilter: applyBackdropFilter ? 'blur(50px)' : 'none',
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      {key === 'startAddress' || key === 'endAddress' ? (
                        <Tooltip title="Location is calculated based on available GPS data." arrow>
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
                            </Box>
                          </Typography>
                        </Tooltip>
                      ) : (
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
                          </Box>
                        </Typography>
                      )}
                      {['startDate', 'endDate'].includes(key) ? (
                        <DatePicker
                          value={localSearchQueries[key] ? getLocalDateFromUtc(localSearchQueries[key]) : null}
                          onChange={(date) => handleDateChange(date, key)}
                          placeholder={``}
                          format="MM-DD-YYYY"
                          style={{ marginTop: 8, width: '100%' }}
                          showTime={false}
                        />
                      ) : (
                        <TextField
                          size="small"
                          variant="outlined"
                          value={localSearchQueries[key] || ''}
                          onChange={(e) => handleColumnSearch(key, e.target.value)}
                          sx={{
                            mt: 1,
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'white',
                              width: '100%',
                              height: '30px',
                            },
                          }}
                        />
                      )}
                    </Box>
                  </StyledHeadCell>
                ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tripsInformation?.trips && tripsInformation?.trips?.length > 0 ? (
              tripsInformation?.trips?.map((trip: any) => {
                const startDate: any = trip.startLocalizedTsInMilliSeconds
                  ? formatLocalizedDateTime(trip.startLocalizedTsInMilliSeconds, trip.startTzAbbreviation)?.onlyDate
                  : formatUserDateTime(trip.startDate)?.onlyDate;

                const startTime: any = trip.startLocalizedTsInMilliSeconds
                  ? formatLocalizedDateTime(trip.startLocalizedTsInMilliSeconds, trip.startTzAbbreviation)?.time
                  : formatUserDateTime(trip.startDate)?.time;

                const endDate: any = trip.endLocalizedTsInMilliSeconds
                  ? formatLocalizedDateTime(trip.endLocalizedTsInMilliSeconds, trip.endTzAbbreviation)?.onlyDate
                  : formatUserDateTime(trip.endDate)?.onlyDate;

                const endTime: any = trip.endLocalizedTsInMilliSeconds
                  ? formatLocalizedDateTime(trip.endLocalizedTsInMilliSeconds, trip.endTzAbbreviation)?.time
                  : formatUserDateTime(trip.endDate)?.time;

                return (
                  <TableRow
                    key={trip.tripId}
                    sx={{
                      backgroundColor: trip.isOrphaned ? '#f0f0f0' : 'transparent',
                      color: trip.isOrphaned ? '#a1a1a1' : 'inherit',
                      cursor: trip.isOrphaned ? 'default' : 'pointer',
                      '&:hover': {
                        backgroundColor: trip.isOrphaned ? '#f0f0f0' : '#f5f5f5',
                      },
                    }}
                    onClick={() => handleRowClick(trip)}
                  >
                    {columns
                      .filter((col) => !visibleColumns || visibleColumns[col.key] !== false)
                      .map(({ key }) => {
                        if (key === 'insuredId') {
                          return (
                            <StyledDataCell
                              key={key}
                              sx={{
                                position: 'sticky',
                                left: 0,
                                zIndex: 3,
                                whiteSpace: 'nowrap',
                                backdropFilter: applyBackdropFilter ? 'blur(50px)' : 'none',
                                boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                              }}
                            >
                              {trip.lookup_fleetcompanies?.[0]?.insuredId || 'NA'}
                            </StyledDataCell>
                          );
                        }
                        if (key === 'name') {
                          return (
                            <StyledDataCell key={key}>
                              {trip.lookup_fleetcompanies?.[0]?.name || 'NA'}
                            </StyledDataCell>
                          );
                        }
                        if (key === 'tripId') {
                          return (
                            <StyledDataCell key={key}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-around',
                                }}
                              >
                                <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
                                  {trip.tripId || 'NA'}
                                </Typography>{' '}
                                &nbsp;
                                {trip?.isOrphaned ? (
                                  <img src={Orphan} alt="orphaned-trip" width={20} height={20} />
                                ) : trip?.tripStatus === 'Started' ? (
                                  <img src={ActiveNavigation} alt="in-progress-trip" width={20} height={20} />
                                ) : (
                                  <img src={CompletedNavigation} alt="completed-trip" width={20} height={20} />
                                )}
                              </Box>
                            </StyledDataCell>
                          );
                        }
                        if (key === 'driver') {
                          return (
                            <StyledDataCell key={key}>
                              {trip.driverFirstName ? `${trip.driverFirstName} ${trip?.driverLastName}` : 'NA'}
                            </StyledDataCell>
                          );
                        }
                        if (key === 'phoneNumber') {
                          return (
                            <StyledDataCell key={key}>
                              {trip.lookup_users?.[0]?.primaryPhone
                                ? `${trip.lookup_users[0].primaryPhoneCtryCd} ${trip.lookup_users[0].primaryPhone}`
                                : 'NA'}
                            </StyledDataCell>
                          );
                        }
                        if (key === 'vin') {
                          return <StyledDataCell key={key}>{trip.vin || 'NA'} </StyledDataCell>;
                        }
                        if (key === 'imei') {
                          return <StyledDataCell key={key}>{trip.imei || 'NA'} </StyledDataCell>;
                        }
                        if (key === 'startDate') {
                          return (
                            <StyledDataCell key={key}>
                              {formatDateTimeForTripTable(startDate, startTime) || 'NA'}
                            </StyledDataCell>
                          );
                        }
                        if (key === 'endDate') {
                          return (
                            <StyledDataCell key={key}>
                              {formatDateTimeForTripTable(endDate, endTime) || 'NA'}
                            </StyledDataCell>
                          );
                        }
                        if (key === 'startAddress') {
                          return (
                            <StyledDataCell key={key}>
                              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                {trip?.startAddress && trip?.startAddress !== 'NA' ? (
                                  splitAddressInTwoLines(trip.startAddress).map((line: any, index: any) => (
                                    <Typography key={index} variant="body2" sx={{ fontSize: '0.75rem' }}>
                                      {line}
                                    </Typography>
                                  ))
                                ) : (
                                  <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#9CACBA' }}>
                                    GPS Location Not Available
                                  </Typography>
                                )}
                              </Box>
                            </StyledDataCell>
                          );
                        }
                        if (key === 'endAddress') {
                          return (
                            <StyledDataCell key={key} width="5%">
                              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                {trip?.endAddress && trip?.endAddress !== 'NA' ? (
                                  splitAddressInTwoLines(trip.endAddress).map((line: any, index: any) => (
                                    <Typography key={index} variant="body2" sx={{ fontSize: '0.75rem' }}>
                                      {line}
                                    </Typography>
                                  ))
                                ) : (
                                  <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#9CACBA' }}>
                                    GPS Location Not Available
                                  </Typography>
                                )}
                              </Box>
                            </StyledDataCell>
                          );
                        }
                        if (key === 'totalDistanceInMiles') {
                          return (
                            <StyledDataCell key={key}>
                              {trip?.totalDistanceInMiles ? `${trip?.totalDistanceInMiles} Miles` : '0 Miles'}
                            </StyledDataCell>
                          );
                        }
                        if (key === 'incidentCount') {
                          return <StyledDataCell key={key}>{`${trip?.incidentCount || 0}`} </StyledDataCell>;
                        }
                        if (key === 'tripScore') {
                          return <StyledDataCell key={key}>{formatScore(trip?.tripScore)}</StyledDataCell>;
                        }
                        return null;
                      })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <StyledDataCell colSpan={columns.length}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <Typography variant="body1">No Trips Found</Typography>
                  </Box>
                </StyledDataCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          setCurrentPage(page);
          setSearchParams({ page: page.toString() });
          onPageChange(page);
        }}
        totalRecords={tripsInformation?.pageDetails?.totalRecords}
        pageSize={tripsInformation?.pageDetails?.pageSize}
        isDefaultList={true}
      />
    </Box>
  );
};

export default TripListTable;
