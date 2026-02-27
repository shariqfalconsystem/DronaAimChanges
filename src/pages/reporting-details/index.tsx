import { useEffect, useState, useCallback, useRef } from 'react';
import { embedDashboard } from "@superset-ui/embedded-sdk";
import { models } from 'powerbi-client';
import { PowerBIEmbed } from 'powerbi-client-react';
import { Box, Button, CircularProgress, Container, Grid, IconButton, Tooltip } from '@mui/material';
import './powerbidemo.css';
import { toast } from 'react-toastify';
import { IoArrowBack } from 'react-icons/io5';
import { RiFileDownloadLine, RiRefreshLine } from '@remixicon/react';
import { useSelector } from 'react-redux';
import LoadingScreen from '../../components/molecules/loading-screen';
import { exportPowerBIReportToPdf, getReportTokenV3 } from '../../services/fleetManager/reportService';

const VEHICLES_DASHBOARD_ID = "2ad2b087-6275-4b37-896c-9a4f2d2cfa9a";
const VEHICLES_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJuYW1lIjoiZ3Vlc3RfdXNlciIsImZpcnN0X25hbWUiOiJHdWVzdCIsImxhc3RfbmFtZSI6IlVzZXIifSwicmVzb3VyY2VzIjpbeyJ0eXBlIjoiZGFzaGJvYXJkIiwiaWQiOiIyYWQyYjA4Ny02Mjc1LTRiMzctODk2Yy05YTRmMmQyY2ZhOWEifV0sInJsc19ydWxlcyI6W10sImlhdCI6MTc3MjAxMjI3MS4wMTE0MzM0LCJleHAiOjE3NzI2MTcwNzEuMDExNDMzNCwiYXVkIjoiaHR0cDovLzAuMC4wLjA6ODA4MC8iLCJ0eXBlIjoiZ3Vlc3QifQ.K158zElm2R9aSFgf7hFGCDH51OtUVD1CxsiIUanqw7E";

const DEVICES_DASHBOARD_ID = "d4177456-683a-42d1-b100-30aa1f72482a";
const DEVICES_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJuYW1lIjoiZ3Vlc3RfdXNlciIsImZpcnN0X25hbWUiOiJHdWVzdCIsImxhc3RfbmFtZSI6IlVzZXIifSwicmVzb3VyY2VzIjpbeyJ0eXBlIjoiZGFzaGJvYXJkIiwiaWQiOiJkNDE3NzQ1Ni02ODNhLTQyZDEtYjEwMC0zMGFhMWY3MjQ4MmEifV0sInJsc19ydWxlcyI6W10sImlhdCI6MTc3MjAxMzgyMi4yODUxOTc3LCJleHAiOjE3NzI2MTg2MjIuMjg1MTk3NywiYXVkIjoiaHR0cDovLzAuMC4wLjA6ODA4MC8iLCJ0eXBlIjoiZ3Vlc3QifQ.FdZBDx0BVD6VeH7FJjKr6MS83etKf5jToNQ5i0gYGeA"

const ONGOING_TRIPS_DASHBOARD_ID = "3ac40e22-c140-4131-8d2b-a6a26de2c2de";
const ONGOING_TRIPS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJuYW1lIjoiZ3Vlc3RfdXNlciIsImZpcnN0X25hbWUiOiJHdWVzdCIsImxhc3RfbmFtZSI6IlVzZXIifSwicmVzb3VyY2VzIjpbeyJ0eXBlIjoiZGFzaGJvYXJkIiwiaWQiOiIzYWM0MGUyMi1jMTQwLTQxMzEtOGQyYi1hNmEyNmRlMmMyZGUifV0sInJsc19ydWxlcyI6W10sImlhdCI6MTc3MjAxNTUzMC4zNTc2MjE3LCJleHAiOjE3NzI2MjAzMzAuMzU3NjIxNywiYXVkIjoiaHR0cDovLzAuMC4wLjA6ODA4MC8iLCJ0eXBlIjoiZ3Vlc3QifQ.zBdeVCEn_DU12HfW0FSIntaSHmqrDpFHeMwygjndVKI";

const INCOMPLETE_TRIPS_DASHBOARD_ID = "1326c4d9-f9ee-4f10-9c63-67336d4c7b36";
const INCOMPLETE_TRIPS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJuYW1lIjoiZ3Vlc3RfdXNlciIsImZpcnN0X25hbWUiOiJHdWVzdCIsImxhc3RfbmFtZSI6IlVzZXIifSwicmVzb3VyY2VzIjpbeyJ0eXBlIjoiZGFzaGJvYXJkIiwiaWQiOiIxMzI2YzRkOS1mOWVlLTRmMTAtOWM2My02NzMzNmQ0YzdiMzYifV0sInJsc19ydWxlcyI6W10sImlhdCI6MTc3MjAxNTY2OC42NjQ1MjM2LCJleHAiOjE3NzI2MjA0NjguNjY0NTIzNiwiYXVkIjoiaHR0cDovLzAuMC4wLjA6ODA4MC8iLCJ0eXBlIjoiZ3Vlc3QifQ.zhntVVIsQjH1oUd9fwx2QZhRDsTc38ewQiF6T_Bun5U";

