import { UserInfo } from '@ad/ambase';
import { proxy } from 'valtio';

export const UserStore = proxy({
  currentUser: null as null | UserInfo,
});
