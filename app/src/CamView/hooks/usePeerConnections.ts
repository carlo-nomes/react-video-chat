import { useState, useEffect, useCallback } from "react";

import { useSocket } from "../../shared/contexts/SocketContext";

type UsePeerConnectionsConfig = {
    localStream: MediaStream | null;
};
const usePeerConnections = (config: UsePeerConnectionsConfig) => {
    const { localStream } = config;
    const socket = useSocket();

    const [remoteStreams, setRemoteStreams] = useState<{ [id: string]: MediaStream | null }>({});
    const [peerConnections, setPeerConnections] = useState<{ [id: string]: RTCPeerConnection }>({});

    useEffect(() => {
        Object.values(peerConnections).forEach((pc) => {
            const senders = pc.getSenders();

            if (!localStream) {
                senders.forEach((s) => pc.removeTrack(s));
                return;
            }
            if (senders.length === 0) {
                localStream.getTracks().forEach((t) => pc.addTrack(t));
                return;
            }
            localStream.getTracks().forEach((t) => senders.forEach((s) => s.replaceTrack(t)));
        });
    }, [localStream, peerConnections]);

    const createNewPC = useCallback(
        (id) => {
            const pc = new RTCPeerConnection();
            localStream?.getTracks().forEach((t) => pc.addTrack(t));

            pc.onicecandidate = (ev) => {
                console.log(`Sending ICE candidate to '${id}'`);
                socket.emit("iceCandidate", id, ev.candidate);
            };

            pc.ontrack = (ev) => {
                setRemoteStreams((streams) => {
                    const stream = streams[id] || new MediaStream();
                    stream.addTrack(ev.track);
                    return { ...streams, [id]: stream };
                });
            };

            pc.onconnectionstatechange = (ev) => {
                switch (pc.connectionState) {
                    case "disconnected":
                    case "closed":
                    case "failed":
                        console.log(`Peer Connection with ${id} ${pc.connectionState}`);
                        // Stop and remove Stream
                        setRemoteStreams(({ [id]: _disconnected, ...rss }) => {
                            _disconnected?.getTracks().forEach((t) => t.stop());
                            return rss;
                        });
                        // Close and remove Peer Connection
                        setPeerConnections(({ [id]: _disconnected, ...pcs }) => {
                            _disconnected.close();
                            return pcs;
                        });
                        return;
                }
            };

            return pc;
        },
        [localStream, socket]
    );

    const sendOffer = useCallback(
        async (id: string) => {
            const pc = createNewPC(id);
            const offer = await pc.createOffer({ offerToReceiveVideo: true });
            await pc.setLocalDescription(offer);

            setPeerConnections((pcs) => ({ ...pcs, [id]: pc }));

            console.log(`Sending offer to '${id}'`);
            socket.emit("offer", id, offer);
        },
        [socket, createNewPC]
    );

    // TODO add "pickup" functionality before answering
    const handleOfferReceived = useCallback(
        async (id: string, offer: RTCSessionDescription) => {
            console.log(`Received offer from '${id}'`);

            const pc = createNewPC(id);
            await pc.setRemoteDescription(offer);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            setPeerConnections((pcs) => ({ ...pcs, [id]: pc }));

            console.log(`Sending answer to '${id}'`);
            socket.emit("answer", id, answer);
        },
        [socket, createNewPC]
    );
    useEffect(() => {
        socket.off("offer");
        socket.on("offer", handleOfferReceived);
    }, [socket, handleOfferReceived]);

    const handleAnswerReceived = useCallback(
        async (id: string, answer: RTCSessionDescriptionInit) => {
            console.log(`Received answer from '${id}'`);

            const pc = peerConnections[id];
            if (!pc) {
                console.warn(`Answer received from unknown id '${id}'`);
                return;
            }

            pc.setRemoteDescription(answer);
        },
        [peerConnections]
    );
    useEffect(() => {
        socket.off("answer");
        socket.on("answer", handleAnswerReceived);
    }, [socket, handleAnswerReceived]);

    const handleIceCandidateReceived = useCallback((id: string, candidate: RTCIceCandidate) => {
        if (!candidate) {
            console.warn(`Emtpy candidate received from ${id}`);
            return;
        }

        setPeerConnections((pcs) => {
            console.log(`Received ICE candidate from '${id}'`);
            const pc = pcs[id];
            if (!pc) {
                console.warn(`ICE candidate received from unknown id '${id}'`);
                return pcs;
            }

            pc.addIceCandidate(candidate);

            return { ...pcs, [id]: pc };
        });
    }, []);
    useEffect(() => {
        socket.off("iceCandidate");
        socket.on("iceCandidate", handleIceCandidateReceived);
    }, [socket, handleIceCandidateReceived]);

    return { call: sendOffer, peerConnections, remoteStreams };
};

export default usePeerConnections;
