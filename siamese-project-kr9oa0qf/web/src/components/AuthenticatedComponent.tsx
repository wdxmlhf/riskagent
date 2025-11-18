import React from 'react';
import { ambase } from '@/integrations/ambase';
import { AuthParams } from '@ad/ambase';

interface Props {
  //The component to render if the user is authenticated.
  children: React.ReactNode
  authParams?: AuthParams
}

/**
 * 封装了基于角色的权限控制组件。权限不足时将隐藏children。
 */
const AuthenticatedComponent: React.FC<Props> = ({ children, authParams }) => {
  if (!authParams || ambase.auth.checkAuth(authParams)) {
    //has permitted, render children directly
    return <>{children}</>
  }
  return <></>
};

export default AuthenticatedComponent;