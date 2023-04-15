import { useComposedScrollHandler } from "@/hooks/useComposedScrollHandler";
import * as Haptics from "expo-haptics";
import { forwardRef, useMemo } from "react";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import Animated, { useAnimatedScrollHandler } from "react-native-reanimated";
import { Spinner, Stack } from "tamagui";
import { FeedListItem } from "./FeedListItem";
import type { NoteEntity } from "./FeedListItem";
import { useGetFeed } from "@/queries/home";
import { FeedType } from "@/models/home.model";

export interface Props {
    onScroll?: ReturnType<typeof useAnimatedScrollHandler>
    onScrollEndDrag?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
    type?: FeedType
    noteIds?: string[]
}

export interface FeedListInstance {
}

const data = Array.from({ length: 10 }).map((_, index) => ({
    "characterId": 53802,
    "noteId": 1,
    "linkItemType": null,
    "linkKey": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "deleted": false,
    "locked": false,
    "contractAddress": "0x0000000000000000000000000000000000000000",
    "uri": "ipfs://bafkreigtahlfuazteslqi7qrgmvyq2mp5un2p7w6idgrjuqqnjpumbasfy",
    "operator": "0x9c0aa3dfd7d0d90437081cdfd33cba33ddcd02f6",
    "owner": "0x9c0aa3dfd7d0d90437081cdfd33cba33ddcd02f6",
    "createdAt": "2023-04-15T07:54:05.000Z",
    "updatedAt": "2023-04-15T07:54:05.000Z",
    "deletedAt": null,
    "publishedAt": "2023-04-15T04:27:04.846Z",
    "transactionHash": "0x45b68d074ae8593ce66b8f2eaee446966c726aec2028cacb80242c37b08b4ed4",
    "blockNumber": 31186150,
    "logIndex": 0,
    "updatedTransactionHash": "0x45b68d074ae8593ce66b8f2eaee446966c726aec2028cacb80242c37b08b4ed4",
    "updatedBlockNumber": 31186150,
    "updatedLogIndex": 0,
    "metadata": {
        "uri": "ipfs://bafkreigtahlfuazteslqi7qrgmvyq2mp5un2p7w6idgrjuqqnjpumbasfy",
        "type": "NOTE",
        "content": {
            "tags": [
                "post",
                "qq机器人",
                "AmiyaBot"
            ],
            "title": "在Linux系统部署明日方舟AmiyaBot群聊机器人",
            "content": "   **写这篇文章有两个目的，一是作为学习笔记，方便在下次重新部署时复习使用。二是算是个不成熟的教程吧，但是整体流程也是从别人哪里学来的**\n  *其实是在家闲得无聊找点事情做* \n\n------------\n\n   **仅展示没有遇到错误的情况** \n   **如果遇到报错，请先通过搜索引擎搜素遇到的情况以及报错文本** \n   **或者查看[官方网站](https://www.amiyabot.com/guide/deploy/faq/commonProblem.html)中的常见问题以及官方频道** \n\n------------\n\n   首先，我也是个小白，遇到感兴趣的东西就喜欢鼓捣一下，有什么写错的地方欢迎指正。我是根据[官方文档](https://www.amiyabot.com/guide/deploy/index.html)以及[Initial-heart大佬的教程](https://www.initbili.top/2022/8d92a2feb3e2/#2-%E9%83%A8%E7%BD%B2-mirai)才完成部署。只不过大佬的教程是在Windows系统下部署，思路是一样的，本文只是在linux系统下部署。\n\n在开始之前先介绍一下我的部署环境以及使用的工具\n使用阿里云服务器部署，操作系统：Ubuntu 20.04\n会用到开源SSH工具Tabby 下载链接： [官网](https://tabby.sh/) \n以及ftp工具FlashFXP [官网](https://www.flashfxp.com/) 付费软件可以试用，或者：[百度云盘(提取码:wya6)](https://pan.baidu.com/s/13KRNiYucPnRhxLpWXEp9zg) [蓝奏云(密码:hfly)](https://wwvh.lanzouw.com/b0cbnnq8j)\n滑动验证助手(安装到手机或模拟器中) [Github链接](https://github.com/mzdluo123/TxCaptchaHelper/releases) \n\nTabby使用方法：打开软件后选择设置-配置与连接，点击新配置，选择SSH连接，输入服务器公网IP及用户名密码即可(需注意，在此软件中请不要使用Ctrl+C来复制文本，而是用鼠标左键选中文本后右键点击即可复制。同理粘贴文本直接右键即可。另外当你要输入某个文件名时，只需输入文件名前1或多个字母后，按Tab键即可补全)\nFlashFXP使用方法：菜单栏会话-快速连接，输入服务器公网IP及用户名密码即可\n接下来正式开始\n\n------------\n\n{mtitle title=\"部署mirai\"/}\n\n打开[mirai-Release](https://github.com/iTXTech/mcl-installer/releases)，选择最新版本，找到需要使用的文件\n![mirai1](https://missuo.ru/file/9faf7975e01f21f179b9a.png)\n右键-复制链接地址\n![mirai2](https://missuo.ru/file/5911ab19b9b94da0a56b6.png)\n接下来来到Tabby，输入以下命令，回车运行，新建一个名为mirai的文件夹\n `mkdir mirai` \n 执行以下命令查看当前目录下的所有文件\n  `ls` \n  可以看到已经新建完成\n  ![mkdir](https://missuo.ru/file/824b3be60804ddd28f0a6.png)\n  执行以下命令进入mirai目录，可以理解为双击打开文件夹( `cd ..`为返回上一级 )\n   `cd mirai`\n   ![cd mirao](https://missuo.ru/file/625aec6646b799fc0bda8.png)\n   执行以下命令下载mirai，URL为刚才复制的链接\n    `wget URL` \n  ![wget](https://missuo.ru/file/8ab7dfc4c08f9ae41372f.png)\n  等待下载完成\n   ![wget mirai](https://missuo.ru/file/de8dad023b4d6607be7c0.png)\n  再次执行 `ls` 命令即可看到下载好的文件\n  ![ls mirai](https://missuo.ru/file/973a7e35dc53b09a41be2.png)\n  执行以下命令设置文件权限\n   `chmod 777 文件名` \n   ![chmod1](https://missuo.ru/file/eea71c010bd839fb82d70.png)\n   设置完后文件名颜色会改变\n   ![ls2](https://missuo.ru/file/05f3120823fc0303347f1.png)\n   执行以下命令运行文件开始下载\n  `./文件名` \n  ![./mcl1](https://missuo.ru/file/ba6fd0e8c5cdb9bc304a2.png)\n  安装过程中会有几个选项需要选择\n  是否安装Java：选择y安装\n  Java版本：选择最高版本\n  JRE & JDK：选择JDK\n  Binary Architecture：选择x64\n  ![./mcl](https://missuo.ru/file/7647676e9f63a22e49753.png)\n  ![./mcl](https://missuo.ru/file/2e922db90d572eac92eb3.png)\n  稍后还会询问是否下载MCL，选择y下载\n  ![./mcl](https://missuo.ru/file/74ad4cc30e3029cf5dc8e.png)\n  看到这个即为安装完成，按任意键退出\n  ![./mcl](https://missuo.ru/file/9a4868035d2fc818fc5fe.png)\n   `ls`可以看到安装好的文件\n   ![ls](https://missuo.ru/file/9dcdcabd8eed23b65f82c.png)\n   执行以下命令启动MCL，第一次启动需要初始化，下载运行库和插件\n   ![./mcl](https://missuo.ru/file/cbe5268baf5dd7e135da4.png)\n   完成后会有这句话\n   ![./mcl](https://missuo.ru/file/3db0242284a4f52d93002.png)\n   初始化完成，现在可以按Ctrl+C结束进程\n   接下来来到FlashFXP，按照路径找到这个文件，右键-编辑\n   ![fxp](https://missuo.ru/file/d1d41232ed1dbea160ced.png)\n   将QQ号填到account，密码填到value，protocol推荐填IPAD\n  **注意，冒号和值之间必须有一个空格！** \n  **注意，冒号和值之间必须有一个空格！** \n   **注意，冒号和值之间必须有一个空格！** \n   填好后保存并关闭\n   ![txt](https://missuo.ru/file/6673b75aa05983c579c23.png)\n  `./mcl` 再次运行mcl \n  会看到这样，选中最后一条信息，鼠标右键单击复制，发送到手机上\n  ![url](https://missuo.ru/file/7885af88ecdc21c151dcd.png)\n  打开滑动验证助手，把这一串粘贴上去，点下一步\n  ![phone](https://missuo.ru/file/c38f60c9cfd54c5361ea2.jpg)\n  完成验证\n  ![phone](https://missuo.ru/file/5e99e0c65f6230e4e2fca.jpg)\n  复制给出的Ticket，回到电脑\n  ![phone](https://missuo.ru/file/37c29b0b0ab865e25576e.jpg)\n  单击右键粘贴，回车\n  ![ticket](https://missuo.ru/file/1ba7a8e8ad1d3c3798cac.png)\n  接下来需要短信验证，输入yes，回车\n  ![phone](https://missuo.ru/file/7ca254f5f68f267e5c84f.png)\n  输入短信验证码，登录成功\n  ![success](https://missuo.ru/file/132b6f7cdb00a606d04e1.png)\n  最后出现这样的提示，mcl启动成功\n  ![success](https://missuo.ru/file/132b6f7cdb00a606d04e1.png)\n  Ctrl+C关闭\n\n{mtitle title=\"安装 mah\"/}\n\n打开[mah-Release](https://github.com/project-mirai/mirai-api-http/releases)，选择最新版本，找到需要使用的文件\n![mah](https://missuo.ru/file/fe9fac8235ff28f1d5e34.png)\n下载到电脑上，接下来使用另一种方法下载安装mah\n当然，你也可以继续使用前面介绍的方法，使用 `cd`命令移动到mirai/plugins目录下，使用 `wget URL`的方式安装\n在FlashFXP中，左侧为本机电脑文件，右侧为服务器\n将文件从左边拖到右边即可\n![fxp](https://missuo.ru/file/88a7c87cc0d0d7125e7c2.png)\n![fxp](https://missuo.ru/file/0f0d4972891ec90b38d73.png)\n再次 `./mcl`启动mcl，等待初始化完成后Ctrl+C关闭\n![./mcl](https://missuo.ru/file/67176682ca901b95d36db.png)\n来到此目录下，空白处右键刷新\n![fxp](https://missuo.ru/file/bf238d00fb2ee20302707.png)\n进入新出现的文件夹\n![fxp](https://missuo.ru/file/d131a2883ebbbf3c74761.png)\n右键编辑打开setting.yml\n![fxp](https://missuo.ru/file/40983d52538bac7174ed7.png)\n删除原有的内容，将下面的内容粘贴进去，改变verifyKey的值\n\n```yaml\n## 启用的 adapter, 内置有 http, ws, reverse-ws, webhook\nadapters:\n  - http\n  - ws\n\n## 是否开启认证流程, 若为 true 则建立连接时需要验证 verifyKey\n## 建议公网连接时开启\nenableVerify: true\nverifyKey: 1234567890\n\n## 开启一些调式信息\ndebug: false\n\n## 是否开启单 session 模式, 若为 true，则自动创建 session 绑定 console 中登录的 bot\n## 开启后，接口中任何 sessionKey 不需要传递参数\n## 若 console 中有多个 bot 登录，则行为未定义\n## 确保 console 中只有一个 bot 登陆时启用\nsingleMode: false\n\n## 历史消息的缓存大小\n## 同时，也是 http adapter 的消息队列容量\ncacheSize: 4096\n\n## adapter 的单独配置，键名与 adapters 项配置相同\nadapterSettings:\n  ## 详情看 http adapter 使用说明 配置\n  http:\n    host: localhost\n    port: 8080\n    cors: [\"*\"]\n    unreadQueueMaxSize: 100\n\n  ## 详情看 websocket adapter 使用说明 配置\n  ws:\n    host: localhost\n    port: 8060\n    reservedSyncId: -1\n```\n\n{mtitle title=\"部署AmiyaBot\"/}\n\n点击上方的配置与连接，会显示连接历史，点击新建一个窗口\n![t](https://missuo.ru/file/94f6ad50fa8b5ca24c78c.png)\n![t](https://missuo.ru/file/31026ced03327f1630177.png)\n分别右键重命名，方便分别控制启动mirai和AmiyaBot\n ![t](https://missuo.ru/file/ac4c1762acb5f92d467c8.png)\n首先第一步，安装git\n第一种方法(有可能会出现后续步骤中识别不到git的情况)：\n[点击下载](https://git-scm.com/download/linux) 使用FlashFXP放到根目录下，或者 `wget`命令下载 \n![git](https://missuo.ru/file/90e0c487ce79797078373.png)\n `chmod 777 文件名`  给予权限\n  `tar -xzvf 文件名` 解压缩\n  第二种方法：\n  依次执行 `apt-get update -y`   `apt-get upgrade -y` 更新apt工具\n  `apt install git`  安装git\n   `git --version`  查看已安装的git版本，能查询到即为安装成功\n   接下来，克隆仓库\n  `git clone https://github.com/AmiyaBot/Amiya-Bot.git`\n  ![clone](https://missuo.ru/file/44f862e1ff016fc089c32.png)\n   `cd Amiya-Bot` \n   ![cd](https://missuo.ru/file/ef205e373bc75f2623f58.png)\n  `pip install -r requirements.txt` 安装依赖\n  ![pip](https://missuo.ru/file/2fcf26f2567c24dab3005.png)\n   `playwright install --with-deps chromium`  安装 Chromium\n   ![Chromium](https://missuo.ru/file/0967d54597aa0c1e647cf.png)\n   来到此目录下右键编辑\n   ![fxp](https://missuo.ru/file/d7c7755c65d5bde8ca972.png)\n   将host改为0.0.0.0，authKey密码可不填，但为了安全建议填写\n   ![server](https://missuo.ru/file/7ec12e752e320f796a129.png)\n   最后\n   `python3 amiya.py`  运行\n   mirai窗口 : `cd mirai` ， `./mcl`  AmiyaBot窗口：  `cd Amiya-Bot` ， `python3 amiya.py`\n   两边都启动成功后进入下一步，连接控制台\n\n{mtitle title=\"连接控制台\"/}\n\n首先来到服务器控制台(以阿里云为例)，选择实例进入详情\n![ali](https://missuo.ru/file/b8c330f7e6d976772cc4e.png)\n安全组-配置规则\n![ali](https://missuo.ru/file/5c04171ee4cc4f9a5620b.png)\n点击手动添加，端口范围设置为8088/8088，授权对象设置为0.0.0.0/0，保存\n保险起见也在本地放开8088端口，具体操作为打开控制面板，选择防火墙\n![pc](https://missuo.ru/file/fab2b115ebd811c6e16e7.png)\n高级设置\n![pc](https://missuo.ru/file/054c4deee35b035032c94.png)\n入站规则-新建规则\n![pc](https://missuo.ru/file/e8db1d8d325835cca8c7a.png)\n选择端口\n![pc](https://missuo.ru/file/27d0d293a8fdc28e6e105.png)\n选择TCP，下方填写8088，确定保存\n![pc](https://missuo.ru/file/7c2700c35c5745fde5b80.png)\n在浏览器中打开[控制台http://console.amiyabot.com](http://console.amiyabot.com) \n服务地址为http://服务器公网IP:8088，密钥为server.yaml中填写的authKey\n![co](https://missuo.ru/file/64a55cec0b8820568472b.png)\n选择实例管理\n![con](https://missuo.ru/file/20e02e5bf98edeb2666a3.png)\n按照下图配置(可控实例可填可不填，内容为你的群号)\n![con](https://missuo.ru/file/75becd34705ec859c1c71.png)\n完成后是这个样子\n![con](https://missuo.ru/file/aace26e7c9808eed1b86d.png)\n接下来就可以到插件商店安装需要的插件了，每个插件都会有说明如何配置和使用\n![con](https://missuo.ru/file/7354b167eed8d10b7390c.png)\n好了，现在可以在群里或私聊和兔兔互动了\n虽然现在已经可以正常运行了，但是只要关闭Tabby，进程也会随之关闭。那么，总不能电脑一直不关机且运行Tabby吧。那么，解决方法就是接下来要介绍的——screen\n\n{mtitle title=\"screen保活\"/}\n\n如果发现接下来的命令无法执行，那可能是系统还未安装screen，Ubuntu系统执行以下命令安装\n `apt-get install screen` \n 首先执行以下命令创建一个名为mirai的会话\n  `screen -S mirai` \n  ![screen](https://missuo.ru/file/f1786624cdaa9d2862739.png)\n  执行之后看起来好像没有发生什么变化，实际上screeen已经在运行了\n  接下来执行 `./mcl`启动mcl，启动完成后按下Ctrl+A+D，这时候会话会被暂时中断，但是会话中执行的命令不会被中断。\n  同理，使用 `cd`命令移动到AmiyaBot目录下，创建名为AmiyaBot的会话，执行 `python3 amiya.py`启动amiya.py ，再次按下Ctrl+A+D中断会话。现在，可以随时关闭Tabby了，程序会一直在运行。\n  ![screen](https://missuo.ru/file/3065259aa8ce1dcf84943.png)\n  学会了如何中断会话，那么如何恢复会话呢？\n  首先 `screen -ls`查看会话列表， `screen -r 会话名称i`或者 `screen -r id号`  就可以恢复会话了。\n  ![screen](https://missuo.ru/file/01fa18e880c3f5c229313.png)\n  关闭会话： `exit` \n\n------------\n\n剩余内容(大概率不写)：\n1.Nginx 反向代理加密连接，可参考([此教程](https://www.initbili.top/2022/84452dac2fe6/))\n2.视频版\n3.插件中公招和ChatGPT的配置\n\n------------\n\n **很多内容都来自于互联网以及自己瞎鼓捣，不保证100%正确，如有错误和遗漏欢迎指出** \n\nPS：可能是因为我还装了宝塔面板的原因吧，访问控制台总是会提示接口请求失败。不太想继续折腾了，就这样吧，这篇文章应该也不会再更新了。\n",
            "sources": [
                "xlog"
            ],
            "attributes": [
                {
                    "value": "zai-Linux-xi-tong-bu-shu-ming-ri-fang-zhou-AmiyaBot-qun-liao-ji-qi-ren-md",
                    "trait_type": "xlog_slug"
                }
            ],
            "external_urls": [
                "https://ikarai_blog.xlog.app/zai-Linux-xi-tong-bu-shu-ming-ri-fang-zhou-AmiyaBot-qun-liao-ji-qi-ren-md"
            ],
            "date_published": "2023-04-15T04:27:04.846Z"
        }
    },
    "character": {
        "characterId": 53802,
        "handle": "ikarai",
        "primary": true,
        "uri": "ipfs://bafkreigvksrhtqvgmyjrihshkalpt7mjgldizmdhnygw2twtwhvymjjlji",
        "socialToken": "0x0000000000000000000000000000000000000000",
        "operator": "0x9c0aa3dfd7d0d90437081cdfd33cba33ddcd02f6",
        "owner": "0x9c0aa3dfd7d0d90437081cdfd33cba33ddcd02f6",
        "fromAddress": "0x0000000000000000000000000000000000000000",
        "createdAt": "2023-04-15T07:49:22.000Z",
        "updatedAt": "2023-04-15T07:55:52.000Z",
        "deletedAt": null,
        "transactionHash": "0xaffe442de03f61855fa3641c3b6d9c9706a2b405e0aca84bcb4fadc90ce8544e",
        "blockNumber": 31185867,
        "logIndex": 1,
        "updatedTransactionHash": "0x33c53ce269052bd5b3a3c713132eba5501fb7c394dd65b3dd60ed778c28c9890",
        "updatedBlockNumber": 31186257,
        "updatedLogIndex": 0,
        "metadata": {
            "uri": "ipfs://bafkreigvksrhtqvgmyjrihshkalpt7mjgldizmdhnygw2twtwhvymjjlji",
            "type": "CHARACTER",
            "content": {
                "bio": "记录学习，记录生活",
                "name": "Ikarai's blog",
                "type": "character",
                "avatars": []
            }
        }
    }
}))