const ReportDetails = ({ reportId, report, onBack, groupId, isCustomReport }: any) => {
  const supersetRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<string>('');
  const [reportConfig, setReportConfig] = useState<any>({
    type: 'report',
    embedUrl: undefined,
    accessToken: undefined,
    id: undefined,
    tokenType: models.TokenType.Embed,
    permissions: models.Permissions.All,
    viewMode: isCustomReport ? models.ViewMode.Edit : models.ViewMode.View,
    settings: {
      panes: {
        filters: { expanded: true, visible: true },
      },
      background: models.BackgroundType.Default,
    },
  });
  const [datasetId, setDatasetId] = useState<string>('');

  const userId: any = useSelector((state: any) => state.auth.currentUserId);
  // Get user information from Redux or environment
  const userEmail = useSelector((state: any) => state.auth.userData?.emailId);
  const userRoles = useSelector((state: any) => state.auth.userData?.role);

  const currentUserRole: any = useSelector((state: any) => state?.auth?.currentUserRole);
  const lonestarId: any = useSelector((state: any) => state?.auth?.userData?.selectedRole?.lonestarId);
  const insurerId: any = useSelector((state: any) => state.auth?.userData?.selectedRole?.insurerId);

  const isUnassignedVehicles = report.name === 'Unassigned Vehicles';
  const isUnassignedDevices = report.name === 'Unassigned Devices';
  const isOngoingTrips = report.name === 'Ongoing Trips';
  const isIncompleteTrips = report.name === 'Incomplete Trips';
  const isSupersetReport = isUnassignedVehicles || isUnassignedDevices || isOngoingTrips || isIncompleteTrips;

  const fetchReportDetails = useCallback(async () => {
    if (isSupersetReport) return;
    setLoading(true);
    try {
      const response = await getReportTokenV3(userId, currentUserRole, insurerId, lonestarId, groupId, reportId);

      const embedUrl = response?.data?.EmbeddedUrl;
      const embedToken = response?.data?.EmbedToken;
      const datasetId = response?.data?.DatasetId;

      setDatasetId(datasetId);
      setReportConfig((prevConfig: any) => ({
        ...prevConfig,
        embedUrl,
        accessToken: embedToken,
        id: reportId,
      }));
    } catch (error) {
      console.error('Error fetching report details:', error);
      toast.error('Failed to fetch report details.');
    } finally {
      setLoading(false);
    }
  }, [userId, groupId, reportId]);

  useEffect(() => {
    if (!isSupersetReport) {
      fetchReportDetails();
    }
  }, [fetchReportDetails, isSupersetReport]);

  useEffect(() => {
    if (!isSupersetReport || !supersetRef.current) return;

    const embed = async () => {
      setLoading(true);
      supersetRef.current!.innerHTML = '';
      try {
        const dashboardId = isUnassignedVehicles
          ? VEHICLES_DASHBOARD_ID
          : isUnassignedDevices
            ? DEVICES_DASHBOARD_ID
            : isOngoingTrips
              ? ONGOING_TRIPS_DASHBOARD_ID
              : INCOMPLETE_TRIPS_DASHBOARD_ID;
        const token = isUnassignedVehicles
          ? VEHICLES_TOKEN
          : isUnassignedDevices
            ? DEVICES_TOKEN
            : isOngoingTrips
              ? ONGOING_TRIPS_TOKEN
              : INCOMPLETE_TRIPS_TOKEN;

        await embedDashboard({
          id: dashboardId,
          supersetDomain: "http://54.80.204.44:8088",
          mountPoint: supersetRef.current!,
          fetchGuestToken: () => Promise.resolve(token),
          dashboardUiConfig: {
            hideTitle: true,
            hideChartControls: false,
            hideTabs: true,            // note: should be hideTabs, not hideTab
            filters: {
              expanded: true,
              visible: true
            },
          },
        });

        const iframe = supersetRef.current!.querySelector("iframe");
        if (iframe) {
          iframe.onload = () => {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
              const style = iframeDoc.createElement("style");
              style.innerHTML = `
                [data-test="explore-chart"] { display: none !important; }
                [data-test="view-chart-fullscreen"] { display: none !important; }
                [data-test="share-chart"] { display: none !important; }
                [data-test="edit-chart"] { display: none !important; }
              `;
              iframeDoc.head.appendChild(style);
            }
          };
        }
      } catch (error) {
        console.error('Error embedding Superset dashboard:', error);
        toast.error('Failed to load Superset dashboard.');
      } finally {
        setLoading(false);
      }
    };

    embed();
  }, [isSupersetReport, isUnassignedVehicles, isUnassignedDevices, isOngoingTrips, isIncompleteTrips]);

  const handleExportToPdf = async () => {
    // Check if exportReports exists and has reports
    if (report.exportReports && report.exportReports.length > 0) {
      setExporting(true);
      toast.info(`Preparing reports for download. ${report.exportReports.length} report(s) will be exported shortly!`);

      try {
        // Export all reports sequentially
        for (let i = 0; i < report.exportReports.length; i++) {
          const exportReport = report.exportReports[i];
          const currentReportId = exportReport.reportId;
          const currentDatasetId = exportReport.datasetId;
          const isPaginated = exportReport.isPaginated || false; // Get isPaginated flag if present

          if (!currentReportId || !currentDatasetId) {
            console.error(`Missing reportId or datasetId for export report ${i}`);
            continue;
          }

          // Update export progress
          setExportProgress(`Exporting report ${i + 1} of ${report.exportReports.length}...`);

          // Get the PDF blob - pass isPaginated flag to the export function
          const pdfBlob = await exportPowerBIReportToPdf(
            userId,
            groupId,
            currentReportId,
            currentDatasetId,
            userEmail,
            userRoles,
            isPaginated,
            insurerId,
            lonestarId,
            currentUserRole
          );

          // Create a meaningful filename
          const reportName = report.name || 'Report';
          const fileName = report.exportReports.length > 1 ? `${reportName}_Part${i + 1}.pdf` : `${reportName}.pdf`;

          const url = window.URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;

          document.body.appendChild(link);
          link.click();

          // Clean up
          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          }, 100);

          if (i < report.exportReports.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }

        toast.success(`Successfully exported ${report.exportReports.length} report(s)!`);
      } catch (error: any) {
        console.error('Error exporting reports:', error);
        toast.error(`Failed to export reports: ${error.message || 'Unknown error'}`);
      } finally {
        setExporting(false);
        setExportProgress('');
      }
    } else {
      if (!datasetId) {
        toast.error('Dataset ID is missing. Cannot export to PDF.');
        return;
      }

      setExporting(true);
      toast.info('Preparing report for download. This may take a moment...');

      try {
        const pdfBlob = await exportPowerBIReportToPdf(
          userId,
          groupId,
          reportId,
          datasetId,
          userEmail,
          userRoles,
          false
        );

        // Create a download link for the PDF
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${report.name || 'Report'}.pdf`;

        // Trigger download
        document.body.appendChild(link);
        link.click();

        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);

        toast.success('Report downloaded successfully!');
      } catch (error: any) {
        console.error('Error exporting report:', error);
        toast.error(`Failed to export report: ${error.message || 'Unknown error'}`);
      } finally {
        setExporting(false);
      }
    }
  };

  return (
    <>
      <Box
        mb={2}
        sx={{
          boxShadow: '0px 4px 4px 0px #00000040',
          bgcolor: '#fff',
          py: 2,
          px: 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid
            item
            display="flex"
            alignItems="center"
            sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
          >
            <Box>
              <IconButton onClick={onBack}>
                <IoArrowBack />
              </IconButton>
              {report.name || 'NA'}
              <Tooltip title="Refresh report">
                <IconButton size="small" sx={{ padding: '4px' }} onClick={fetchReportDetails} disabled={loading}>
                  <RiRefreshLine />
                </IconButton>
              </Tooltip>
            </Box>
            <Box>
              <Tooltip title="Export to PDF">
                <span>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={exporting ? <CircularProgress size={16} color="inherit" /> : <RiFileDownloadLine />}
                    onClick={handleExportToPdf}
                    disabled={loading || exporting || (!datasetId && !(report.exportReports?.length > 0))}
                  >
                    {exporting ? exportProgress || 'Exporting...' : 'Export to PDF'}
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Container maxWidth={false} sx={{ display: 'flex', flexDirection: 'column', height: isSupersetReport ? 'calc(100vh - 160px)' : 'auto' }}>
        {isSupersetReport && (
          <style>
            {`
              .superset-container iframe {
                width: 100% !important;
                height: 100% !important;
                border: none;
                display: block;
                background: transparent !important;
              }
            `}
          </style>
        )}
        <Box sx={{ flexGrow: 1, minHeight: isSupersetReport ? '100%' : 'calc(100vh - 160px)', position: 'relative' }}>
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10
              }}
            >
              <CircularProgress size={60} thickness={4} />
            </Box>
          )}

          {isSupersetReport ? (
            <div
              ref={supersetRef}
              className="superset-container"
              style={{
                width: '100%',
                height: '100%',
                boxSizing: 'border-box'
              }}
            />
          ) : (
            <>
              {reportConfig.embedUrl && reportConfig.accessToken ? (
                <PowerBIEmbed embedConfig={reportConfig} cssClassName="power-bi-report-class" />
              ) : (
                !loading && <LoadingScreen />
              )}
            </>
          )}
        </Box>
      </Container>
    </>
  );
};

export default ReportDetails;
