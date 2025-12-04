/*
  # 创建我的Agent和定时任务表

  ## 新增表

  ### 1. my_agents
  存储用户创建的Agent信息
  
  字段说明：
  - `id` (uuid, 主键) - Agent唯一标识
  - `user_id` (uuid, 外键) - 关联到auth.users，标识Agent所有者
  - `agent_code` (text, 必填) - Agent代码/编号
  - `agent_name` (text, 必填, 最大15字符) - Agent名称
  - `agent_category` (text, 必填) - Agent分类
  - `agent_belong` (text, 可选) - Agent归属
  - `agent_manager` (text, 可选) - Agent管理员
  - `agent_user` (text, 可选) - Agent使用者
  - `agent_description` (text, 必填, 最大200字符) - Agent描述
  - `agent_prompt` (text, 必填, 最大200字符) - Agent提示词
  - `status` (boolean, 必填, 默认true) - 状态（是/否）
  - `created_at` (timestamptz) - 创建时间
  - `updated_at` (timestamptz) - 更新时间

  ### 2. agent_scheduled_tasks
  存储Agent的定时任务配置
  
  字段说明：
  - `id` (uuid, 主键) - 任务唯一标识
  - `agent_id` (uuid, 外键) - 关联到my_agents
  - `trigger_time` (text, 必填) - 触发时间/频率
  - `trigger_prompt` (text, 可选) - 触发提示词
  - `push_type` (text, 必填) - 推送方式（platform_internal/group_chat）
  - `group_chat_id` (text, 可选) - 群聊号（push_type为group_chat时必填）
  - `failure_detection` (jsonb, 可选) - 失败检测机制配置
  - `enabled` (boolean, 默认true) - 任务是否启用
  - `created_at` (timestamptz) - 创建时间
  - `updated_at` (timestamptz) - 更新时间

  ## 安全配置

  ### RLS策略
  1. my_agents表：
     - 用户只能查看自己创建的Agent
     - 用户只能创建自己的Agent
     - 用户只能更新自己的Agent
     - 用户只能删除自己的Agent

  2. agent_scheduled_tasks表：
     - 用户只能查看自己Agent的任务
     - 用户只能为自己的Agent创建任务
     - 用户只能更新自己Agent的任务
     - 用户只能删除自己Agent的任务

  ## 重要说明
  - 所有表都启用了行级安全(RLS)
  - 使用auth.uid()验证用户身份
  - 使用外键约束确保数据完整性
*/

-- 创建my_agents表
CREATE TABLE IF NOT EXISTS my_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_code text NOT NULL,
  agent_name text NOT NULL CHECK (char_length(agent_name) <= 15),
  agent_category text NOT NULL,
  agent_belong text,
  agent_manager text,
  agent_user text,
  agent_description text NOT NULL CHECK (char_length(agent_description) <= 200),
  agent_prompt text NOT NULL CHECK (char_length(agent_prompt) <= 200),
  status boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 创建agent_scheduled_tasks表
CREATE TABLE IF NOT EXISTS agent_scheduled_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES my_agents(id) ON DELETE CASCADE NOT NULL,
  trigger_time text NOT NULL,
  trigger_prompt text,
  push_type text NOT NULL CHECK (push_type IN ('platform_internal', 'group_chat')),
  group_chat_id text,
  failure_detection jsonb DEFAULT '{}'::jsonb,
  enabled boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_my_agents_user_id ON my_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_my_agents_status ON my_agents(status);
CREATE INDEX IF NOT EXISTS idx_agent_scheduled_tasks_agent_id ON agent_scheduled_tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_scheduled_tasks_enabled ON agent_scheduled_tasks(enabled);

-- 启用行级安全
ALTER TABLE my_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_scheduled_tasks ENABLE ROW LEVEL SECURITY;

-- my_agents表的RLS策略
CREATE POLICY "Users can view own agents"
  ON my_agents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own agents"
  ON my_agents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agents"
  ON my_agents FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own agents"
  ON my_agents FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- agent_scheduled_tasks表的RLS策略
CREATE POLICY "Users can view own agent tasks"
  ON agent_scheduled_tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM my_agents
      WHERE my_agents.id = agent_scheduled_tasks.agent_id
      AND my_agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tasks for own agents"
  ON agent_scheduled_tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM my_agents
      WHERE my_agents.id = agent_scheduled_tasks.agent_id
      AND my_agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own agent tasks"
  ON agent_scheduled_tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM my_agents
      WHERE my_agents.id = agent_scheduled_tasks.agent_id
      AND my_agents.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM my_agents
      WHERE my_agents.id = agent_scheduled_tasks.agent_id
      AND my_agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own agent tasks"
  ON agent_scheduled_tasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM my_agents
      WHERE my_agents.id = agent_scheduled_tasks.agent_id
      AND my_agents.user_id = auth.uid()
    )
  );

-- 创建更新时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为my_agents表添加自动更新时间戳的触发器
DROP TRIGGER IF EXISTS update_my_agents_updated_at ON my_agents;
CREATE TRIGGER update_my_agents_updated_at
  BEFORE UPDATE ON my_agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为agent_scheduled_tasks表添加自动更新时间戳的触发器
DROP TRIGGER IF EXISTS update_agent_scheduled_tasks_updated_at ON agent_scheduled_tasks;
CREATE TRIGGER update_agent_scheduled_tasks_updated_at
  BEFORE UPDATE ON agent_scheduled_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();