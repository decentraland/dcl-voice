/// <reference path="node_modules/@types/webrtc/RTCPeerConnection.d.ts" />
/// <reference path="node_modules/@types/webrtc/MediaStream.d.ts" />

declare module 'wrtc' {
  export const MediaStream: any
  export const RTCPeerConnection: any
}