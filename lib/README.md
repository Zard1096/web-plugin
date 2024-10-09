# Web-Plugin 说明

`web-plugin`是一个`Yunzai-Bot`(基于`MIAO-YUNZAI`)的网页使用能力。


---

## 安装与更新

### 使用Git安装（推荐）

请将 web-plugin 放置在 Yunzai-Bot 的 plugins 目录下，重启 Yunzai-Bot 后即可使用。

请使用 git 进行安装，以方便后续升级。在 Yunzai-Bot 根目录夹打开终端，运行下述指令之一

```
// 使用gitee
git clone --depth=1 https://gitee.com/Zard1096/web-plugin.git ./plugins/web-plugin/
pnpm install -P

// 使用github
git clone --depth=1 https://github.com/Zard1096/web-plugin.git ./plugins/web-plugin/
pnpm install -P
```

如果不准备使用机器人登录,可以关闭机器人
```
config/config/bot.yaml

//修改 skip_login: true

```


将`lib/tools`下的文件复制到`MIAO-YUNZAI`同名目录下
```
cp -r ./plugins/web-plugin/lib/tools/ ./lib/tools/
```

创建用户数据库
```
cd plugins/web-plugin/web-remix
npx prisma generate
npx prisma db push
cd ../../../
```

修改pm2/pm2.json，增加部署内容
```
{
      "name": "web-plugin-app",
      "script": "cd ./plugins/web-plugin/web-remix && pnpm run build && pnpm run start",
      "max_memory_restart": "512M",
      "restart_delay": 60000
},
{
      "name": "web-plugin-server",
      "script": "./plugins/web-plugin/listener/listener.js",
      "max_memory_restart": "512M",
      "restart_delay": 60000
}

```

第一次部署后需要先注册一个账号，发送一个消息获取uid，并添加到config/config/ohter.yaml的masterQQ中



## Yunzai版本与支持

`miao-plugin` 支持V3 / V2 版本的Yunzai-Bot

* [Miao-Yunzai](https://github.com/yoimiya-kokomi/Miao-Yunzai) : 喵版Yunzai [Gitee](https://gitee.com/yoimiya-kokomi/Miao-Yunzai)
  / [Github](https://github.com/yoimiya-kokomi/Miao-Yunzai) ，本体不含签到功能，功能迭代较多，与miao-plugin打通，只建议新部署/迁移
* [Yunzai-V3](https://github.com/yoimiya-kokomi/Yunzai-Bot) ：Yunzai V3 - 喵喵维护版，icqq版本，与原版Yunza功能基本一致，会保持卡池更新，功能相对稳定，可从原版Yunzai换源直接升级
* [Yunzai-V3](https://gitee.com/Le-niao/Yunzai-Bot) ：Yunzai V3 - 乐神原版，oicq版本，可能会遇到登录问题

---

## 功能说明
Web使用机器人功能，实际有点本末倒置，但懒得从头开发了


---

# 免责声明

1. `web-plugin`自身的UI与代码均开放，无需征得特殊同意，可任意使用。能备注来源最好，但不强求
2. 以上声明但仅代表`web-plugin`自身的范畴，请尊重Yunzai本体及其他插件作者的努力，勿将Yunzai及其他插件用于以盈利为目的的场景
3. web-plugin的图片与其他素材均来自于网络，仅供交流学习使用，如有侵权请联系，会立即删除

# 资源

* [Miao-Yunzai](https://github.com/yoimiya-kokomi/Miao-Yunzai) : 喵版Yunzai [Gitee](https://gitee.com/yoimiya-kokomi/Miao-Yunzai)
  / [Github](https://github.com/yoimiya-kokomi/Miao-Yunzai)
* [Yunzai-V3](https://github.com/yoimiya-kokomi/Yunzai-Bot) ：Yunzai V3 - 喵喵维护版（使用 icqq）
* [Yunzai-V3](https://gitee.com/Le-niao/Yunzai-Bot) ：Yunzai V3 - 乐神原版（使用 oicq）
* [miao-plugin](https://github.com/yoimiya-kokomi/miao-plugin) : 喵喵插件 [Gitee](https://gitee.com/yoimiya-kokomi/miao-plugin)
  / [Github](https://github.com/yoimiya-kokomi/miao-plugin)

# 其他&感谢

