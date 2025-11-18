import { BaseModel } from "@ad/ambase-backend";

/**
 * Agent信息模型
 */
export interface AgentInfo extends BaseModel {
  /** Agent代码，唯一标识 */
  agentCode: string;
  /** Agent名称 */
  agentName: string;
  /** Agent分类 */
  agentCategory: string;
  /** Agent归属 */
  agentBelong: string;
  /** Agent图标URL */
  agentIcon: string;
  /** Agent管理员 */
  agentManager: string;
  /** Agent用户 */
  agentUser: string;
  /** Agent描述 */
  agentDescription: string;
  /** Agent提示词 */
  agentPrompt: string;
}
