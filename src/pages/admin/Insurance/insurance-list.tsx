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
import Pagination from '../../../components/molecules/pagination';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import { StyledDataCell } from '../../../components/atoms/table-body-cell';
import debounce from 'lodash/debounce';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { StyledHeadCell } from './table-row-cell';
import ChipWithIcon from '../../../components/atoms/chip-with-icon';
import { roleLabels } from '../../../common/constants/general';
import Edit from '../../../assets/icons/edit.png';

const InsuranceTable = ({
  insuranceInformation,
  onPageChange,
  onSearch,
  onSort,
  currentPage,
  filterCriteria,
  searchQueries,
  setSearchQueries,
  setSortColumn,
  sortColumn,
  sortDirection,
  setSortDirection,
  onEditInsurer,
  visibleColumns,
  columns,
}: any) => {
  const navigate = useNavigate();
  const [applyBackdropFilter, setApplyBackdropFilter] = useState(false);

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

    const timestamp = key === 'startDate' ? date.startOf('day').valueOf() : date.endOf('day').valueOf();
    const newQueries = { ...localSearchQueries, [key]: timestamp };
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
    onSort(column, direction);
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

  const handleEditClick = (e: any, user: any) => {
    e.stopPropagation();
    e.preventDefault();
    onEditInsurer(user);
  };

  // const columns = [
  //   { label: 'Organization ID', key: 'insurerId' },
  //   { label: 'Organization Name', key: 'name' },
  //   { label: 'Primary Contact', key: 'primaryContactName' },
  //   { label: 'Phone', key: 'primaryPhone' },
  //   { label: 'Email', key: 'emailId' },
  //   { label: 'Address', key: 'address' },
  //   { label: 'Total Fleets', key: 'numberOfFleetCompanies' },
  //   { label: 'Total Vehicles', key: 'numberOfVehicles' },
  //   { label: 'Total Devices', key: 'numberOfDevices' },
  //   { label: 'Total Drivers', key: 'numberOfDrivers' },
  //   { label: 'Total Users', key: 'numberOfInsurerUsers' },
  //   { label: 'Action', key: 'actions' },
  // ];
  const totalPages = Math.ceil(insuranceInformation?.pageDetails?.totalRecords / 10) || 1;
  console.log('insurance info', insuranceInformation);

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
        <Table
          ref={tableRef}
          sx={{
            minWidth: '100%',
          }}
        >
          <TableHead>
            <TableRow>
              {columns
                .filter((col: any) => !visibleColumns || visibleColumns[col.key] !== false)
                .map(({ label, key, minWidth }: any, index: number) => (
                  <StyledHeadCell
                    key={key}
                    sx={{
                      width: minWidth,
                      minWidth: minWidth,
                      position: index === 0 || key === 'actions' ? 'sticky' : 'static',
                      left: index === 0 ? 0 : 'auto',
                      right: key === 'actions' ? 0 : 'auto',
                      zIndex: index === 0 || key === 'actions' ? 2 : 'auto',
                      backdropFilter: applyBackdropFilter ? 'blur(50px)' : 'none',
                      background: key === 'actions' ? '#EDF0F5' : 'auto',
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
                        {key !== 'actions' && (
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
                        )}
                      </Typography>
                      {['startDate', 'endDate']?.includes(key) ? (
                        <DatePicker
                          value={localSearchQueries[key] ? dayjs(localSearchQueries[key]) : null}
                          onChange={(date) => handleDateChange(date, key)}
                          placeholder={``}
                          format="MM-DD-YYYY"
                          style={{ marginTop: 8, width: '100%' }}
                        />
                      ) : key !== 'actions' ? (
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
                      ) : null}
                    </Box>
                  </StyledHeadCell>
                ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {insuranceInformation?.insurers && insuranceInformation?.insurers?.length > 0 ? (
              insuranceInformation?.insurers?.map((user: any) => {
                const contactList = user?.primaryContact;
                const primaryContact =
                  Array.isArray(contactList) && contactList.length > 0 ? contactList[0] : undefined;

                return (
                  <TableRow
                    key={user.insurerId}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  >
                    {columns
                      .filter((col: any) => !visibleColumns || visibleColumns[col.key] !== false)
                      .map(({ key, minWidth }: any, colIndex: number) => {
                        const isFirst = colIndex === 0;
                        const isLast = key === 'actions';

                        const commonCellStyles = {
                          position: isFirst || isLast ? 'sticky' : 'static',
                          left: isFirst ? 0 : 'auto',
                          right: isLast ? 0 : 'auto',
                          zIndex: isFirst || isLast ? 2 : 'auto',
                          whiteSpace: 'nowrap',
                          backdropFilter: (isFirst || isLast) && applyBackdropFilter ? 'blur(50px)' : 'none',
                          background: isFirst || isLast ? (isLast ? '#f5f5f5' : (applyBackdropFilter ? '#f5f5f5' : 'inherit')) : 'inherit',
                          boxShadow: isFirst || isLast ? (isFirst ? '2px 0 5px rgba(0,0,0,0.1)' : '-2px 0 5px rgba(0,0,0,0.1)') : 'none',
                          width: minWidth,
                          minWidth: minWidth,
                        };

                        if (key === 'insurerId') {
                          return (
                            <StyledDataCell key={key} sx={commonCellStyles}>
                              {user.insurerId}
                            </StyledDataCell>
                          );
                        }
                        if (key === 'name') {
                          return <StyledDataCell key={key} sx={commonCellStyles}>{user.name || 'NA'}</StyledDataCell>;
                        }
                        if (key === 'primaryContactName') {
                          return <StyledDataCell key={key} sx={commonCellStyles}>{primaryContact?.fullName || 'NA'}</StyledDataCell>;
                        }
                        if (key === 'primaryPhone') {
                          return <StyledDataCell key={key} sx={commonCellStyles}>{primaryContact?.fullPhone || 'NA'}</StyledDataCell>;
                        }
                        if (key === 'emailId') {
                          return <StyledDataCell key={key} sx={commonCellStyles}>{primaryContact?.emailId || 'NA'}</StyledDataCell>;
                        }
                        if (key === 'address') {
                          return <StyledDataCell key={key} sx={commonCellStyles}>{primaryContact?.address || 'NA'}</StyledDataCell>;
                        }
                        if (key === 'numberOfFleetCompanies') {
                          return <StyledDataCell key={key} sx={commonCellStyles}>{user?.numberOfFleetCompanies || 'NA'}</StyledDataCell>;
                        }
                        if (key === 'numberOfVehicles') {
                          return <StyledDataCell key={key} sx={commonCellStyles}>{user?.numberOfVehicles || 'NA'}</StyledDataCell>;
                        }
                        if (key === 'numberOfDevices') {
                          return <StyledDataCell key={key} sx={commonCellStyles}>{user?.numberOfDevices || 'NA'}</StyledDataCell>;
                        }
                        if (key === 'numberOfDrivers') {
                          return <StyledDataCell key={key} sx={commonCellStyles}>{user?.numberOfDrivers || 'NA'}</StyledDataCell>;
                        }
                        if (key === 'numberOfInsurerUsers') {
                          return <StyledDataCell key={key} sx={commonCellStyles}>{user?.numberOfInsurerUsers || 'NA'}</StyledDataCell>;
                        }
                        if (key === 'actions') {
                          return (
                            <StyledDataCell key={key} sx={{ ...commonCellStyles, padding: '10px' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                                <IconButton onClick={(e: any) => handleEditClick(e, user)}>
                                  <img src={Edit} alt="Edit" width={20} height={20} />
                                </IconButton>
                              </Box>
                            </StyledDataCell>
                          );
                        }
                        return null;
                      })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <StyledDataCell colSpan={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <Typography variant="body1">No Insurance Providers Found</Typography>
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
        onPageChange={onPageChange}
        totalRecords={insuranceInformation?.pageDetails?.totalRecords}
        pageSize={insuranceInformation?.pageDetails?.pageSize}
        isDefaultList={true}
      />
    </Box>
  );
};

export default InsuranceTable;
