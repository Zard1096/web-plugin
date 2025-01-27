import { useState } from "react";

import styles from './index.module.css';

export interface MessageIntputProps {
  onUserSendMessage: (message: string) => void;
}

export default function MessageInput(props: MessageIntputProps) {

  const { onUserSendMessage } = props;

  const [inputValue, setInputValue] = useState<string>('');

  const sendMessage = () => {
    if (inputValue === '' || inputValue.length === 0) {
      return;
    }

    onUserSendMessage(inputValue);
    setInputValue('');
  }

  return (
    <div className={styles.input_container}>
      <input className={styles.input_text} type="text" autoComplete="false" onInput={(e) => setInputValue(e.target.value)} value={inputValue} />
      <button className={styles.send_button} onClick={() => {
        sendMessage()
      }}>发送</button>
    </div>
  )
}
