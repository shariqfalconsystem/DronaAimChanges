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
import { useNavigate, useSearchParams } from 'react-router-dom';
import Pagination from '../../components/molecules/pagination';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import { StyledDataCell } from '../../components/atoms/table-body-cell';
import { StyledHeadCell } from '../trip-list/table-row-cell';
import ChipWithIcon from '../../components/atoms/chip-with-icon';
import { VehicleStatus } from '../../components/atoms/chip-with-icon';
import { formatScore } from '../../utility/utilities';
import debounce from 'lodash/debounce';
import { paths } from '../../common/constants/routes';
import Edit from '../../assets/icons/edit.png';
import Delete from '../../assets/icons/delete.png';
import Link from '../../assets/icons/link.png';
import VehicleSafetyScoreBox from '../vehicle-details/vehicle-score-box';
import DeleteConfirmationDialog from './delete-confirmation-popup';
import { useSelector } from 'react-redux';
import { normalizeStatus } from '../../utility/utilities';

const VehicleListTable: React.FC<any> = ({
  vehiclesInformation,
  onEditVehicle,
  onLinkVehicle,
  onDeleteVehicle,
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
  const [searchParams, setSearchParams] = useSearchParams();

  const insurerId = useSelector((state: any) => state?.auth?.userData?.currentInsurerId);


  //const insurerId = 'INS9999';

  //const insurerId = 'INS9999';

  useEffect(() => {
    setLocalSearchQueries(searchQueries);
  }, [searchQueries]);

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

  // const columns = [
  //   { label: 'Vehicle ID', key: 'vehicleId' },
  //   { label: 'Vehicle Status', key: 'status' },
  //   { label: 'Vehicle Score', key: 'meanScore' },
  //   { label: 'VIN', key: 'vin' },
  //   { label: 'License plate ', key: 'tagLicencePlateNumber' },
  //   { label: 'Make', key: 'make' },
  //   { label: 'Model', key: 'model' },
  //   { label: 'Year', key: 'year' },
  //   { label: 'Device ID', key: 'deviceId' },
  //   { label: 'Device Provider', key: 'partnerName' },
  //   { label: 'Custom Vehicle ID', key: 'customVehicleId' },
  //   { label: 'IMEI Number', key: 'imeiByDevice' },
  //   { label: 'Actions', key: 'actions' },
  // ];

  const columns = [
    { label: 'Vehicle ID', key: 'vehicleId', hideable: false, minWidth: '120px' },
    { label: 'Vehicle Status', key: 'status', hideable: true, minWidth: '120px' },
    { label: 'Vehicle Score', key: 'meanScore', hideable: true, minWidth: '120px' },
    { label: 'VIN', key: 'vin', hideable: true, minWidth: '150px' },
    { label: 'License plate ', key: 'tagLicencePlateNumber', hideable: true, minWidth: '120px' },
    { label: 'Make', key: 'make', hideable: true, minWidth: '100px' },
    { label: 'Model', key: 'model', hideable: true, minWidth: '100px' },
    { label: 'Year', key: 'year', hideable: true, minWidth: '80px' },
    { label: 'Device ID', key: 'deviceId', hideable: true, minWidth: '120px' },
    { label: 'Device Provider', key: 'partnerName', hideable: true, minWidth: '150px' },
    { label: 'Custom Vehicle ID', key: 'customVehicleId', hideable: true, minWidth: '150px' },
    { label: 'IMEI Number', key: 'imeiByDevice', hideable: true, minWidth: '150px' },
    { label: 'Actions', key: 'actions', hideable: false, minWidth: '110px' },
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
    setVehicleToDelete(vehicle);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (vehicleToDelete) {
      onDeleteVehicle(vehicleToDelete.vehicleId);
    }
    setDeleteConfirmOpen(false);
    setVehicleToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setVehicleToDelete(null);
  };

  console.log('filter criteria : ', filterCriteria);

  const totalPages = Math.ceil(vehiclesInformation?.pageDetails?.totalRecords / 10) || 1;

  useEffect(() => {
    console.log('Vehicles Information:', vehiclesInformation?.vehicles);
  }, [vehiclesInformation]);

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
                .filter((col) => !visibleColumns || visibleColumns[col.key as keyof typeof visibleColumns] !== false)
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
                      backdropFilter: 'blur(50px)',
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
            {vehiclesInformation?.vehicles && vehiclesInformation?.vehicles.length > 0 ? (
              vehiclesInformation?.vehicles.map((vehicle: any) => {
                const formattedVehicleStatus: VehicleStatus = normalizeStatus(vehicle?.vehicleStatus);
                return (
                  <TableRow
                    key={vehicle?.vehicleId}
                    onClick={() => {
                      navigate(`/vehicles-details/${vehicle?.vin}/`, {
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
                    <StyledDataCell
                      width="8%"
                      sx={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 3,
                        whiteSpace: 'nowrap',
                        backdropFilter: applyBackdropFilter ? 'blur(50px)' : 'none',
                        background: applyBackdropFilter ? '#f5f5f5' : 'inherit',
                        boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                        }}
                      >
                        <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
                          {vehicle?.vehicleId || 'NA'}
                        </Typography>
                      </Box>
                    </StyledDataCell>
                    {visibleColumns.status && (
                      <StyledDataCell>
                        <ChipWithIcon status={formattedVehicleStatus} />
                      </StyledDataCell>
                    )}
                    {visibleColumns.meanScore && (
                      <StyledDataCell width={25}>
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
                    )}
                    {visibleColumns.vin && (
                      <StyledDataCell>{vehicle?.vin || 'NA'}</StyledDataCell>
                    )}
                    {visibleColumns.tagLicencePlateNumber && (
                      <StyledDataCell>{vehicle?.tagLicencePlateNumber || 'NA'}</StyledDataCell>
                    )}
                    {visibleColumns.make && <StyledDataCell>{vehicle?.make || 'NA'}</StyledDataCell>}
                    {visibleColumns.model && <StyledDataCell>{vehicle?.model || 'NA'}</StyledDataCell>}
                    {visibleColumns.year && <StyledDataCell>{vehicle?.year || 'NA'}</StyledDataCell>}
                    {visibleColumns.deviceId && (
                      <StyledDataCell>{vehicle?.lookup_devices?.[0]?.deviceId || 'NA'}</StyledDataCell>
                    )}
                    {visibleColumns.partnerName && (
                      <StyledDataCell>{vehicle?.lookup_devices?.[0]?.deviceProvider || 'NA'}</StyledDataCell>
                    )}
                    {visibleColumns.customVehicleId && (
                      <StyledDataCell>{vehicle?.customVehicleId || 'NA'}</StyledDataCell>
                    )}
                    {visibleColumns.imeiByDevice && (
                      <StyledDataCell>{vehicle?.lookup_devices?.[0]?.imei ?? 'NA'}</StyledDataCell>
                    )}
                    <StyledDataCell
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
                        <IconButton onClick={(e: any) => handleLinkClick(e, vehicle)}>
                          <img src={Link} alt="Link" width={20} height={20} />
                        </IconButton>
                        <IconButton onClick={(e: any) => handleEditClick(e, vehicle)}>
                          <img src={Edit} alt="Edit" width={20} height={20} />
                        </IconButton>
                        {isUnInsuredFleet && role === 'fleetManagerSuperUser' && (
                          <IconButton onClick={(e) => handleDeleteClick(e, vehicle)}>
                            <img src={Delete} alt="Delete" width={20} height={20} />
                          </IconButton>
                        )}
                      </Box>
                    </StyledDataCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <StyledDataCell colSpan={
                  columns.filter((col) => visibleColumns[col.key]).length
                } sx={{ textAlign: 'center', padding: '20px' }}>
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
        onPageChange={(page) => {
          setCurrentPage(page);
          setSearchParams({ page: page.toString() });
          onPageChange(page);
        }}
        totalRecords={vehiclesInformation?.pageDetails?.totalRecords}
        pageSize={vehiclesInformation?.pageDetails?.pageSize}
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

export default VehicleListTable;
