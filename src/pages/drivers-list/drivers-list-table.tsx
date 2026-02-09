import React, { useCallback, useEffect, useState } from 'react';
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
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import Pagination from '../../components/molecules/pagination';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import useTableFilter from '../../common/hooks/useTableFilterDriver';
import { StyledDataCell } from '../../components/atoms/table-body-cell';
import { StyledHeadCell } from '../trip-list/table-row-cell';
import { formatScore } from '../../utility/utilities';
import VehicleSafetyScoreBox from '../vehicle-details/vehicle-score-box';
import { RiCloseCircleLine } from '@remixicon/react';
import DeleteConfirmationDialog from './delete-confirmation-popup';
import debounce from 'lodash/debounce';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { paths } from '../../common/constants/routes';
import Link from '../../assets/icons/link.png';
import Edit from '../../assets/icons/edit.png';
import { useSelector } from 'react-redux';

const DriversListTable: React.FC<any> = ({
  driversInformation,
  onEditDriver,
  onLinkDriver,
  onDeleteDriver,
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
}) => {
  const navigate = useNavigate();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<any>(null);
  const [localSearchQueries, setLocalSearchQueries] = useState<Record<string, any>>({});
  const role = useSelector((state: any) => state.auth.currentUserRole);
  const lonestarIdCurrent = useSelector((state: any) => state?.auth?.userData?.currentLonestarId);
  const [searchParams, setSearchParams] = useSearchParams();
  const [applyBackdropFilter, setApplyBackdropFilter] = useState(false);

  useEffect(() => {
    setLocalSearchQueries(searchQueries);
  }, [searchQueries]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    setApplyBackdropFilter(target.scrollLeft > 0);
  };

  const handleDeleteClick = (e: React.MouseEvent, driver: any) => {
    e.stopPropagation();
    e.preventDefault();
    setDriverToDelete(driver);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (driverToDelete) {
      onDeleteDriver(driverToDelete);
    }
    setDeleteConfirmOpen(false);
    setDriverToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDriverToDelete(null);
  };

  const columns = [
    { label: 'Driver ID', key: 'userId', minWidth: '120px', hideable: false },
    { label: 'Driver Name', key: 'driverName', minWidth: '150px', hideable: true },
    { label: 'Driver Score', key: 'meanScore', minWidth: '120px', hideable: true },
    { label: 'Phone', key: 'phone', minWidth: '130px', hideable: true },
    { label: 'Email', key: 'emailId', minWidth: '180px', hideable: true },
    { label: 'Vehicle ID', key: 'vehicleId', minWidth: '120px', hideable: true },
    { label: 'Events Count', key: 'incidentCount', minWidth: '120px', hideable: true },
    { label: 'Actions', key: 'actions', minWidth: '100px', hideable: false },
  ];

  const totalPages =
    Math.ceil(driversInformation?.pageDetails?.totalRecords / driversInformation?.pageDetails?.pageSize) || 1;

  const handleLinkClick = (e: any, driver: any) => {
    e.stopPropagation();
    e.preventDefault();
    onLinkDriver(driver);
  };

  const handleEditClick = (e: any, driver: any) => {
    e.stopPropagation();
    e.preventDefault();
    onEditDriver(driver);
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

    if (value === '') {
      delete newQueries[column];
    }
    setLocalSearchQueries(newQueries);
    debouncedSearch(newQueries);
  };

  const getTextColor = (incidentCount: number) => {
    if (incidentCount >= 90) return '#1C7C44';
    if (incidentCount >= 80) return '#FF9800';
    return '#D24537';
  };

  return (
    <>
      <TableContainer
        component={Paper}
        style={{ boxShadow: 'none' }}
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
        <Table>
          <TableHead>
            <TableRow>
              {columns
                .filter((col) => !visibleColumns || visibleColumns[col.key] !== false)
                .map(({ label, key, minWidth }: any, index, filteredArray) => (
                  <StyledHeadCell
                    key={key}
                    sx={{
                      width: minWidth,
                      minWidth: minWidth,
                      position: index === 0 || index === filteredArray.length - 1 ? 'sticky' : 'static',
                      left: index === 0 ? 0 : 'auto',
                      right: index === filteredArray.length - 1 ? 0 : 'auto',
                      zIndex: index === 0 || index === filteredArray.length - 1 ? 2 : 'auto',
                      backdropFilter: applyBackdropFilter ? 'blur(50px)' : 'none',
                      background: index === 0 || index === filteredArray.length - 1 ? '#EDF0F5' : 'inherit',
                      boxShadow:
                        index === 0
                          ? '2px 0 5px rgba(0,0,0,0.1)'
                          : index === filteredArray.length - 1
                            ? '-2px 0 5px rgba(0,0,0,0.1)'
                            : 'none',
                    }}
                  >
                    <Box>
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
                        onClick={() => { }}
                        component={'span'}
                      >
                        {label}
                        <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                          {key !== 'actions' && (
                            <>
                              <TbTriangleFilled
                                size={8}
                                color={sortColumn === key && sortDirection === 'ASC' ? '#000' : 'rgba(0,0,0,0.5)'}
                                onClick={() => handleSort(key, 'ASC')}
                              />
                              <TbTriangleInvertedFilled
                                size={8}
                                color={sortColumn === key && sortDirection === 'DESC' ? '#000' : 'rgba(0,0,0,0.5)'}
                                onClick={() => handleSort(key, 'DESC')}
                              />
                            </>
                          )}
                        </Box>
                      </Typography>
                      {key === 'actions' ? (
                        <></>
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
            {driversInformation?.users && driversInformation?.users?.length > 0 ? (
              driversInformation?.users?.map((drivers: any) => (
                <TableRow
                  key={drivers?.userId}
                  onClick={() => {
                    navigate(`${paths.DRIVERSDETAILS}/${drivers?.userId}/`, {
                      state: drivers,
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
                          background: index === 0 || index === filteredArray.length - 1 ? (applyBackdropFilter ? '#f5f5f5' : '#fff') : 'inherit',
                          boxShadow:
                            index === 0
                              ? '2px 0 5px rgba(0,0,0,0.1)'
                              : index === filteredArray.length - 1
                                ? '-2px 0 5px rgba(0,0,0,0.1)'
                                : 'none',
                        },
                      };

                      if (key === 'userId') {
                        return (
                          <StyledDataCell {...commonProps}>
                            <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
                              {drivers?.userId || 'NA'}
                            </Typography>
                          </StyledDataCell>
                        );
                      }
                      if (key === 'driverName') {
                        return (
                          <StyledDataCell {...commonProps}>
                            {drivers.firstName || drivers.lastName
                              ? `${drivers.firstName || 'NA'}  ${drivers.lastName || 'NA'}`
                              : 'NA'}
                          </StyledDataCell>
                        );
                      }
                      if (key === 'meanScore') {
                        return (
                          <StyledDataCell {...commonProps}>
                            <VehicleSafetyScoreBox
                              score={formatScore(drivers?.roleAndScoreMapping?.meanScore)}
                              label=""
                              width={100}
                              height={35}
                              imageHeight={15}
                              textSize="0.85rem"
                              textColored={true}
                            />
                          </StyledDataCell>
                        );
                      }
                      if (key === 'phone') {
                        return (
                          <StyledDataCell {...commonProps}>
                            {drivers.primaryPhone ? `${drivers.primaryPhoneCtryCd} ${drivers.primaryPhone}` : 'NA'}
                          </StyledDataCell>
                        );
                      }
                      if (key === 'emailId') {
                        return <StyledDataCell {...commonProps}>{drivers?.emailId || 'NA'}</StyledDataCell>;
                      }
                      if (key === 'vehicleId') {
                        return (
                          <StyledDataCell {...commonProps}>
                            {drivers?.roleAndScoreMapping?.vehicleId || 'NA'}
                          </StyledDataCell>
                        );
                      }
                      if (key === 'incidentCount') {
                        return (
                          <StyledDataCell {...commonProps}>
                            <Typography
                              variant="h6"
                              lineHeight={0.5}
                              fontSize="0.85rem"
                              color={getTextColor(drivers?.roleAndScoreMapping?.meanScore)}
                            >
                              {drivers?.roleAndScoreMapping?.totalIncidentCount ?? 'NA'}
                            </Typography>
                          </StyledDataCell>
                        );
                      }
                      if (key === 'actions') {
                        return (
                          <StyledDataCell {...commonProps}>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              {role === 'fleetManagerSuperUser' && (
                                <IconButton onClick={(e: any) => handleLinkClick(e, drivers)}>
                                  <img src={Link} alt="Link" width={18} height={18} />
                                </IconButton>
                              )}
                              <IconButton onClick={(e) => handleEditClick(e, drivers)}>
                                <img src={Edit} alt="Edit" width={18} height={18} />
                              </IconButton>
                              <IconButton onClick={(e) => handleDeleteClick(e, drivers)}>
                                <RiCloseCircleLine color="#D24537" size={20} />
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
                  <Typography variant="body1"> No Drivers Found</Typography>
                </StyledDataCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages || 0}
          onPageChange={(page) => {
            setCurrentPage(page);
            setSearchParams({ page: page.toString() });
            onPageChange(page);
          }}
          totalRecords={driversInformation?.pageDetails?.totalRecords}
          pageSize={driversInformation?.pageDetails?.pageSize}
          isDefaultList={true}
        />
      </TableContainer>
      {driverToDelete && (
        <DeleteConfirmationDialog
          open={deleteConfirmOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          driverName={driverToDelete.formattedDriverName}
          driverId={driverToDelete.userId}
        />
      )}
    </>
  );
};

export default DriversListTable;
