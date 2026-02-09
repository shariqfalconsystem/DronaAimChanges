import React, { useCallback, useEffect, useState, useRef } from 'react';
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
import { StyledHeadCell } from '../../trip-list/table-row-cell';
import ChipWithIcon from '../../../components/atoms/chip-with-icon';
import { VehicleStatus } from '../../../components/atoms/chip-with-icon';
import debounce from 'lodash/debounce';
import Edit from '../../../assets/icons/edit.png';
import Delete from '../../../assets/icons/delete.png';
import Link from '../../../assets/icons/link.png';
import VehicleSafetyScoreBox from '../../vehicle-details/vehicle-score-box';
import DeleteConfirmationDialog from './delete-confirmation-popup';
import { useSelector } from 'react-redux';
import { normalizeStatus } from '../../../utility/utilities';

const UnassignedListTable: React.FC<any> = ({
  vehicleInformation,
  onEditVehicle,
  onLinkVehicle,
  onDeleteVehicle,
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
  isUnInsuredFleet,
  role,
  visibleColumns
}) => {
  const navigate = useNavigate();
  const [localSearchQueries, setLocalSearchQueries] = useState<Record<string, any>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement | null>(null);
  const [applyBackdropFilter, setApplyBackdropFilter] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<any>(null);

  const insurerId = useSelector((state: any) => state?.auth?.userData?.currentInsurerId);

  //const insurerId = 'INS9999';

  useEffect(() => {
    setLocalSearchQueries(searchQueries);
  }, [searchQueries]);

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

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    setApplyBackdropFilter(target.scrollLeft > 0);
  };

  const columns = [
    { label: 'Fleet ID', key: 'lonestarId', minWidth: '120px' },
    { label: 'Fleet Name', key: 'name', minWidth: '150px' },
    { label: 'Vehicle ID', key: 'vehicleId', minWidth: '120px' },
    { label: 'Vehicle Status', key: 'status', minWidth: '120px' },
    { label: 'Vehicle Score', key: 'meanScore', minWidth: '120px' },
    { label: 'VIN', key: 'vin', minWidth: '150px' },
    { label: 'License plate ', key: 'tagLicencePlateNumber', minWidth: '120px' },
    { label: 'Make', key: 'make', minWidth: '100px' },
    { label: 'Model', key: 'model', minWidth: '100px' },
    { label: 'Year', key: 'year', minWidth: '80px' },
    { label: 'Device ID', key: 'deviceId', minWidth: '120px' },
    { label: 'Device Provider', key: 'partnerName', minWidth: '150px' },
    { label: 'Custom Vehicle ID', key: 'customVehicleId', minWidth: '150px' },
    { label: 'IMEI Number', key: 'imeiByDevice', minWidth: '150px' },
    { label: 'Actions', key: 'actions', minWidth: '110px' },
  ];

  const handleLinkClick = (e: any, vehicle: any) => {
    e.stopPropagation();
    e.preventDefault();
    onLinkVehicle(vehicle);
  };

  const handleEditClick = (e: any, vehicle: any) => {
    e.stopPropagation();
    e.preventDefault();
    onEditVehicle(vehicle);
  };

  const handleDeleteClick = (e: React.MouseEvent, vehicle: any) => {
    e.stopPropagation();
    e.preventDefault();
    setVehicleToDelete({
      ...vehicle,
      lonestarId: vehicle?.lookup_fleetcompanies?.[0]?.lonestarId || null,
    });
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (vehicleToDelete) {
      onDeleteVehicle(vehicleToDelete.vehicleId, vehicleToDelete.lonestarId);
    }
    setDeleteConfirmOpen(false);
    setVehicleToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setVehicleToDelete(null);
  };

  const totalPages = Math.ceil(vehicleInformation?.pageDetails?.totalRecords / 10) || 1;

  useEffect(() => {
    console.log('Vehicles Information2:', vehicleInformation?.vehicles);
  }, [vehicleInformation]);

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
        <Table
          ref={tableRef}
          sx={{
            minWidth: '100%',
          }}
        >
          <TableHead>
            <TableRow>
              {columns
                .filter((col) => (!visibleColumns || visibleColumns[col.key] !== false))
                .map(({ label, key, minWidth }, index, filteredArray) => (
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
                      whiteSpace: 'nowrap',
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
                        onClick={() => {
                          key !== 'startLocation' && key !== 'endLocation';
                        }}
                        component={'span'}
                      >
                        {label}
                        <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                          {key !== 'startLocation' && key !== 'endLocation' && key != 'actions' && (
                            <>
                              <TbTriangleFilled
                                size={8}
                                color={
                                  sortColumn === key && sortDirection === (key === 'tripStatus' ? 'DESC' : 'ASC')
                                    ? '#000'
                                    : 'rgba(0,0,0,0.5)'
                                }
                                onClick={() => handleSort(key, key === 'tripStatus' ? 'DESC' : 'ASC')}
                              />
                              <TbTriangleInvertedFilled
                                size={8}
                                color={
                                  sortColumn === key && sortDirection === (key === 'tripStatus' ? 'ASC' : 'DESC')
                                    ? '#000'
                                    : 'rgba(0,0,0,0.5)'
                                }
                                onClick={() => handleSort(key, key === 'tripStatus' ? 'ASC' : 'DESC')}
                              />
                            </>
                          )}
                        </Box>
                      </Typography>
                      {key !== 'actions' && (
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
            {vehicleInformation?.vehicles && vehicleInformation?.vehicles.length > 0 ? (
              vehicleInformation?.vehicles.map((vehicle: any) => {
                const formattedVehicleStatus: VehicleStatus = normalizeStatus(vehicle?.vehicleStatus);
                return (
                  <TableRow
                    key={vehicle?.vehicleId}
                    onClick={() => {
                      navigate(`/admin/vehicles-details/${vehicle?.vin}/`, {
                        state: vehicle,
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
                            position: index === 0 || index === columns.filter((col) => !visibleColumns || visibleColumns[col.key] !== false).length - 1 ? 'sticky' : 'static',
                            left: index === 0 ? 0 : 'auto',
                            right: index === columns.filter((col) => !visibleColumns || visibleColumns[col.key] !== false).length - 1 ? 0 : 'auto',
                            zIndex: index === 0 || index === columns.filter((col) => !visibleColumns || visibleColumns[col.key] !== false).length - 1 ? 2 : 'auto',
                            backdropFilter: applyBackdropFilter ? 'blur(50px)' : 'none',
                            background: index === 0 || index === columns.filter((col) => !visibleColumns || visibleColumns[col.key] !== false).length - 1 ? (applyBackdropFilter ? '#f5f5f5' : '#fff') : 'inherit',
                            boxShadow:
                              index === 0
                                ? '2px 0 5px rgba(0,0,0,0.1)'
                                : index === columns.filter((col) => !visibleColumns || visibleColumns[col.key] !== false).length - 1
                                  ? '-2px 0 5px rgba(0,0,0,0.1)'
                                  : 'none',
                          },
                        };

                        if (key === 'lonestarId') {
                          return (
                            <StyledDataCell {...commonProps}>
                              {vehicle?.lookup_fleetcompanies?.[0]?.lonestarId || 'NA'}
                            </StyledDataCell>
                          );
                        }
                        if (key === 'name') {
                          return (
                            <StyledDataCell {...commonProps}>
                              {vehicle?.lookup_fleetcompanies?.[0]?.name || 'NA'}
                            </StyledDataCell>
                          );
                        }
                        if (key === 'vehicleId') {
                          return <StyledDataCell {...commonProps}>{vehicle?.vehicleId || 'NA'}</StyledDataCell>;
                        }
                        if (key === 'status') {
                          return (
                            <StyledDataCell {...commonProps}>
                              <ChipWithIcon status={formattedVehicleStatus} />
                            </StyledDataCell>
                          );
                        }
                        if (key === 'meanScore') {
                          return (
                            <StyledDataCell {...commonProps}>
                              <VehicleSafetyScoreBox
                                score={vehicle?.meanScore?.toFixed(1) || 0}
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
                        if (key === 'vin') {
                          return <StyledDataCell {...commonProps}>{vehicle?.vin || 'NA'}</StyledDataCell>;
                        }
                        if (key === 'tagLicencePlateNumber') {
                          return <StyledDataCell {...commonProps}>{vehicle?.tagLicencePlateNumber || 'NA'}</StyledDataCell>;
                        }
                        if (key === 'make') {
                          return <StyledDataCell {...commonProps}>{vehicle?.make || 'NA'}</StyledDataCell>;
                        }
                        if (key === 'model') {
                          return <StyledDataCell {...commonProps}>{vehicle?.model || 'NA'}</StyledDataCell>;
                        }
                        if (key === 'year') {
                          return <StyledDataCell {...commonProps}>{vehicle?.year || 'NA'}</StyledDataCell>;
                        }
                        if (key === 'deviceId') {
                          return (
                            <StyledDataCell {...commonProps}>
                              {vehicle?.lookup_devices?.[0]?.deviceId || 'NA'}
                            </StyledDataCell>
                          );
                        }
                        if (key === 'partnerName') {
                          return (
                            <StyledDataCell {...commonProps}>
                              {vehicle?.lookup_devices?.[0]?.deviceProvider || 'NA'}
                            </StyledDataCell>
                          );
                        }
                        if (key === 'customVehicleId') {
                          return <StyledDataCell {...commonProps}>{vehicle?.customVehicleId || 'NA'}</StyledDataCell>;
                        }
                        if (key === 'imeiByDevice') {
                          return (
                            <StyledDataCell {...commonProps}>
                              {vehicle?.lookup_devices?.[0]?.imei ?? 'NA'}
                            </StyledDataCell>
                          );
                        }
                        if (key === 'actions') {
                          return (
                            <StyledDataCell
                              {...commonProps}
                              sx={{
                                ...commonProps.sx,
                                padding: '10px',
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <IconButton onClick={(e: any) => handleLinkClick(e, vehicle)}>
                                  <img src={Link} alt="Link" width={20} height={20} />
                                </IconButton>
                                <IconButton onClick={(e: any) => handleEditClick(e, vehicle)}>
                                  <img src={Edit} alt="Edit" width={20} height={20} />
                                </IconButton>
                                <IconButton onClick={(e) => handleDeleteClick(e, vehicle)}>
                                  <img src={Delete} alt="Delete" width={20} height={20} />
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
                <StyledDataCell colSpan={columns.length} sx={{ textAlign: 'center', padding: '20px' }}>
                  <Typography variant="body1">No Vehicles Found</Typography>
                </StyledDataCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages || 0}
        onPageChange={onPageChange}
        totalRecords={vehicleInformation?.pageDetails?.totalRecords}
        pageSize={vehicleInformation?.pageDetails?.pageSize}
        isDefaultList={true}
      />
      {vehicleToDelete && (
        <DeleteConfirmationDialog
          open={deleteConfirmOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          //driverName={vehicleToDelete.formattedDriverName}
          vehicleId={vehicleToDelete.vehicleId}
        />
      )}
    </Box>
  );
};

export default UnassignedListTable;
