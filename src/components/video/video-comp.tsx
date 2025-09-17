import { useCallStateHooks } from "@stream-io/video-react-sdk";

export const MyVideoButton = () => {
  const { useCameraState } = useCallStateHooks();
  const { camera, isMute } = useCameraState();
  return (
    <button onClick={() => camera.toggle()}>
      {isMute ? "Turn on camera" : "Turn off camera"}
    </button>
  );
};

export const MyMicrophoneButton = () => {
  const { useMicrophoneState } = useCallStateHooks();
  const { microphone, isMute } = useMicrophoneState();
  return (
    <button onClick={() => microphone.toggle()}>
      {isMute ? "Turn on microphone" : "Turn off microphone"}
    </button>
  );
};