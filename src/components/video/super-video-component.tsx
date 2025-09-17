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
import { useEffect, useState } from "react";
import { MyVideoUI } from "./video-ui";
import { MyMicrophoneButton, MyVideoButton } from "./video-comp";
import { MyToggleTranscriptionButton } from "./transcription";

export const SuperVideoComponent = ({userToken, apiKey, userId} : {userToken: string; apiKey: string; userId: string}) => {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeClient = async () => {
      try {
        // In Waku, public environment variables are available through import.meta.env with VITE_ prefix
        // or through process.env for public variables
        if (!apiKey) {
          setError('API key is not provided');
          return;
        }

        const token = userToken;
        const user: User = { id: userId };

        const videoClient = new StreamVideoClient({ apiKey, user, token });
        const videoCall = videoClient.call("default", "my-first-call");
        
        await videoCall.join({ create: true });
        
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
  }, [userToken, apiKey]);

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

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <StreamTheme>
          <MyToggleTranscriptionButton />
          <SpeakerLayout />
          <CallControls />
        </StreamTheme>
      </StreamCall>
    </StreamVideo>
  );
}