export const FeedList = forwardRef<FeedListInstance, Props>((props, ref) => {
    const { type, noteIds } = props;
    const onScrollHandler = useComposedScrollHandler([props.onScroll]);
    const feed = useGetFeed({
        type: type,
        limit: 10,
        characterId: undefined, // TODO
        noteIds: noteIds,
        daysInterval: 7, // TODO
    })

    const feedList = useMemo(() => {
        return feed.data?.pages?.reduce((acc, page) => [...acc, ...(page?.list || [])], []) ?? []
    }, [feed.data])

    if (feed.isLoading) {
        return <Stack justifyContent="center" alignItems="center" flex={1}>
            <Spinner />
        </Stack>
    }

    return <Stack flex={1}>
        <Animated.FlatList<NoteEntity>
            data={feedList}
            keyExtractor={(post, index) => `${post.characterId}-${post.noteId}-${index}`}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item, index }) => {
                return <Stack key={index} marginBottom={'$3'} >
                    <FeedListItem note={item} />
                </Stack>
            }}
            windowSize={3}
            scrollEventThrottle={16}
            onScroll={onScrollHandler}
            showsVerticalScrollIndicator={false}
            onScrollEndDrag={props.onScrollEndDrag}
            onEndReachedThreshold={0.2}
            onEndReached={() => {
                if (
                    feed.isFetching ||
                    feed.isFetchingNextPage ||
                    feed.isFetchingPreviousPage ||
                    feed.hasNextPage === false
                ) {
                    return
                }
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                feed.fetchNextPage()
            }}
            ListFooterComponent={() => {
                if (feed.isFetchingNextPage) {
                    return <Spinner />
                }
                return null
            }}
        />
    </Stack>
})