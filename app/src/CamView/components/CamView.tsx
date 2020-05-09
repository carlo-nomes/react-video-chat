import React, { FC, useState, useRef, useEffect } from "react";
import styled from "styled-components";

import Button from "../../shared/components/Button";
import ErrorMessage from "../../shared/components/ErrorMessage";
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

const VideosWrapper = styled.div`
    position: absolute;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
`;

const Video = styled.video`
    flex: 1;
    object-fit: cover;
`;

type Props = {};
const CamView: FC<Props> = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

    const { error, videoToggleProps, isVideoEnabled, stream } = useUserVideo({ autoStart: true });
    const [mini, setMini] = useState(false);

    const { call, setLocalStream, remoteStream } = usePeerConnection();
    useEffect(() => {
        setLocalStream(stream);
    }, [stream, setLocalStream]);

    useEffect(() => {
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
    }, [stream]);

    useEffect(() => {
        if (!remoteStream || !remoteVideoRef.current) return;
        setMini(true);
        remoteVideoRef.current.srcObject = remoteStream;
    }, [remoteStream]);

    return (
        <>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <SelfieView stream={stream} mini={mini} />
            <VideosWrapper>
                <Video ref={remoteVideoRef} autoPlay />
            </VideosWrapper>
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
