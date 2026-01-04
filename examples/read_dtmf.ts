import { AgentRPCClient, AgentRequest } from "../src/index";

async function main() {
  const client = new AgentRPCClient({ url: 'ws://localhost:6000', endpoint: 'myagent' });

  client.onInvite(async (request: AgentRequest) => {
    console.log(`Received invite for dialog: ${request.did}`);
    try {
      // Accept the dialog
      const session = await client.acceptDialog(request);
      console.log(`Dialog ${session.dialogId} accepted`);

      // Before any media action you need to answer dialog first
      const answerResponse = await session.request('answer');
      console.log(`Answer response for ${session.dialogId}:`, answerResponse);
      if (answerResponse.code !== 200) {
        throw new Error("Answering failed");
      }

      const readDtmfResponse = await session.request('read_dtmf', {
        duration_sec: 10,
        termination: '#',
      });
      if (readDtmfResponse.code !== 200) {
        throw new Error("Read DTMF failed");
      }

      const readDtmfData = readDtmfResponse.data as { dtmf: string }
      console.log("DTMF read", readDtmfData.dtmf);

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
