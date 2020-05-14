import React, { FC, useState, useRef, useEffect } from "react";
import styled from "styled-components";

type WrapperProps = {
    mini: boolean;
};
const Wrapper = styled.div<WrapperProps>`
    position: absolute;
    right: 0;
    bottom: 0;
    z-index: 100;

    overflow: hidden;
    background: radial-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.8));

    transition: all 0.5s;
    z-index: ${({ mini }) => mini && "99999"};
    width: ${({ mini }) => (mini ? "250px" : "100%")};
    height: ${({ mini }) => (mini ? "140.625px" : "100%")};
    margin: ${({ mini }) => (mini ? "1rem" : "0")};

    .info {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;

        color: whitesmoke;
    }
`;

const SelfieVideo = styled.video`
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scaleX(-1);
`;

type SelfieViewProps = {
    stream: MediaStream | null;
    mini?: boolean;
};
const SelfieView: FC<SelfieViewProps> = ({ stream = null, mini = false }) => {
    const [active, setActive] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        setActive(!!stream && stream.getVideoTracks().length > 0);

        if (!videoRef.current || !stream) return;
        const streamClone = stream.clone();
        // Mute sound
        streamClone.getAudioTracks().forEach((track) => track.stop());

        videoRef.current.srcObject = streamClone;
    }, [stream]);

    return (
        <Wrapper mini={mini}>
            {!active && <span className="info">No video available</span>}
            <SelfieVideo ref={videoRef} autoPlay />
        </Wrapper>
    );
};

export default SelfieView;
