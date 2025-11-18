import { BaseModel } from "@ad/ambase-backend";

/**
 * Agent对话历史记录模型
 */
export interface AgentChatHistory extends BaseModel {
  /** Agent代码 */
  agentCode: string;
  /** 用户名 */
  userName: string;
  /** 对话ID */
  chatId: string;
  /** 问题ID */
  questionId: string;
  /** 回答ID */
  answerId: string;
  /** 问题内容 */
  question: string;
  /** 回答内容 */
  answer: string;
  /** 对话时间 */
  chatTime: string;
}
