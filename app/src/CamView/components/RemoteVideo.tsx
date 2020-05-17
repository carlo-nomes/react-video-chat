import React, { FC, useMemo, useRef, useEffect } from "react";
import styled from "styled-components";

import useUserList from "../hooks/useUserList";

const VideoWrapper = styled.div`
    position: relative;
    background: radial-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.8));

    .nickname {
        position: absolute;
        top: 0;
        right: 0;
        left: 0;

        padding: 1rem;
        text-align: center;

        background: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0));
        color: white;
    }

    .info {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;

        color: whitesmoke;
    }
`;

const Video = styled.video`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

type RemoteVideoProps = { id: string; stream: MediaStream | null };
const RemoteVideo: FC<RemoteVideoProps> = ({ id: remoteId, stream }) => {
    const { otherUsers } = useUserList();
    const remoteNickname = useMemo(() => {
        return otherUsers.find(({ id }) => id === remoteId)?.nickname || "Unkown";
    }, [otherUsers, remoteId]);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
    }, [stream]);

    return (
        <VideoWrapper>
            <div className="nickname">{remoteNickname}</div>
            {!stream?.getVideoTracks() && <div className="info">No video available</div>}
            {stream && <Video ref={videoRef} autoPlay />}
        </VideoWrapper>
    );
};

export default RemoteVideo;
