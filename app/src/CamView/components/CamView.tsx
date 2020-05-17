import React, { FC, useRef, useEffect, useMemo } from "react";
import styled from "styled-components";

import Button from "../../shared/components/Button";
import ErrorMessage from "../../shared/components/ErrorMessage";
import FilledGrid from "../../shared/components/FilledGrid";

import useUserVideo from "../hooks/useUserVideo";
import usePeerConnections from "../hooks/usePeerConnections";

import UserList from "./UserList";
import SelfieView from "./SelfieView";
import RemoteVideo from "./RemoteVideo";

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

type Props = {};
const CamView: FC<Props> = () => {
    const { error, videoToggleProps, isVideoEnabled, stream: localStream } = useUserVideo({ autoStart: true });

    const { call, remoteStreams, peerConnections } = usePeerConnections({ localStream });
    const { gridColumns, gridRows } = useMemo(() => {
        const sqrt = Math.sqrt(Object.keys(peerConnections).length);
        return { gridColumns: Math.round(sqrt), gridRows: Math.ceil(sqrt) };
    }, [peerConnections]);

    return (
        <>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <SelfieView stream={localStream} mini={!!Object.values(peerConnections).length} />
            <FilledGrid columns={gridColumns} rows={gridRows}>
                {Object.keys(peerConnections).map((id) => (
                    <RemoteVideo key={id} id={id} stream={remoteStreams[id] || null} />
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
