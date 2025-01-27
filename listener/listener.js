import express from 'express'
import lodash from 'lodash'
// import bodyParser from 'body-parser'

import WebPluginCommand from '../../../lib/tools/webPluginCommand.js'
// import PluginsLoader from '../../../lib/plugins/loader.js'
import crypto from 'crypto'
import EventEmitter from 'eventemitter3'
import { createServer } from 'http'
import { Server } from 'socket.io'

const event = new EventEmitter()
const app = express()
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())
// app.use(compression())
app.use(express.urlencoded({ extended: true }))

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

app.disable('x-powered-by')

app.use(express.static('build/client', { maxAge: '1h' }))

// app.use(morgan('tiny'))

const httpServer = createServer(app)
const io = new Server(httpServer)

const createMessage = (data, msgId) => {
  let text = data.message || ''
  let uid = data.uid || '10000'
  let username = data.username || '测试'
  let role = data.role || 'normal'
  if (username === 'Zard1096') {
    role = 'owner'
  }
  let e = {
    test: false,
    time: new Date().getTime(),
    post_type: 'message',
    message_type: 'private',
    sub_type: 'normal',
    group_id: 123456789,
    group_name: 'web-plugin',
    user_id: uid,
    anonymous: null,
    message: [{ type: 'text', text }],
    raw_message: text,
    font: '微软雅黑',
    sender: {
      user_id: uid,
      nickname: username,
      card: data.card,
      role
    },
    group: {
      mute_left: 0,
      sendMsg: (msg) => {
        console.info(`回复内容 ${msg}`)
        event.emit('PostMessageEvent', msg, msgId)
      }
    },
    message_id: msgId,
    reply: async (msg) => {
      console.info(`回复内容 ${msg}`)
      event.emit('PostMessageEvent', msg, msgId)
    },
    toString: () => {
      return text
    }
  }

  return e
}

const resolveReplyMsg = (msg, level) => {
  const msgType = typeof (msg)
  console.log('====qqq resolveReplyMsg', msg, msgType, level)
  const result = level == 0 ? { stauts: 0 } : {}
  if (msgType === 'string') {
    if (msg === '超时' && level == 0) {
      result.msg = msg
    } else {
      if (msg !== '' && msg !== '\n') {
        result.data = {
          type: 'text',
          text: msg
        }
      }
    }
  } else if (msgType === 'object') {
    if (Array.isArray(msg)) {
      // 数组需要组装
      const resultArr = msg.map(item => {
        return resolveReplyMsg(item, level + 1)
      })

      if (resultArr.length > 0) {
        // 第一项是决定能力
        const firstItem = resultArr[0]
        const { type } = firstItem.data
        if (type === 'at' || type === 'text') {
          result.data = {
            type: 'text',
            text: resultArr.map(item => item.data?.type === 'text' ? item.data.text : '').join('')
          }
        } else if (type === 'image') {
          result.data = firstItem.data
        }
      }
    } else {
      if (msg.type === 'image') {
        result.data = {
          type: 'image',
          image: msg.file
        }
      } else if (msg.type === 'at') {
        result.data = {
          type: 'at',
          user_id: msg.id
        }
      }
    }
  }

  return result
}

app.post('/api/post/message', function (req, res) {
  console.log('====qqq post listener', req.body)
  // 获取消息
  let commandData = req.body
  if (!commandData.message || !commandData.uid) {
    res.send('{"success":false, "message":"消息或用户不能为空"}')
    return
  }

  let msgId = crypto.randomUUID() + '|' + commandData.uid + '|' + commandData.nickname
  const waitMessageReply = async () => {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        // console.log('=======msg models has setted timeout');
        resolve('超时')
      }, 30000)
      const eventListener = event.on('PostMessageEvent', (msg, uniqueId) => {
        if (msgId === uniqueId) {
          clearTimeout(timeout)
          resolve(msg)
          eventListener.off()
        }
      })
    })
  }

  let e = createMessage(commandData, msgId)

  // 插件处理消息
  // Promise.all(promise, PluginsLoader.deal(e)).then((msgs) => {
  Promise.all([waitMessageReply(), WebPluginCommand.run(e)]).then((msgs) => {
    // console.log('====qqq listener resolve', msgs)
    const msg = msgs[0]
    const resolveResult = resolveReplyMsg(msg, 0)
    // console.log('====qqq listener final result', resolveResult)

    if (resolveResult.data.type === 'text') {
      res.header('Content-Type', 'application/json')
      res.send(resolveResult)
    } else {
      res.header('Content-Type', 'image/jpeg')
      res.send(resolveResult.data.image)
    }
  })

  // res.send('{"test":"test"}')
})

const userMap = new Map()
io.on('connection', (socket) => {
  console.log('====qqq a user connected', socket.id)

  socket.on('disconnect', () => {
    console.log('====qqq user disconnected', socket.id)
    userMap.delete(socket.id)
  })

  socket.on('bind', (msg) => {
    console.log('====qqq bind userId:', msg, ', socketid:', socket.id)
    userMap.set(socket.id, msg)
    console.log('====qqq current userMap:', userMap)
  })

  socket.on('userSendMessage', (msg) => {
    console.log('====qqq message: ' + msg)
    const userId = userMap.get(socket.id)
    if (!userId) {
      console.log('====qqq user not bind')
      return
    }

    const { type, sender, senderName, content } = msg

    let msgId = crypto.randomUUID() + '|' + sender + '|' + senderName
    let e = createMessage({ message: content, uid: sender, username: senderName, role: 'normal' }, msgId)

    WebPluginCommand.run(e)

    io.emit('userShowMessage', {
      msgId,
      fromMsgId: '',
      sender,
      senderName,
      fromSender: '',
      fromSenderName: '',
      createTime: new Date().getTime(),
      type,
      content
    })
  })
})

event.on('PostMessageEvent', (msg, uniqueId) => {
  console.log('====qqq PostMessageEvent', msg, uniqueId)
  const result = resolveReplyMsg(msg, 0)
  console.log('====qqq PostMessageEvent resolve result', result)
  const ids = uniqueId.split('|')
  const userId = ids[1]
  const username = ids[2]
  const fromMsgId = ids[0]
  const { type, text, image, user_id } = result.data
  let content = ''
  if (type === 'text') {
    content = text
  }
  if (type === 'image') {
    content = image
  }
  if (type === 'at') {
    content = user_id
  }

  io.emit('userShowMessage', {
    msgId: crypto.randomUUID(),
    fromMsgId,
    sender: 'Robot',
    senderName: '机器人',
    fromSender: userId,
    fromSenderName: username,
    createTime: new Date().getTime(),
    type,
    content
  })
})

// app.listen(8080)
httpServer.listen(8080, () => {
  console.log('Server socket running on port 8080')
})

// http.listen(3000, () => {
//   console.log('Server socket running on port 3000')
// })
