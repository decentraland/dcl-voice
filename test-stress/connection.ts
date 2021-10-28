
/// <reference path="node_modules/@types/webrtc/RTCPeerConnection.d.ts" />
/// <reference path="node_modules/@types/webrtc/MediaStream.d.ts" />


import { Client } from "./../src/ion";
import { IonSFUJSONRPCSignal } from "./../src/ion/signal/json-rpc-impl";
// var uuid = require("uuid");

let signalConnected = 0;
let dataChannelsConnected = 0;
let clientJoined = 0;
let joins: Record<string, boolean> = {};

export function addConnection(N: number) {
  return new Promise((resolve) => {
    const signal = new IonSFUJSONRPCSignal(
      "wss://test-sfu.decentraland.zone/ws"
    );
    const client = new Client(signal);

    signal.onclose = async () => {
      console.log(`#${N} disconnected - total ${signalConnected--}`);
      if (joins[N]) clientJoined--;
    };

    signal.onopen = async () => {
      console.log(
        `#${N} connected - total ${signalConnected++}` // (joined ${clientJoined} - datachhanels ${dataChannelsConnected})`
      );

      setInterval(() => signal.notify("", ""), 1000 * 60);

      const u = Math.round(Math.random() * 100000).toString()
      await client.join("boedo", u);
      clientJoined++;
      console.log(`#${N} joined - total ${clientJoined}`);
      joins[N] = true;

      const mediaStream = new MediaStream();
      client.publish(mediaStream as any)

      // create a datachannel
      const dc = client.createDataChannel("data");
      dc.onopen = async () => {
        console.log(
          `#${N} data channel connected - total ${dataChannelsConnected++}`
        );

        while (1) {
          dc.send("TEST STRING");
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      };

      resolve(null);
    };
  });
}
