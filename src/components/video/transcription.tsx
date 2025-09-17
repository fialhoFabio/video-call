import {
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

export const MyToggleTranscriptionButton = () => {
  const call = useCall();
  const { useCallSettings, useIsCallTranscribingInProgress } =
    useCallStateHooks();

  const { transcription } = useCallSettings() || {};
  if (transcription?.mode === "disabled") {
    // transcriptions are not available, render nothing
    return null;
  }

  const isTranscribing = useIsCallTranscribingInProgress();
  return (
    <button
      onClick={() => {
        if (isTranscribing) {
          call?.stopTranscription().catch((err) => {
            console.log("Failed to stop transcriptions", err);
          });
        } else {
          call?.startTranscription().catch((err) => {
            console.error("Failed to start transcription", err);
          });
        }
      }}
    >
      {isTranscribing ? "Stop transcription" : "Start transcription"}
    </button>
  );
};