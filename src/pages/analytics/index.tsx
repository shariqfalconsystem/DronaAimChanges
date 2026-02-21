import React, { useEffect, useRef, useState } from 'react';
import { embedDashboard } from "@superset-ui/embedded-sdk";
import { Box, CircularProgress } from "@mui/material";

const DESKTOP_DASHBOARD_ID = "97363b44-6aec-42ad-b875-e8ab1f7554f6";
const MOBILE_DASHBOARD_ID = "1bcb14e7-c817-4c4b-a9dc-9596615dd6dd";

const MobileToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJuYW1lIjoiZ3Vlc3RfdXNlciIsImZpcnN0X25hbWUiOiJHdWVzdCIsImxhc3RfbmFtZSI6IlVzZXIifSwicmVzb3VyY2VzIjpbeyJ0eXBlIjoiZGFzaGJvYXJkIiwiaWQiOiIxYmNiMTRlNy1jODE3LTRjNGItYTlkYy05NTk2NjE1ZGQ2ZGQifV0sInJsc19ydWxlcyI6W10sImlhdCI6MTc3MTU4MTY3NS4zMjQxNjYzLCJleHAiOjE3NzIxODY0NzUuMzI0MTY2MywiYXVkIjoiaHR0cDovLzAuMC4wLjA6ODA4MC8iLCJ0eXBlIjoiZ3Vlc3QifQ.RXDjpgaV9UG0sQaGD0PguLaz1qtnO6o17qfxAe288-A";

const dekstopToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJuYW1lIjoiZ3Vlc3RfdXNlciIsImZpcnN0X25hbWUiOiJHdWVzdCIsImxhc3RfbmFtZSI6IlVzZXIifSwicmVzb3VyY2VzIjpbeyJ0eXBlIjoiZGFzaGJvYXJkIiwiaWQiOiI5NzM2M2I0NC02YWVjLTQyYWQtYjg3NS1lOGFiMWY3NTU0ZjYifV0sInJsc19ydWxlcyI6W10sImlhdCI6MTc3MTU2MzQ0OC4wMTYzNzg5LCJleHAiOjE3NzIxNjgyNDguMDE2Mzc4OSwiYXVkIjoiaHR0cDovLzAuMC4wLjA6ODA4MC8iLCJ0eXBlIjoiZ3Vlc3QifQ.RVyiPpmricO9FN7zPYXQVeUrbj6QLtqg6JbIQnzCsUE";

function Analytics() {
    const dashboardRef = useRef(null);
    const [loading, setLoading] = useState(true);

    const getDeviceConfig = () => {
        const isMobile = window.innerWidth < 1440;

        return {
            dashboardId: isMobile ? MOBILE_DASHBOARD_ID : DESKTOP_DASHBOARD_ID,
            token: isMobile ? MobileToken : dekstopToken
        };
    };

    const [deviceConfig, setDeviceConfig] = useState(getDeviceConfig());

    // Switch dashboard + token on resize
    useEffect(() => {
        const handleResize = () => {
            const newConfig = getDeviceConfig();

            setDeviceConfig(prev =>
                prev.dashboardId !== newConfig.dashboardId
                    ? newConfig
                    : prev
            );
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Re-embed when dashboard changes
    useEffect(() => {
        if (!dashboardRef.current) return;

        setLoading(true);
        dashboardRef.current.innerHTML = '';

        const embed = async () => {
            await embedDashboard({
                id: deviceConfig.dashboardId,
                supersetDomain: "http://54.80.204.44:8088",
                mountPoint: dashboardRef.current,
                fetchGuestToken: () => Promise.resolve(deviceConfig.token),
                dashboardUiConfig: {
                    hideTitle: true,
                    hideChartControls: false, // allow download
                    hideTabs: true,            // note: should be hideTabs, not hideTab
                    filters: {
                        expanded: true,           // ✅ expand filter panel
                        visible: true             // ✅ render filters
                    },
                },
            });
            setLoading(false);


            const iframe = dashboardRef.current.querySelector("iframe");

            if (iframe) {
                iframe.onload = () => {

                    const iframeDoc =
                        iframe.contentDocument || iframe.contentWindow.document;

                    const style = iframeDoc.createElement("style");
                    style.innerHTML = `
                        /* Hide explore */
                        [data-test="explore-chart"] {
                            display: none !important;
                        }

                        /* Hide fullscreen */
                        [data-test="view-chart-fullscreen"] {
                            display: none !important;
                        }

                        /* Hide share */
                        [data-test="share-chart"] {
                            display: none !important;
                        }

                        /* Hide edit */
                        [data-test="edit-chart"] {
                            display: none !important;
                        }

                        /* Download stays visible */
                    `;
                    iframeDoc.head.appendChild(style);
                };
            }
        };

        embed();
    }, [deviceConfig]);

    return (
        <div
            className="analytics-container"
            style={{
                height: 'calc(100vh - 64px)',
                width: '100%',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#f5f5f5',
                position: 'relative'
            }}
        >
            <style>
                {`
                    .superset-dashboard iframe {
                        width: 100% !important;
                        height: 100% !important;
                        border: none;
                        display: block;
                        background: transparent !important;
                    }
                `}
            </style>

            {/* Material UI Loader */}
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

            <div
                ref={dashboardRef}
                className="superset-dashboard"
                style={{
                    flex: 1,
                    width: '100%',
                    height: '100%',
                    boxSizing: 'border-box'
                }}
            />
        </div>
    );
}

export default Analytics;