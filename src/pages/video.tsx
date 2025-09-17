import { StreamClient, UserRequest } from "@stream-io/node-sdk";
// import { MyVideo } from '../components/video/my-video';
import { getEnv } from 'waku/server';
import { SuperVideoComponent } from '../components/video/super-video-component';

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

  // //

  // const callType = 'default';
  // const callId = 'my-first-call';
  // const call = client.video.call(callType, callId);
  // call.create({ data: { created_by_id: 'john' } });

  // console.log(call);

  return (
    <div>
      <h1>Video Page</h1>
      {/* <MyVideo client={client} call={call} /> */}
      <SuperVideoComponent userToken={token} apiKey={apiKey} userId={userId} />
    </div>
  );
};

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
