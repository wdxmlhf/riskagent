/*
  # Create Agent Weekly Stats Table

  1. New Tables
    - `agent_weekly_stats`
      - `id` (uuid, primary key)
      - `agent_id` (uuid, foreign key to my_agents)
      - `week_start_date` (date) - 统计周起始日期
      - `unique_users` (integer) - 本周使用用户数
      - `conversation_count` (integer) - 本周对话次数
      - `task_trigger_count` (integer) - 本周任务触发数
      - `feedback_count` (integer) - 反馈数
      - `satisfaction_rate` (numeric) - 满意率
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on table
    - Add policies for authenticated users to view stats of their own agents
*/

-- Create agent_weekly_stats table
CREATE TABLE IF NOT EXISTS agent_weekly_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES my_agents(id) ON DELETE CASCADE,
  week_start_date date NOT NULL,
  unique_users integer DEFAULT 0,
  conversation_count integer DEFAULT 0,
  task_trigger_count integer DEFAULT 0,
  feedback_count integer DEFAULT 0,
  satisfaction_rate numeric(5,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  UNIQUE(agent_id, week_start_date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agent_weekly_stats_agent_id ON agent_weekly_stats(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_weekly_stats_week_start_date ON agent_weekly_stats(week_start_date);

-- Enable Row Level Security
ALTER TABLE agent_weekly_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view stats of their own agents"
  ON agent_weekly_stats FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM my_agents
      WHERE my_agents.id = agent_weekly_stats.agent_id
      AND my_agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert stats for their own agents"
  ON agent_weekly_stats FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM my_agents
      WHERE my_agents.id = agent_weekly_stats.agent_id
      AND my_agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update stats of their own agents"
  ON agent_weekly_stats FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM my_agents
      WHERE my_agents.id = agent_weekly_stats.agent_id
      AND my_agents.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM my_agents
      WHERE my_agents.id = agent_weekly_stats.agent_id
      AND my_agents.user_id = auth.uid()
    )
  );