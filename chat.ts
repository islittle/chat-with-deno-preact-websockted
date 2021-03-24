/*
 * @Author: wangfeng
 * @Date: 2020-05-10 23:47:26
 * @LastAuthor: wangfeng
 * @lastTime: 2021-03-24 11:01:44
 * @FilePath: /yit-h5/Users/wangfeng/work/chat-with-deno-and-preact-master/chat.ts
 */
import {
  WebSocket,
  isWebSocketCloseEvent,
} from "https://deno.land/std/ws/mod.ts";
import {
  v4
} from "https://deno.land/std/uuid/mod.ts";

const users = new Map<string, WebSocket>();


function broadcast(message: string, senderId?: string): void {

  if (!message || Object.prototype.toString.call(message) !== '[object String]') return;

  try {
    for (const user of users.values()) {
      // 查看是否在线可以发消息
      const isPing = (() => {
        try {
          user && user.send(' ')
          return true
        } catch (error) {
          return false
        }
      })()
      isPing && user.send(senderId ? `[${senderId}]: ${message}` : message);
    } 
  } catch (error) {
    console.error(error)
  }
}

export async function chat(ws: WebSocket): Promise<void> {
  const userId = v4.generate();

  // Register user connection
  users.set(userId, ws);
  broadcast(`欢迎用户${userId}进入聊天窗口`);
  broadcast(`我是机器人，但是我想说：欢迎，欢迎，热烈欢迎${userId}小伙伴~`);

  // Wait for new messages
  for await (const event of ws) {
    if (Object.prototype.toString.call(event) === '[object Object]') {
      // ws.close()
      continue
    }

    const message = typeof event === "string" ? event : event + '';

    message && broadcast(message, userId);
    // Unregister user conection
    if (!message && isWebSocketCloseEvent(event)) {
      users.delete(userId);
      broadcast(`哦，哦，id为${userId}的用户聊天中断`);
      break;
    }
  }
}
