import { useState, useEffect, useMemo } from "react";
const noop = () => undefined;

type useMediaDevicesConfig = { errorHandler?: (err: string) => void };
const useMediaDevices = (config: useMediaDevicesConfig) => {
    const { errorHandler = noop } = config;
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

    useEffect(() => {
        const refreshMediaDevices = () =>
            navigator.mediaDevices
                .enumerateDevices()
                .then(setDevices)
                .catch((e) => {
                    console.error(e);
                    errorHandler("Something wen wrong while requesting the available devices.");
                });

        // Check compatibility
        if (!navigator.mediaDevices) {
            console.error(`navigator.mediaDevices is ${navigator.mediaDevices}`);
            errorHandler("Video is not available, please upgrade browser.");
            return;
        }
        // getInitialList
        refreshMediaDevices();
        // Add listener
        navigator.mediaDevices.addEventListener("devicechange", refreshMediaDevices);
        // Remove listener
        return () => navigator.mediaDevices.removeEventListener("devicechange", refreshMediaDevices);
    }, [errorHandler]);

    return devices;
};

type UserVideoConfig = {
    autoStart?: boolean;
};
const useUserVideo = (config: UserVideoConfig = {}) => {
    const { autoStart = false } = config;
    const [error, setError] = useState("");

    // Get all available devices
    const devices = useMediaDevices({ errorHandler: setError });

    // Check if a video device is available
    const hasVideo = useMemo(() => devices.filter(({ kind }) => kind === "videoinput").length > 0, [devices]);

    const [isVideoEnabled, setVideoEnabled] = useState(autoStart);
    const showVideo = useMemo(() => hasVideo && isVideoEnabled, [hasVideo, isVideoEnabled]);
    const [stream, setStream] = useState<null | MediaStream>(null);
    useEffect(() => {
        // Close stream
        if (!showVideo) {
            setStream((prevStream) => {
                prevStream?.getTracks().forEach((track) => track.stop());
                return null;
            });
            return;
        }

        // Open new stream
        navigator.mediaDevices
            .getUserMedia({ audio: false, video: showVideo })
            .then((stream) => {
                setStream((prevStream) => {
                    prevStream?.getTracks().forEach((track) => track.stop());
                    return stream;
                });
                setError("");
            })
            // Permission denied
            .catch((e) => {
                console.error(e);
                setError("Please allow access to the webcam.");
            });
    }, [showVideo]);

    const videoToggleProps = {
        onClick: () => setVideoEnabled((val) => !val),
        disabled: !hasVideo,
    };

    return { stream, isVideoEnabled, videoToggleProps, error };
};

export default useUserVideo;
