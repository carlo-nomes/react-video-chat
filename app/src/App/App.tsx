import React from "react";

import "normalize.css";
import "@fortawesome/fontawesome-free/js/all.js";

import CamView from "../CamView";
import SocketProvider from "../shared/contexts/SocketContext";

function App() {
    return (
        <SocketProvider>
            <CamView />
        </SocketProvider>
    );
}

export default App;
