import React, { useEffect } from 'react';
import { Button, message } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { useSnapshot } from 'valtio';
import { UserStore } from '@/store/UserStore';
import { ambase, gotoLoginWithSSO } from '@/integrations/ambase';
import Loader from './Loader';
import { Role } from '@ad/ambase';


type AuthParams = {
  allowAnonymous?: boolean;
  allowRoles?: Role[];
};

interface AuthenticatedProps {
  //The component to render if the user is authenticated.
  children: React.ReactNode
  //Component to display while the authentication is being checked. default null
  loading?: React.ReactNode
  //default true
  autoLogin?: boolean

  authParams?: AuthParams
}

/**
 * 封装了自动登录、基于角色的权限控制的Layout。当没有登录时，若配置为需要登录，可以进行自动登录；若角色权限不足，会进行提示
 */
const AuthenticatedLayout: React.FC<AuthenticatedProps> = ({ children, loading, autoLogin = true, authParams = {} }) => {
  const [logining, setLogining] = React.useState(false);
  const [searchParams, setSearchParams] = useSearchParams()
  const { currentUser } = useSnapshot(UserStore);


  function checkNeedGoLogin(delay: boolean) {
    //未登录、开启自动登录、不允许匿名访问时 自动跳登录
    if (!currentUser && autoLogin === true && authParams?.allowAnonymous !== true) {
      //自动登录
      if (!delay) {
        //立即跳转
        gotoLoginWithSSO()
      } else {
        //显示消息后 延迟跳转
        message.warning('登录已过期，3秒后将重新登录...')
        setTimeout(() => { gotoLoginWithSSO() }, 3000)
      }
    }
  }

  useEffect(() => {
    //检查是否是登录回来，即url中是否有ticket参数
    const ticketFromParams = searchParams.get("ticket");
    if (ticketFromParams) {
      //登录回来
      searchParams.delete('ticket');
      setSearchParams(searchParams)
      ambase.auth.setTicket(ticketFromParams);
    }
    //检查用户信息
    const ticket = ticketFromParams || ambase.auth.getTicket();
    if (!currentUser && ticket) {
      //本地UserStore不存在用户信息，存在ticket，尝试请求用户信息
      console.debug(`getUserInfo with ticket: ${ticket}`)
      setLogining(true)
      ambase.auth.getCurrentUserInfo()
        .then((userInfo) => {
          UserStore.currentUser = userInfo;
          setLogining(false);
        })
        .catch((err) => {
          console.error(err);
          setLogining(false);
          if (err.code == 401) {
            //message.warning(`获取用户信息失败: ${err.message}`);
            //清空过期的ticket
            ambase.auth.setTicket('');
            checkNeedGoLogin(true)
          }
        });
    } else {
      checkNeedGoLogin(false)
    }
  }, []);


  if (!authParams || ambase.auth.checkAuth(authParams)) {
    //not need login or has permitted, render children directly
    return <>{children}</>
  }

  if (logining) {
    //show loading when loging or checking state
    return <>{loading ?? <Loader loading={logining} color='#ccc'></Loader>}</>
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        {!currentUser ?
          <>
            <h1 className="mb-4 text-2xl font-bold">未登录</h1>
            <Button onClick={gotoLoginWithSSO}>点击登录</Button>
          </> : <>
            <h1 className="mb-4 text-2xl font-bold">无权限</h1>
            <p className="text-gray-600 text-ml">当前角色: [{currentUser.roles?.join(',')}], 需要角色: [{authParams?.allowRoles?.join(',')}]</p>
            <Button onClick={() => { ambase.auth.setTicket(''); UserStore.currentUser = null; }}>退出登录</Button>
          </>}
      </div>
    </div>
  );
};

export default AuthenticatedLayout;