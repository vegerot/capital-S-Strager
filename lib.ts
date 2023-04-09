export interface UserChatMessage {
  id?: string | null;
  user?: string;
  text: string | null;
  type: MessageType;
}

type MessageType = "PRIVMSG" | "PING" | "UNKNOWN";

export function parseUserMessage(message: string): UserChatMessage {
  // :strager!strager@strager.tmi.twitch.tv PRIVMSG #emceemc2 :@emceeMC2 This isn't TDD!
  // flags=;id=885196de-cb67-427a-baa8-82f9b0fcd05f;mod=0 :lovingt3s!lovingt3s@lovingt3s.tmi.twitch.tv PRIVMSG #lovingt3s :bleedPurple";

  const parts = message.split(" ");
  const hasMetadata = parts[0].startsWith("@");

  let id;
  if (hasMetadata) {
    const metadata = parts[0];
    id = metadata.split("id=")[1].split(";")[0];
    parts.shift();
  }
  const hasUser = parts[0].startsWith(":");
  let user;
  if (hasUser) {
    user = parts[0].split("!")[0].slice(1, message.length);
    parts.shift();
  }
  // the first char is always a `:`, so the second `:` is always the beginning of the message
  let type: MessageType;
  switch (parts.shift()) {
    case "PING":
      type = "PING";
      break;
    case "PRIVMSG":
      type = "PRIVMSG";
      break;
    default:
      type = "UNKNOWN";
  }

  if (type === "PRIVMSG") {
    const _channel = parts.shift();
  }

  const text = parts.join(" ").slice(1);

  return {
    id: id,
    type: type,
    user: user,
    text: text || null,
  };
}
