import { useMemo, useEffect, useState } from "react";

import { User } from "../../Types/User";
import { useSocket } from "../../shared/contexts/SocketContext";

const useUserList = () => {
    const socket = useSocket();
    const [activeUsers, setActiveUsers] = useState<User[]>([]);

    const me = useMemo(() => activeUsers.find(({ id }) => id === socket.id), [activeUsers, socket.id]);
    const otherUsers = useMemo(() => activeUsers.filter(({ id }) => id !== socket.id), [activeUsers, socket.id]);

    useEffect(() => {
        socket.emit("get active users");
        socket.on("active users", setActiveUsers);
    }, [socket]);

    return { me, otherUsers };
};

export default useUserList;
