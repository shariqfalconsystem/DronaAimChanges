import { useCallback, useEffect, useRef, useState } from 'react';
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
  Checkbox,
} from '@mui/material';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import Pagination from '../../components/molecules/pagination';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import {
  formatLocalizedDateTime,
  formatUserDateTime,
  getAssociatedLabel,
  splitAddressInTwoLines,
} from '../../utility/utilities';
import { StyledDataCell } from '../../components/atoms/table-body-cell';
import { StyledHeadCell } from '../trip-list/table-row-cell';
import debounce from 'lodash/debounce';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { paths } from '../../common/constants/routes';

const EventsListTable = ({
  eventsInformation,
  onPageChange,
  onSearch,
  onSort,
  searchQueries,
  setSearchQueries,
  setSortColumn,
  sortColumn,
  sortDirection,
  setSortDirection,
  currentPage,
  setCurrentPage,
  onSelectionChange,
  selectedEvents,
  selectAllChecked,
  visibleColumns,
}: any) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement | null>(null);

  const [hoveredRow, setHoveredRow] = useState(null);
  const [localSearchQueries, setLocalSearchQueries] = useState<Record<string, any>>({});
  const [applyBackdropFilter, setApplyBackdropFilter] = useState(false);

  useEffect(() => {
    setLocalSearchQueries(searchQueries);
  }, [searchQueries]);

  const showAllCheckboxes = selectedEvents.length > 0 || selectAllChecked;

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    setApplyBackdropFilter(target.scrollLeft > 0);
  };

  const handleCheckboxChange = (eventId: string, eventObject: any) => {
    const newSelection = selectedEvents.includes(eventId)
      ? selectedEvents.filter((id: string) => id !== eventId)
      : [...selectedEvents, eventId];
    onSelectionChange(newSelection, eventObject);
  };

  const handleDateChange = (date: any, key: string) => {
    if (!date) {
      const newQueries = { ...localSearchQueries, [key]: null };
      setLocalSearchQueries(newQueries);
      debouncedSearch(newQueries);
      return;
    }

    const timestamp = key === 'startDate' ? date.startOf('day').valueOf() : date.endOf('day').valueOf();
    const newQueries = { ...localSearchQueries, [key]: timestamp };
    setLocalSearchQueries(newQueries);
    debouncedSearch(newQueries);
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

  const handleColumnSearch = (column: any, value: any) => {
    const newQueries = { ...searchQueries, [column]: value };
    setLocalSearchQueries(newQueries);
    debouncedSearch(newQueries);
  };

  const handleRowMouseEnter = (eventId: any) => {
    if (!showAllCheckboxes) {
      setHoveredRow(eventId);
    }
  };

  const handleRowMouseLeave = () => {
    if (!showAllCheckboxes) {
      setHoveredRow(null);
    }
  };

  const columns = [
    { label: '', key: 'checkbox', minWidth: '50px', hideable: false },
    { label: 'Event ID', key: 'eventId', minWidth: '100px', hideable: false },
    { label: 'Event Type', key: 'uiEventType', minWidth: '130px', hideable: true },
    { label: 'Date & Time', key: 'tsInMilliSeconds', minWidth: '150px', hideable: true },
    { label: 'Location', key: 'address', minWidth: '180px', hideable: true },
    { label: 'Trip ID', key: 'tripId', minWidth: '100px', hideable: true },
    { label: 'Vehicle ID', key: 'vehicleId', minWidth: '100px', hideable: true },
    { label: 'VIN', key: 'vin', minWidth: '140px', hideable: true },
    { label: 'IMEI Number', key: 'imei', minWidth: '140px', hideable: true },
    { label: 'Driver', key: 'driverName', minWidth: '130px', hideable: true },
    { label: 'Phone', key: 'phoneNumber', minWidth: '110px', hideable: true },
  ];

  const totalPages =
    Math.ceil(eventsInformation?.pageDetails?.totalRecords / eventsInformation?.pageDetails?.pageSize) || 1;

  return (
    <Box
      ref={containerRef}
      sx={{
        whiteSpace: 'nowrap',
        width: '100%',
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
                      width: minWidth,
                      minWidth: minWidth,
                      position: index <= 1 ? 'sticky' : 'static',
                      left: index === 0 ? 0 : index === 1 ? '50px' : 'auto',
                      zIndex: index <= 1 ? 3 : 'auto',
                      backdropFilter: applyBackdropFilter ? 'blur(50px)' : 'none',
                      background: index <= 1 ? '#EDF0F5' : 'inherit',
                      boxShadow:
                        index === 1 ? '2px 0 5px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    {key === 'checkbox' ? (
                      <Box className="flex items-center justify-center" />
                    ) : (
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
                            mb: 1,
                          }}
                          onClick={() => {
                            key !== 'startLocation' && key !== 'endLocation';
                          }}
                          component={'span'}
                        >
                          {label}
                          <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                            {key === 'eventType' ? (
                              <>
                                <TbTriangleFilled
                                  size={8}
                                  color={sortColumn === key && sortDirection === 'ASC' ? '#000' : 'rgba(0,0,0,0.5)'}
                                  style={{ cursor: 'not-allowed' }}
                                />
                                <TbTriangleInvertedFilled
                                  size={8}
                                  color={sortColumn === key && sortDirection === 'ASC' ? '#000' : 'rgba(0,0,0,0.5)'}
                                  style={{ cursor: 'not-allowed' }}
                                />
                              </>
                            ) : (
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

                        {['tsInMilliSeconds'].includes(key) ? (
                          <DatePicker
                            value={localSearchQueries[key] ? dayjs(localSearchQueries[key]) : null}
                            onChange={(date) => handleDateChange(date, key)}
                            placeholder=""
                            format="MM-DD-YYYY"
                            className="mt-2 w-full"
                          />
                        ) : (
                          key !== 'checkbox' && (
                            <TextField
                              size="small"
                              variant="outlined"
                              value={localSearchQueries[key] || ''}
                              onChange={(e) => handleColumnSearch(key, e.target.value)}
                              className="mt-1"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  backgroundColor: 'white',
                                  width: '100%',
                                  height: '30px',
                                },
                              }}
                            />
                          )
                        )}
                      </Box>
                    )}
                  </StyledHeadCell>
                ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {eventsInformation?.allEvents && eventsInformation?.allEvents?.length > 0 ? (
              eventsInformation?.allEvents?.map((event: any, index: any) => (
                <TableRow
                  key={`${event.eventId}${index}`}
                  onMouseEnter={() => handleRowMouseEnter(event.eventId)}
                  onMouseLeave={handleRowMouseLeave}
                  onClick={() => {
                    navigate(`${paths.EVENTSDETAILS}/${event.eventId}/`, {
                      state: { ...event, place: event.address },
                    });
                  }}
                  sx={{
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      cursor: 'pointer',
                    },
                  }}
                >
                  {columns
                    .filter((col) => !visibleColumns || visibleColumns[col.key] !== false)
                    .map(({ key, minWidth }, index) => {
                      const commonProps = {
                        key,
                        sx: {
                          minWidth,
                          position: index <= 1 ? 'sticky' : 'static',
                          left: index === 0 ? 0 : index === 1 ? '50px' : 'auto',
                          zIndex: index <= 1 ? 2 : 'auto',
                          backdropFilter: applyBackdropFilter ? 'blur(50px)' : 'none',
                          background: index <= 1 ? (applyBackdropFilter ? '#f5f5f5' : '#fff') : 'inherit',
                          boxShadow:
                            index === 1 ? '2px 0 5px rgba(0,0,0,0.1)' : 'none',
                        },
                      };

                      if (key === 'checkbox') {
                        return (
                          <StyledDataCell {...commonProps}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                margin: '0',
                                padding: '0',
                                minWidth: 'auto',
                              }}
                            >
                              <Checkbox
                                checked={selectedEvents?.includes(event?.eventId)}
                                onChange={() => handleCheckboxChange(event?.eventId, event)}
                                onClick={(e) => e.stopPropagation()}
                                size="small"
                                sx={{
                                  padding: '0',
                                  margin: '0',
                                  visibility: showAllCheckboxes || hoveredRow === event?.eventId ? 'visible' : 'hidden',
                                  opacity: showAllCheckboxes || hoveredRow === event?.eventId ? 1 : 0,
                                  transition: 'opacity 0.2s',
                                  ml: 1,
                                }}
                              />
                            </Box>
                          </StyledDataCell>
                        );
                      }
                      if (key === 'eventId') {
                        return (
                          <StyledDataCell {...commonProps}>
                            <Typography
                              variant="body1"
                              sx={{
                                fontSize: '0.75rem',
                                marginLeft: '1px',
                              }}
                            >
                              {event.eventId || 'NA'}
                            </Typography>
                          </StyledDataCell>
                        );
                      }
                      if (key === 'uiEventType') {
                        return <StyledDataCell {...commonProps}>{event?.uiEventType || 'NA'}</StyledDataCell>;
                      }
                      if (key === 'tsInMilliSeconds') {
                        return (
                          <StyledDataCell {...commonProps}>
                            {event?.localizedTsInMilliSeconds
                              ? formatLocalizedDateTime(event.localizedTsInMilliSeconds, event?.tzAbbreviation)
                                ?.dateWithTmz
                              : formatUserDateTime(event.tsInMilliSeconds).date}
                          </StyledDataCell>
                        );
                      }
                      if (key === 'address') {
                        return (
                          <StyledDataCell {...commonProps}>
                            {event.address && event?.address !== 'NA' ? (
                              splitAddressInTwoLines(event.address).map((line: any, index: any) => (
                                <Typography key={index} variant="body2" sx={{ fontSize: '0.75rem' }}>
                                  {line}
                                </Typography>
                              ))
                            ) : (
                              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#9CACBA' }}>
                                GPS Location Not Available
                              </Typography>
                            )}
                          </StyledDataCell>
                        );
                      }
                      if (key === 'tripId') {
                        return <StyledDataCell {...commonProps}>{event?.tripId || 'NA'}</StyledDataCell>;
                      }
                      if (key === 'vehicleId') {
                        return <StyledDataCell {...commonProps}>{event?.vehicleId || 'NA'}</StyledDataCell>;
                      }
                      if (key === 'vin') {
                        return (
                          <StyledDataCell {...commonProps}>
                            {event?.lookup_vehicles?.[0]?.vin || 'NA'}{' '}
                          </StyledDataCell>
                        );
                      }
                      if (key === 'imei') {
                        return <StyledDataCell {...commonProps}>{event?.imei || 'NA'} </StyledDataCell>;
                      }
                      if (key === 'driverName') {
                        return (
                          <StyledDataCell {...commonProps}>
                            {event?.driverFullName ? `${event.driverFullName}` : 'NA'}
                          </StyledDataCell>
                        );
                      }
                      if (key === 'phoneNumber') {
                        return (
                          <StyledDataCell {...commonProps}>{event?.phoneNo ? `${event.phoneNo}` : 'NA'}</StyledDataCell>
                        );
                      }
                      return null;
                    })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <StyledDataCell colSpan={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <Typography variant="body1"> No Events Found</Typography>
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
        totalRecords={eventsInformation?.pageDetails?.totalRecords}
        pageSize={eventsInformation?.pageDetails?.pageSize}
        isDefaultList={true}
      />
    </Box>
  );
};

export default EventsListTable;
