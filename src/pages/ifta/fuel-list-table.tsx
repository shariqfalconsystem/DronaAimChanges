import {
  Box,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import debounce from 'lodash/debounce';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import { StyledDataCell } from '../../components/atoms/table-body-cell';
import { StyledHeadCell } from '../trip-list/table-row-cell';
import Pagination from '../../components/molecules/pagination';

const FuelTransactionListTable: React.FC<any> = ({
  fuelTransInformation,
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

    const timestamp =
      key === 'lastStatusPing' || key === 'lastLocationPing'
        ? date.startOf('day').valueOf()
        : date.endOf('day').valueOf();
    const newQueries = { ...localSearchQueries, [key]: timestamp };
    setLocalSearchQueries(newQueries);
    debouncedSearch(newQueries);
  };

  const handleSort = (column: string, direction: 'ASC' | 'DESC') => {
    setSortColumn(column);
    setSortDirection(direction);
    onSort(column, direction);
  };

  const columns = [
    { label: 'Card Number', key: 'cardNumber', minWidth: '150px', hideable: false },
    { label: 'Card Name', key: 'cardName', minWidth: '150px', hideable: true },
    { label: 'Driver Name', key: 'driverName', minWidth: '150px', hideable: true },
    { label: 'Transaction Date', key: 'txnDate', minWidth: '150px', hideable: true },
    { label: 'Vehicle', key: 'unit', minWidth: '120px', hideable: true },
    { label: 'Odometer', key: 'odometer', minWidth: '120px', hideable: true },
    { label: 'Location', key: 'locationName', minWidth: '180px', hideable: true },
    { label: 'Jurisdiction', key: 'stateProvince', minWidth: '120px', hideable: true },
    { label: 'Fees', key: 'fees', minWidth: '100px', hideable: true },
    { label: 'Item', key: 'item', minWidth: '120px', hideable: true },
    { label: 'Unit Price', key: 'unitPrice', minWidth: '120px', hideable: true },
    { label: 'Quantity', key: 'qty', minWidth: '100px', hideable: true },
    { label: 'Amount', key: 'amount', minWidth: '120px', hideable: true },
    { label: 'Currency', key: 'currency', minWidth: '100px', hideable: true },
  ];

  const totalPages =
    Math.ceil(fuelTransInformation?.pageDetails?.totalRecords / fuelTransInformation?.pageDetails?.pageSize) || 1;

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
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
                .map(({ label, key, minWidth }, index) => (
                  <StyledHeadCell
                    key={key}
                    sx={{
                      width: minWidth,
                      minWidth: minWidth,
                      position: index === 0 ? 'sticky' : 'static',
                      left: index === 0 ? 0 : 'auto',
                      zIndex: index === 0 ? 2 : 'auto',
                      backdropFilter: applyBackdropFilter ? 'blur(50px)' : 'none',
                      background: index === 0 ? '#EDF0F5' : 'inherit',
                      boxShadow: index === 0 ? '2px 0 5px rgba(0,0,0,0.1)' : 'none',
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
                          {key !== 'startLocation' && key !== 'endLocation' && key != 'actions' && (
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

                      {['lastStatusPing', 'lastLocationPing']?.includes(key) ? (
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
                            sx={{
                              mt: 1,
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
                  </StyledHeadCell>
                ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {fuelTransInformation?.iftaFuelTransactions && fuelTransInformation?.iftaFuelTransactions?.length > 0 ? (
              fuelTransInformation?.iftaFuelTransactions?.map((txn: any, index: number) => (
                <TableRow
                  key={index}
                  sx={{
                    backgroundColor: txn.isOrphaned ? '#f0f0f0' : 'transparent',
                    color: txn.isOrphaned ? '#a1a1a1' : 'inherit',
                    cursor: txn.isOrphaned ? 'default' : 'pointer',
                    '&:hover': {
                      backgroundColor: txn.isOrphaned ? '#f0f0f0' : '#f5f5f5',
                    },
                  }}
                >
                  {columns
                    .filter((col) => !visibleColumns || visibleColumns[col.key] !== false)
                    .map(({ key, minWidth }, colIndex, filteredArray) => {
                      const commonProps = {
                        key,
                        sx: {
                          minWidth,
                          position: colIndex === 0 ? 'sticky' : 'static',
                          left: colIndex === 0 ? 0 : 'auto',
                          zIndex: colIndex === 0 ? 2 : 'auto',
                          backdropFilter: applyBackdropFilter ? 'blur(50px)' : 'none',
                          background: colIndex === 0 ? (applyBackdropFilter ? '#f5f5f5' : '#fff') : 'inherit',
                          boxShadow: colIndex === 0 ? '2px 0 5px rgba(0,0,0,0.1)' : 'none',
                        },
                      };
                      if (key === 'cardNumber') {
                        return (
                          <StyledDataCell {...commonProps}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                              <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
                                {txn.cardNumber
                                  ? txn.cardNumber.length > 4
                                    ? '*'.repeat(txn.cardNumber.length - 4) + txn.cardNumber.slice(-4)
                                    : txn.cardNumber
                                  : 'NA'}
                              </Typography>
                            </Box>
                          </StyledDataCell>
                        );
                      }
                      if (key === 'cardName') {
                        return <StyledDataCell {...commonProps}> {txn?.cardName || 'NA'} </StyledDataCell>;
                      }
                      if (key === 'driverName') {
                        return <StyledDataCell {...commonProps}>{txn?.driverName || 'NA'}</StyledDataCell>;
                      }
                      if (key === 'txnDate') {
                        return <StyledDataCell {...commonProps}>{txn?.txnDate || 'NA'}</StyledDataCell>;
                      }
                      if (key === 'unit') {
                        return (
                          <StyledDataCell {...commonProps}>
                            {txn?.unit
                              ? isNaN(txn.unit)
                                ? txn.unit
                                : parseFloat(txn.unit).toString().replace(/\.0+$/, '')
                              : 'NA'}
                          </StyledDataCell>
                        );
                      }
                      if (key === 'odometer') {
                        return <StyledDataCell {...commonProps}>{txn?.odometer}</StyledDataCell>;
                      }
                      if (key === 'locationName') {
                        return <StyledDataCell {...commonProps}>{txn?.locationName || 'NA'}</StyledDataCell>;
                      }
                      if (key === 'stateProvince') {
                        return <StyledDataCell {...commonProps}>{txn?.stateProvince}</StyledDataCell>;
                      }
                      if (key === 'fees') {
                        return <StyledDataCell {...commonProps}>{txn?.fees}</StyledDataCell>;
                      }
                      if (key === 'item') {
                        return <StyledDataCell {...commonProps}>{txn?.item} </StyledDataCell>;
                      }
                      if (key === 'unitPrice') {
                        return <StyledDataCell {...commonProps}>{txn?.unitPrice}</StyledDataCell>;
                      }
                      if (key === 'qty') {
                        return <StyledDataCell {...commonProps}>{txn?.qty}</StyledDataCell>;
                      }
                      if (key === 'amount') {
                        return <StyledDataCell {...commonProps}>{txn?.amount}</StyledDataCell>;
                      }
                      if (key === 'currency') {
                        return <StyledDataCell {...commonProps}>{txn?.currency}</StyledDataCell>;
                      }
                      return null;
                    })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <StyledDataCell colSpan={columns.length}>
                  <Typography> No Fuel Transactions Found</Typography>
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
        totalRecords={fuelTransInformation?.pageDetails?.totalRecords}
        pageSize={fuelTransInformation?.pageDetails?.pageSize}
        isDefaultList={true}
      />
    </Box>
  );
};

export default FuelTransactionListTable;
