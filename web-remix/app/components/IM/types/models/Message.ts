export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
}

export class Message {

  private _msgId: string;
  private _fromMsgId: string;

  private _sender: string;
  private _senderName: string;
  private _fromSender: string;
  private _fromSenderName: string;

  private _type: MessageType;

  private _content: string;

  private _createTime: number;

  public constructor(msgId: string, fromMsgId: string, sender: string, senderName: string, fromSender: string, fromSenderName: string, type: MessageType, content: string, createTime: number) {
    this._msgId = msgId;
    this._fromMsgId = fromMsgId;
    this._sender = sender;
    this._senderName = senderName;
    this._fromSender = fromSender;
    this._fromSenderName = fromSenderName;
    this._type = type;
    this._content = content;
    this._createTime = createTime;
  }

  public get msgId(): string {
    return this._msgId;
  }

  public get fromMsgId(): string {
    return this._fromMsgId;
  }

  public get sender(): string {
    return this._sender;
  }

  public get fromSender(): string {
    return this._fromSender;
  }

  public get senderName(): string {
    return this._senderName;
  }

  public get fromSenderName(): string {
    return this._fromSenderName;
  }

  public get type(): MessageType {
    return this._type;
  }

  public get content(): string {
    return this._content;
  }

  public get createTime(): number {
    return this._createTime;
  }
}
