#!/usr/bin/env -S deno run

import {
  issTragerMispelled,
  parseUserMessage,
  UserChatMessage,
} from "./lib.ts";

const ws = new WebSocket("ws://irc-ws.chat.twitch.tv:80");
const channel = "#" + Deno.args[0].toLowerCase();
const OAUTH_PASS = Deno.env.get("OAUTH_PASS");

main();

function main() {
  ws.onerror = (...args: unknown[]) => {
    console.error("WebSocket error observed:", args);
  };

  ws.onmessage = (...args: any[]) => {
    const data = args[0].data;
    /*console.log("------message start-----");
    console.log(data);
    console.log("------message end-----");*/
    const message = parseUserMessage(data);
    switch (message.type) {
      case "PING":
        handlePing(message);
        break;
      case "PRIVMSG":
        handleUserMessage(message);
        break;
      case "UNKNOWN":
        //console.warn("UNKNOWN message type:", message.type);
        //console.warn(message);
        break;
      default:
        throw new Error("wat?");
    }
  };

  ws.onopen = () => {
    ws.send("CAP REQ :twitch.tv/tags");
    ws.send(`PASS oauth:${OAUTH_PASS}`);
    ws.send("NICK emceeMC2");
    //ws.send("USER emceemc2 8 * :emceemc2");
    ws.send(`JOIN :${channel}`);
    ws.send(`PRIVMSG ${channel} : HeyGuys`);
  };
}

function handlePing(message: UserChatMessage) {
  ws.send(`PONG :${message.text}`);
}

function handleUserMessage(message: UserChatMessage) {
  const text = message.text;
  if (!text) return;
  if (issTragerMispelled(text)) {
    console.log(message);
    replyToMessage(message, "who?", channel);
  }
}

function replyToMessage(
  parentMessage: UserChatMessage,
  message: string,
  channel: string,
) {
  ws.send(
    `@reply-parent-msg-id=${parentMessage.id} PRIVMSG ${channel} :${message}`,
  );
}
