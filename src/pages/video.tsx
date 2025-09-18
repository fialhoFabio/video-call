import { StreamClient, UserRequest } from "@stream-io/node-sdk";
// import { MyVideo } from '../components/video/my-video';
import { getEnv } from 'waku/server';
import { SuperVideoComponent } from '../components/video/super-video-component';
import { Link } from "waku";
import { useActionState, useTransition } from "react";
import { endCall, getTranscription, startTranscription } from "../utils/transcription";

export default async function VideoPage () {
  const apiKey = getEnv('WAKU_PUBLIC_STREAM_API_KEY');
  if (!apiKey) throw new Error('WAKU_PUBLIC_STREAM_API_KEY is not defined');
  const secret = getEnv('STREAM_API_SECRET');
  if (!secret) throw new Error('STREAM_API_SECRET is not defined');
  const client = new StreamClient(apiKey, secret);


  // Create a new user or update an existing user
  // generate a random user id
  const userId = Math.random().toString(36).substring(2, 15);
  const newUser: UserRequest = {
    id: userId,
    role: 'user',
    custom: {
      color: 'red',
    },
    name: userId,
  };
  await client.upsertUsers([newUser]);
  // validity is optional (by default the token is valid for an hour)
  const validity = 60 * 60;
  const token = client.generateUserToken({ user_id: userId, validity_in_seconds: validity });

  const callId = Math.random().toString(36).substring(2, 15);
  const call = client.video.call('default', callId);
  console.log('Creating call with id:', callId);
  await call.create({ data: { created_by_id: userId} });

  await call.update({
    settings_override: {
      transcription: {
        speech_segment_config: {
          max_speech_caption_ms: 5000,
          silence_duration_ms: 600,
        },
      },
    },
  });

  // //

  // const callType = 'default';
  // const callId = 'my-first-call';
  // const call = client.video.call(callType, callId);
  // call.create({ data: { created_by_id: 'john' } });

  // console.log(call);

  return (
    <div>
      {/* <MyVideo client={client} call={call} /> */}
      <SuperVideoComponent 
        callId={callId} 
        userToken={token}
        userId={userId} 
        getTranscription={getTranscription} 
        endCall={endCall}
        startTranscription={startTranscription}
      />
    </div>
  );
};

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
