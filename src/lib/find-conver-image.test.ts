import { describe, it, expect } from 'vitest'
import { findCoverImage } from './find-conver-image'

const contentMockData = " 英超联赛已经进入了最后的冲刺阶段，每一场比赛都关系着球队的生死存亡。本周六，位于联赛垫底的南安普敦将在主场迎战排名第12的水晶宫，这场比赛对双方都有着重要的意义。南安普敦需要尽快摆脱降级区，而水晶宫则需要巩固自己的中游位置。本文将从双方的实力和状态，以及可能影响比赛结果的关键因素，来分析这场比赛的前景和预测。![10001.webp](ipfs://bafkreieqyn6gjqdinpjxzl56plrqen2sb2w3fz6koskgqh5xavpdd3242u)\n 南安普敦目前在联赛中只有23分，排在最后一位，距离第17位的莱斯特城有4分的差距。他们已经连续五场联赛不胜，上一轮客场4-1惨败给曼城，防守端暴露出了严重的问题。主帅鲁本·塞勒斯执教以来，只带领球队取得了两场胜利，他表示他不会浪费时间去看积分榜，而是要专注于提高球队的表现和信心。\n南安普敦在本场比赛中将面临伤病困扰，主力前锋切·亚当斯、中卫穆罕默德·萨利苏、边锋米斯拉夫·奥尔西奇等都将缺席。此外，中场小将罗梅奥·拉维亚也有可能因为上一场比赛受伤而无法出战。南安普敦可能会排出4-3-3的阵型.\n水晶宫目前在联赛中有29分，排在第12位，距离降级区有6分的优势。他们在罗伊·霍奇森重新执教后连续两场取得了胜利，上一轮客场5-1大胜利兹联，攻击端表现出了惊人的效率。霍奇森表示他很高兴看到球队的进步和信心，他希望球队能够保持这样的状态。\n综上，水晶宫的进攻效率和心理优势可能会让他们在客场拿下三分，而南安普敦的防守漏洞和伤病困扰可能会让他们再次失望。**舟哥看好水晶宫客场 0-1 1-2**\n**赞赏每天有精选心水单**"

describe('find-conver-image', () => {
    it('should return the image path', () => {
        expect(findCoverImage(contentMockData)).toMatchInlineSnapshot(`
          [
            "https://ipfs.4everland.xyz/ipfs/bafkreieqyn6gjqdinpjxzl56plrqen2sb2w3fz6koskgqh5xavpdd3242u",
          ]
        `)
    })
})