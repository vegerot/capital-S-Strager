const ws = new WebSocket("ws://irc-ws.chat.twitch.tv:80");
const channel = "#emceemc2";

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

/////// tests

import { assertEquals } from "https://deno.land/std@0.182.0/testing/asserts.ts";

interface UserChatMessage {
  user: string;
  text: string;
}

function parseUserMessage(message: string): UserChatMessage {
  // :strager!strager@strager.tmi.twitch.tv PRIVMSG #emceemc2 :@emceeMC2 This isn't TDD!
  const user = message.split("!")[0].slice(1, message.length); // strager
  // the first char is always a `:`, so the second `:` is always the beginning of the message
  const beginningOfMessage = message.indexOf(":", 1) + 1;
  const text = message.slice(beginningOfMessage, message.length);

  return {
    user: user,
    text: text,
  };
}

Deno.test("parses message", () => {
  {
    const message =
      ":strager!strager@strager.tmi.twitch.tv PRIVMSG #emceemc2 :@emceeMC2 This isn't TDD!";
    const parsed: UserChatMessage = parseUserMessage(message);

    assertEquals(parsed.user, "strager");
    assertEquals(parsed.text, "@emceeMC2 This isn't TDD!");
  }

  {
    const message =
      ":emptygrocerybag!emptygrocerybag@emptygrocerybag.tmi.twitch.tv PRIVMSG #emceemc2 :I win";
    const parsed: UserChatMessage = parseUserMessage(message);

    assertEquals(parsed.user, "emptygrocerybag");
    assertEquals(parsed.text, "I win");
  }

  {
    const message =
      ":emceemc2!emceemc2@emceemc2.tmi.twitch.tv PRIVMSG #emceemc2 :help: me";
    const parsed: UserChatMessage = parseUserMessage(message);

    assertEquals(parsed.user, "emceemc2");
    assertEquals(parsed.text, "help: me");
  }
});
