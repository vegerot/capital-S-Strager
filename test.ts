import { assertEquals } from "https://deno.land/std@0.182.0/testing/asserts.ts";
import {
  issTragerMispelled,
  parseUserMessage,
  UserChatMessage,
} from "./lib.ts";

Deno.test("parses messages", () => {
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

  {
    const message =
      ":emceemc2!emceemc2@emceemc2.tmi.twitch.tv JOIN #rocketleague";
    const parsed: UserChatMessage = parseUserMessage(message);

    assertEquals(parsed.id, undefined);
    assertEquals(parsed.user, "emceemc2");
    assertEquals(parsed.text, "rocketleague");
    assertEquals(parsed.type, "UNKNOWN");
  }

  {
    const message = "PING :tmi.twitch.tv";
    const parsed: UserChatMessage = parseUserMessage(message);
    assertEquals(parsed.type, "PING");
    assertEquals(parsed.text, "tmi.twitch.tv");
  }
});

Deno.test("parses message with optional part", () => {
  {
    const message =
      "@badge-info=;badges=broadcaster/1;client-nonce=459e3142897c7a22b7d275178f2259e0;color=#0000FF;display-name=lovingt3s;emote-only=1;emotes=62835:0-10;first-msg=0;flags=;id=885196de-cb67-427a-baa8-82f9b0fcd05f;mod=0;room-id=713936733;subscriber=0;tmi-sent-ts=1643904084794;turbo=0;user-id=713936733;user-type= :lovingt3s!lovingt3s@lovingt3s.tmi.twitch.tv PRIVMSG #lovingt3s :bleedPurple";
    const parsed: UserChatMessage = parseUserMessage(message);

    assertEquals(parsed.id, "885196de-cb67-427a-baa8-82f9b0fcd05f");
    assertEquals(parsed.user, "lovingt3s");
    assertEquals(parsed.text, "bleedPurple");
    assertEquals(parsed.type, "PRIVMSG");
  }
});

Deno.test("finds mispelled stragers", () => {
  assertEquals(issTragerMispelled("strager"), false);
  assertEquals(issTragerMispelled("Strager"), true);
  assertEquals(issTragerMispelled("StRaGeR"), true);
  assertEquals(issTragerMispelled("sTRAGER"), false);
  assertEquals(issTragerMispelled("STRAGER"), false);
  assertEquals(issTragerMispelled("what are you talking about?"), false);
});
