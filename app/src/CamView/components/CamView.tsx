import React, { FC, useState, useRef, useEffect, useMemo } from "react";
import styled from "styled-components";

import Button from "../../shared/components/Button";
import ErrorMessage from "../../shared/components/ErrorMessage";
import FilledGrid from "../../shared/components/FilledGrid";

import useUserVideo from "../hooks/useUserVideo";
import usePeerConnection from "../hooks/usePeerConnection";

import UserList from "./UserList";
import SelfieView from "./SelfieView";

const ButtonWrapper = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 20px;
    z-index: 100;

    display: flex;
    align-items: center;
    justify-content: space-around;
`;

const Video = styled.video`
    object-fit: cover;
`;

type RemoteVideoProps = { stream: MediaStream | null };
const RemoteVideo: FC<RemoteVideoProps> = ({ stream }) => {
    const [active, setActive] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        setActive(!!stream && stream.getVideoTracks().length > 0);

        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
    }, [stream]);

    return <Video ref={videoRef} autoPlay />;
};

type Props = {};
const CamView: FC<Props> = () => {
    const { error, videoToggleProps, isVideoEnabled, stream: localStream } = useUserVideo({ autoStart: true });

    const { call, setLocalStream, remoteStream } = usePeerConnection();

    // TODO handle multiple streams in usePeerConnections hook
    const remoteStreams = useMemo(() => {
        if (!remoteStream) return [];
        return [remoteStream];
    }, [remoteStream]);

    useEffect(() => {
        setLocalStream(localStream);
    }, [localStream, setLocalStream]);

    const { gridColumns, gridRows } = useMemo(
        () => ({
            gridColumns: Math.round(Math.sqrt(remoteStreams.length)),
            gridRows: Math.ceil(Math.sqrt(remoteStreams.length)),
        }),
        [remoteStreams.length]
    );

    return (
        <>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <SelfieView stream={localStream} mini={!!remoteStreams.length} />
            <FilledGrid columns={gridColumns} rows={gridRows}>
                {remoteStreams.map((stream, index) => (
                    <RemoteVideo key={index} stream={stream} />
                ))}
            </FilledGrid>
            <UserList onSelectUser={(id: string) => call(id)} />
            <ButtonWrapper>
                <Button {...videoToggleProps} style={{ color: isVideoEnabled ? "blue" : "red" }}>
                    <i className="fas fa-video" />
                </Button>
            </ButtonWrapper>
        </>
    );
};

export default CamView;
