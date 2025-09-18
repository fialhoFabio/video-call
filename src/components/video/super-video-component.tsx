'use client';

import "@stream-io/video-react-sdk/dist/css/styles.css";
import {
  CallControls,
  MicrophoneManager,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
  User,
} from "@stream-io/video-react-sdk";
import { useEffect, useState, useTransition, useCallback } from "react";
import { MyVideoUI } from "./video-ui";
import { MyMicrophoneButton, MyVideoButton } from "./video-comp";
import { MyToggleTranscriptionButton } from "./transcription";

interface SuperVideoComponentProps {
  callId: string;
  userToken: string;
  userId: string;
  getTranscription: (callId: string) => Promise<any>;
  endCall: (callId: string) => Promise<any>;
  startTranscription: (callId: string) => Promise<any>;
}

export const SuperVideoComponent = ({
  callId, 
  userToken,
   userId, 
   getTranscription,
   endCall,
   startTranscription
  } : SuperVideoComponentProps) => {
  const [transcriptions, setTranscriptions] = useState<any[]>([]);
  const [closedCaptions, setClosedCaptions] = useState<any[]>([]);
  const [selectedCallId, setSelectedCallId] = useState(callId);
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(true);
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const apiKey = import.meta.env.WAKU_PUBLIC_STREAM_API_KEY;

  const handleClick = useCallback(() => {
    startTransition(async () => {
      const transcriptions = await getTranscription(selectedCallId);
      setTranscriptions(transcriptions.transcriptions);
      console.log('transcriptions', transcriptions.transcriptions);
    });
  }, [selectedCallId, getTranscription, startTransition]);

  const handleJoinClick = () => {
    startTransition(async () => {
      if (call) {
        console.log('call joined', await call.join());
        setIsOpen(true);
      }
    });
  };

  const handleEndClick = () => {
    startTransition(async () => {
      if (call) {
        console.log('call left', await call.leave());
        setIsOpen(false);
      }
    });
  };

  const handleStartTranscription = () => {
    startTransition(async () => {
      console.log('start transcription', await startTranscription(selectedCallId));
    });
  };

  useEffect(() => {
    const initializeClient = async () => {
      try {
        const token = userToken;
        const user: User = { id: userId };

        const videoClient = new StreamVideoClient({ apiKey, user, token });
        const videoCall = videoClient.call("default", selectedCallId);

        const unsubscribe = videoCall.on("call.closed_caption", (s) => {
          setClosedCaptions((prev) => [...prev, s.closed_caption]);
        });

        await videoCall.join();
        
        setClient(videoClient);
        setCall(videoCall);
      } catch (err) {
        console.error('Failed to initialize video client:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    };

    if (userToken && apiKey) {
      initializeClient();
    }

    return () => {
      if (call) {
        call.leave().catch((err: Error) => {
          console.error('Error leaving call:', err);
        });
      }
    };
  }, [selectedCallId, userToken, userId]);

  if (error) {
    return (
      <div style={{ padding: '20px', border: '1px solid red', borderRadius: '5px' }}>
        <h3>Video Error</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!client || !call) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading video...</p>
      </div>
    );
  }

  const closedCaptionsList = closedCaptions.map((cc, index) => {
    return (
      <span key={index}>{cc.user.name}: {cc.text}</span>
    );
  });

  return (
    <>
      <label>Call id:</label><input className="border-b mx-2" value={selectedCallId} onChange={(e) => setSelectedCallId(e.target.value)} />
      <br /><br />
      <div className="absolute top-5 left-5 flex justify-between w-svh">
        <button className="text-2xl underline text-red-500" onClick={async () => console.log(await endCall(selectedCallId))}>End call</button>
        <button className="text-2xl underline" onClick={handleStartTranscription}>Start Transcription</button>
        <button className="text-2xl underline" onClick={handleClick}>Transcribe</button>
        {!isOpen && <button className="text-2xl underline" onClick={handleJoinClick}>Join Call</button>}
        {isOpen && <button className="text-2xl underline" onClick={handleEndClick}>Leave Call</button>}
      </div>
      <div className="absolute bottom-5 left-5 flex flex-col gap-2 z-50">
        <h1>Transcriptions</h1>
        {closedCaptionsList}
      </div>
      {isOpen &&
        <StreamVideo client={client}>
          <StreamCall call={call}>
            <StreamTheme>
              <SpeakerLayout />
              <CallControls />
            </StreamTheme>
          </StreamCall>
        </StreamVideo>
      }
    </>
  );
}