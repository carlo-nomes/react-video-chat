import { useState, useMemo, useEffect, useCallback } from "react";
import { useSocket } from "../../shared/contexts/SocketContext";

const usePeerConnection = () => {
    const socket = useSocket();

    const [remoteId, setRemoteId] = useState("");
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);

    // Setup Peer Connection
    const pc = useMemo(() => new RTCPeerConnection(), []);
    useEffect(() => {
        pc.ontrack = (ev) => setRemoteStream(ev.streams[0] || null);
        pc.onicecandidate = (ev) => socket.emit("iceCandidate", remoteId, ev.candidate);
        pc.oniceconnectionstatechange = (ev) => console.log("ONICECONNECTIONSTATECHANGE", ev);
    }, [pc, remoteId, socket]);

    // Add stream to PC
    useEffect(() => {
        if (localStream && pc.getSenders().length === 0) {
            localStream.getTracks().forEach((track) => {
                pc.addTrack(track, localStream);
            });
        }

        if (!localStream && pc.getSenders().length > 0) {
            pc.getSenders().forEach((sender) => pc.removeTrack(sender));
        }

        if (localStream && pc.getSenders().length > 0) {
            pc.getSenders().forEach((sender) => {
                localStream.getTracks().forEach((track) => sender.replaceTrack(track));
            });
        }
    }, [localStream, pc]);

    const handleOfferReceived = useCallback(
        async (id: string, offer: RTCSessionDescription) => {
            console.log(`Received offer from ${id}`);
            setRemoteId(id);
            pc.setRemoteDescription(offer);

            const answer = await pc.createAnswer();
            pc.setLocalDescription(answer);

            console.log(`Sending answer to ${id}`);
            socket.emit("answer", id, answer);
        },
        [pc, socket]
    );

    const handleAnswerReceived = useCallback(
        (id: string, answer: RTCSessionDescriptionInit) => {
            console.log(`Received answer from ${id}`);
            setRemoteId(id);
            pc.setRemoteDescription(answer);
        },
        [pc]
    );

    const handleIceCandidateReceived = useCallback(
        (id: string, candidate: RTCIceCandidate) => {
            if (!candidate) return;

            console.log(`Received ICE candidate from ${id}`);
            pc.addIceCandidate(candidate);
        },
        [pc]
    );

    // Configure Socket
    useEffect(() => {
        socket.on("offer", handleOfferReceived);
        socket.on("answer", handleAnswerReceived);
        socket.on("iceCandidate", handleIceCandidateReceived);
    }, [socket, handleOfferReceived, handleAnswerReceived, handleIceCandidateReceived]);

    const call = useCallback(
        async (id: string) => {
            console.log(id);
            const offer = await pc.createOffer({ offerToReceiveVideo: true });
            await pc.setLocalDescription(offer);

            console.log(`Sending offer to ${id}`);
            socket.emit("offer", id, offer);
        },
        [pc, socket]
    );

    return { pc, call, setLocalStream, remoteStream };
};

export default usePeerConnection;
