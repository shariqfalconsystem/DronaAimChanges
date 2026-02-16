import axios from 'axios';
import { embedDashboard } from "@superset-ui/embedded-sdk";
import { useEffect } from 'react';

function Analytics() {


    return (
        <div className="App" style={{ height: 'calc(100vh - 64px)', width: '100%', overflow: 'hidden' }}>
            <iframe
                width="100%"
                height="100%"
                seamless
                frameBorder="0"
                scrolling="auto"
                src="http://localhost:8088/superset/dashboard/p/0GzpAVexdgo/?standalone=true"
            >
            </iframe>
        </div>
    );
}

export default Analytics;
