import { AgentRPCClient, AgentRequest } from "../src/index";

async function main() {
  const client = new AgentRPCClient({ url: 'ws://localhost:6000', endpoint: 'myagent' });

  client.onInvite(async (request: AgentRequest) => {
    console.log(`Received invite for dialog: ${request.did}`);
    try {
      // Accept the dialog
      const session = await client.acceptDialog(request);
      console.log(`Dialog ${session.dialogId} accepted`);

      // Now you can use this session to send requests
      const ringResponse = await session.request('ring');
      console.log(`Ringing response for ${session.dialogId}:`, ringResponse);
      if (ringResponse.code !== 200) {
        throw new Error("Ringing failed");
      }

      const answerResponse = await session.request('answer');
      console.log(`Answer response for ${session.dialogId}:`, answerResponse);
      if (answerResponse.code !== 200) {
        throw new Error("Answering failed");
      }

      // This will block until playback is terminated
      const playResponse = await session.request('play', {
        uri: 'https://mauvecloud.net/sounds/pcm1608m.wav'
      }, (response) => {
        console.log(`Playback info: (${response.code}) ${response.reason}`);
      });
      console.log(`Play finished for ${session.dialogId}:`, playResponse);
      if (playResponse.code !== 200) {
        throw new Error("Playback failed");
      }

      const hangupResponse = await session.request('hangup');
      console.log(`Hangup response for ${session.dialogId}:`, hangupResponse);
    } catch (error) {
      console.error(`Error handling dialog ${request.did}:`, error);
    }
  });

  try {
    // Connect and start listening for invites
    console.log('Waiting for incoming dialogs...');
    await client.connectAndListen();
  } catch (error) {
    console.error('Failed:', error);
  }
}

await main();
