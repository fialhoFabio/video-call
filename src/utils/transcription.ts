'use server';

import 'server-only';

async function getClient() {
  const apiKey = process.env.WAKU_PUBLIC_STREAM_API_KEY;
  if (!apiKey) throw new Error('WAKU_PUBLIC_STREAM_API_KEY is not defined');
  const secret = process.env.STREAM_API_SECRET;
  if (!secret) throw new Error('STREAM_API_SECRET is not defined');
  const { StreamClient } = await import('@stream-io/node-sdk');
  return new StreamClient(apiKey, secret);
}

async function getCall(callId: string) {
  const client = await getClient();
  return client.video.call('default', callId);
}

export async function getTranscription(callId: string) {
  const call = await getCall(callId);
  return await call.listTranscriptions();
}

export async function startTranscription(callId: string) {
  const call = await getCall(callId);
  return await call.startTranscription({ language: 'pt', enable_closed_captions: true });
}

export async function startClosedCaptions(callId: string) {
  const call = await getCall(callId);
  return await call.startClosedCaptions({ language: 'pt' });
}

export async function endCall(callId: string) {
  const call = await getCall(callId);
  return await call.end();
}
