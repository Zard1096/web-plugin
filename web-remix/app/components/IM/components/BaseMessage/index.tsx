import { Message, MessageType } from "../../types/models/Message";

// import { Buffer } from "react";

export interface BaseMessageProps {
  message: Message;
}

export default function BaseMessage(props: BaseMessageProps) {

  const { message } = props;
  const { senderName, fromSenderName, type, content } = message;

  const realContent = () => {
    if (typeof content === 'string') {
      return content
    }

    if (type === MessageType.IMAGE && typeof content === 'object') {
      const base64Img = btoa(
        new Uint8Array(content)
          .reduce((data, byte) => data + String.fromCharCode(byte), ''))
      return base64Img
    }
    return ''
  }

  return (
    <div style={{ paddingBottom: '20px' }}>
      <div>{senderName}</div>
      {fromSenderName !== '' ? <div>发送给{fromSenderName}</div> : null}
      {type === MessageType.TEXT ? <div>{realContent()}</div> : null}
      {type === MessageType.IMAGE ? <img alt="show" src={`data:image/jpeg;base64,${realContent()}`} /> : null}
    </div>
  );


}
