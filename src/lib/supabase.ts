import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type MyAgent = {
  id: string;
  user_id: string;
  agent_code: string;
  agent_name: string;
  agent_category: string;
  agent_belong?: string;
  agent_manager?: string;
  agent_user?: string;
  agent_description: string;
  agent_prompt: string;
  status: boolean;
  created_at: string;
  updated_at: string;
};

export type AgentScheduledTask = {
  id: string;
  agent_id: string;
  trigger_time: string;
  trigger_prompt?: string;
  push_type: 'platform_internal' | 'group_chat';
  group_chat_id?: string;
  failure_detection?: {
    keywords?: string[];
    failureCount?: number;
    notifyManager?: boolean;
  };
  enabled: boolean;
  created_at: string;
  updated_at: string;
};
