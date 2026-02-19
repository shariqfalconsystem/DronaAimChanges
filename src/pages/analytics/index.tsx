import React, { useEffect, useRef } from 'react';
import { embedDashboard } from "@superset-ui/embedded-sdk";

function Analytics() {
    const dashboardRef = useRef(null);

    useEffect(() => {
        const embed = async () => {
            if (dashboardRef.current) {
                await embedDashboard({
                    // The UUID of your dashboard (Must match the one used to generate the token)
                    id: "f7c5952f-b3ae-467f-9f03-cae394e92437",

                    // Your Superset domain
                    supersetDomain: "http://54.80.204.44:8088",

                    // The DOM element to mount the dashboard into
                    mountPoint: dashboardRef.current,

                    // The Guest Token you generated
                    fetchGuestToken: () => Promise.resolve(
                        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJuYW1lIjoiZ3Vlc3RfdXNlciIsImZpcnN0X25hbWUiOiJHdWVzdCIsImxhc3RfbmFtZSI6IlVzZXIifSwicmVzb3VyY2VzIjpbeyJ0eXBlIjoiZGFzaGJvYXJkIiwiaWQiOiJmN2M1OTUyZi1iM2FlLTQ2N2YtOWYwMy1jYWUzOTRlOTI0MzcifV0sInJsc19ydWxlcyI6W10sImlhdCI6MTc3MTQ3NjI3My43NzYzNTEyLCJleHAiOjIwODY4MzYyNzMuNzc2MzUxMiwiYXVkIjoiaHR0cDovLzAuMC4wLjA6ODA4MC8iLCJ0eXBlIjoiZ3Vlc3QifQ.jXrZnNDmjTSXkxqEDFSQVfJGyMYWsNHvMSD2Qg2xkHY"
                    ),

                    // Dashboard UI Configuration - This hides the edit controls!
                    dashboardUiConfig: {
                        hideTitle: true,
                        hideChartControls: true,
                        hideTab: true,
                        filters: {
                            expanded: false,
                            visible: true
                        }
                    },
                });
            }
        };

        embed();
    }, []);

    return (
        <div className="analytics-container" style={{ height: 'calc(100vh - 64px)', width: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
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
            <div ref={dashboardRef} className="superset-dashboard" style={{ flex: 1, width: '100%', height: '100%' }} />
        </div>
    );
}

export default Analytics;