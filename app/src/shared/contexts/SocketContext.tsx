import React, { useContext, FC } from "react";
import io from "socket.io-client";

const SOCKET_SERVER = process.env.REACT_APP_SOCKET_SERVER || "";
const SocketContext = React.createContext<SocketIOClient.Socket | null>(null);

const useSocket = () => {
    const socket = useContext(SocketContext);
    if (!socket && process.env.NODE_ENV === "development") {
        console.warn("Unable to use 'useSocket' outside of SocketContext.");
    }
    return socket!;
};

const socket = io(SOCKET_SERVER);
const SocketProvider: FC = ({ children }) => {
    return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export { useSocket };
export default SocketProvider;
