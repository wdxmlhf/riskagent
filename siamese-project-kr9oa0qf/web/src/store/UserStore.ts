import { UserInfo } from '@/integrations/ambase';
import { proxy } from 'valtio';

export const UserStore = proxy({
  currentUser: null as null | UserInfo,
});
