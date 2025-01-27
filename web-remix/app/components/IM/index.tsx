import { useEffect, useRef, useState } from "react";
import { useLatest } from 'ahooks';
import  { io, Socket } from 'socket.io-client';
import { IMUser } from "./types/models/User";
import { Message, MessageType } from "./types/models/Message";
import BaseMessage from './components/BaseMessage';
import MessageInput from './components/Input';

import styles from './index.module.css';

export interface IMDetailProps {
  user: IMUser;
}


export default function IMDetail(props: IMDetailProps) {

  const { user } = props;
  const socket = useRef<Socket>(null);
  const [msgModels, setMsgModels] = useState<Message[]>([]);
  const latestMsgModels = useLatest(msgModels);

  useEffect(() => {
    console.log('=====IM detail active', user)

    if (!socket.current && user.userId) {
      socket.current = io('http://localhost:8080', {
        transports: ['websocket'],
      })
      console.log('====qqq socket init', socket.current?.id, socket.current?.connected)

      if (!socket.current?.connected) {
        socket.current?.on('connect', () => {
          console.log('====qqq socket connected', socket.current?.id)
          //链接后发送userId绑定用户
          socket.current?.emit('bind', user.userId)
          //TODO: 键盘启用
        })
      }
    }

    socket.current?.on('userShowMessage', (data) => {
      console.log('====qqq socket message', data, socket.current?.id)
      const msgModel: Message = new Message(
        data.msgId,
        data.fromMsgId,
        data.sender,
        data.senderName,
        data.fromSender,
        data.fromSenderName,
        data.type,
        data.content,
        data.createTime
      )

      setMsgModels([...latestMsgModels.current, msgModel])
    })
  }, [])

  const onUserSendMessage = (message: string) => {
    socket.current?.emit('userSendMessage', {sender: user.userId, senderName: user.name, content: message, type: MessageType.TEXT});
  }


  return (
    <div>
      <div>会话</div>
      <div className={styles.scroll_container}>
        {msgModels.map((item) => {
          return (
            <BaseMessage message={item} key={item.msgId} />
          );
        })}
      </div>
      <MessageInput onUserSendMessage={onUserSendMessage} />
    </div>
  );
}
