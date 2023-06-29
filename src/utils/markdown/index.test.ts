import { describe, it, expect } from "vitest";

import { renderPageContent } from ".";

describe("renderPageContent", () => {
  it("should formatting correctly", () => {
    const result = renderPageContent(`---
StartTime: 2022-10-04T00:00:00.000Z
EndTime: 2022-10-18T00:00:00.000Z
Prize: $500 USDT
ExtraLink: https://discord.com/channels/976854077709369424/1028853206584938567/1028854403282784328
Winners:
  - Hanjeeh13
  - Navicsan
  - harsha
  - anxiete
---

We are hosting a writing competition on xLog - \$500 USDT in prizes are up for grabs. (\$200 first place, \$100 for 2nd, 3rd, and 4th place)

Starting on October 4th at 00:00 UTC and running until October 18th at 00:00 UTC

Writing prompt: “What does your ideal future internet / web3 look like in five years?”

Rules:

1. Your writing must be posted on xLog via Crossbell
2. One entry per user
3. Community votes, to be eligible to vote you must verify your ownership of a Crossbell handle by DMing me  4. After posting to xLog, DM me the link to your submission and I will submit your post for voting
5. English only this time (possibly more languages in the future)

Good luck! If there are questions about the competition feel free to DM me or ask in general chat.

### Updated on the 18th

Okay @everyone , It's time to vote 👁️

Submitted posts are about to be posted in descending order in this channel. React with " ✅ " to the blog(s) you would like to vote for. The voting period will end at 20:00 UTC on Saturday, October 22nd.

Good luck

1: https://5am.xlog.app/the-ideal-internet

3: https://crossbell.io/notes/33396-9

4:  https://anxiete.xlog.app/Future-of-Internet-and-Web3

5: https://batman.xlog.app/Web-3.0-Devrimi

6: https://kumasanki.xlog.app/ABOUT-NFT---Maybe-a-fantasy-journey-of-Web3-with-VR-in-5-years

7: https://navicsan.xlog.app/The-Future-Of-Internet

8: https://harsha.xlog.app/33499-2

9:  https://qfdk.xlog.app/ideal-future-internet

10: https://hanjeeh13.xlog.app/What-does-your-ideal-future-internet%2Fweb3-looks-like-in-5-years

11: https://omer_testnetrun78.xlog.app/WHAT-IS-WEB3?

### Updated on the 24th

Hi everyone, thanks to all who submitted articles and all who voted 👋

Here are our winners of the first article contest:

1st: @Hanjeeh13

2nd: @Navicsan

3rd: @umarsha

4th: @raian

Please contact me via DM to claim prizes 📲

I know some competitors were disappointed with the voting system for this competition, and in the future we will require verification in order to vote for competitions. Verification was not implemented this time due to privacy concerns for users, but we’ve learned that it is necessary. Thanks to all who participated 🙂

    `);

    expect(result).toMatchInlineSnapshot(`
      {
        "excerpt": "We are hosting a writing competition on xLog - $500 USDT in prizes are up for grabs. ($200 first place, $100 for 2nd, 3rd, and 4th place) St…",
        "frontMatter": {
          "EndTime": 2022-10-18T00:00:00.000Z,
          "ExtraLink": "https://discord.com/channels/976854077709369424/1028853206584938567/1028854403282784328",
          "Prize": "$500 USDT",
          "StartTime": 2022-10-04T00:00:00.000Z,
          "Winners": [
            "Hanjeeh13",
            "Navicsan",
            "harsha",
            "anxiete",
          ],
        },
        "toc": null,
        "tree": null,
      }
    `);
  });
});

