import { parseUserMessage, UserChatMessage } from "./lib.ts";

const ws = new WebSocket("ws://irc-ws.chat.twitch.tv:80");
const channel = "#" + Deno.args[0].toLowerCase();

main();
function main() {
  const OAUTH_PASS = Deno.env.get("OAUTH_PASS");

  ws.onerror = (...args: unknown[]) => {
    console.error("WebSocket error observed:", args);
  };

  ws.onmessage = (...args: any[]) => {
    const data = args[0].data;
    const isUserMessage = data.split(" ")[1] === "PRIVMSG";
    if (data.startsWith("PING")) {
      handlePing(ws);
    } else if (isUserMessage) {
      // I don't think "!" is a legal username or email, so this is a good way to check if it's a user message
      const message = parseUserMessage(data);
      handleUserMessage(message);
    } else console.log(data);
  };

  ws.onopen = () => {
    //ws.send("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership");
    ws.send(`PASS oauth:${OAUTH_PASS}`);
    ws.send("NICK emceeMC2");
    //ws.send("USER emceemc2 8 * :emceemc2");
    ws.send("JOIN :#emceemc2");
    ws.send("PRIVMSG #emceemc2 : help me");
  };
}

function handlePing(ws: WebSocket) {
  ws.send("PONG :tmi.twitch.tv");
}

function handleUserMessage(message: UserChatMessage) {
  if (message.text.includes("Strager")) {
    sendUserMessage("who?", channel);
  }
}

function sendUserMessage(message: string, channel: string) {
  ws.send(`PRIVMSG ${channel} :${message}`);
}
