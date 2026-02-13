import axios from 'axios';
import { embedDashboard } from "@superset-ui/embedded-sdk";
import { useEffect } from 'react';

function Analytics() {


    return (
        <div className="App" style={{ height: '100vh', width: '100%' }}>
            <iframe
                width="100%"
                height="100%"
                seamless
                frameBorder="0"
                scrolling="no"
                src="http://localhost:8088/superset/dashboard/p/L03YNVwYoya/"
            >
            </iframe>
        </div>
    );
}

export default Analytics;
