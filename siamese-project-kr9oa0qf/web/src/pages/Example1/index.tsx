import React, { useEffect } from 'react';
import { Typography, Divider, Button, Space } from 'antd';
import styles from './index.module.less';
import { ambase, gotoLoginWithSSO } from '@/integrations/ambase';
import { useSnapshot } from 'valtio';
import { UserStore } from '@/store/UserStore';
import { useSearchParams } from 'react-router-dom';
import { Op } from '@ad/ambase';
import AuthenticatedComponent from '@/components/AuthenticatedComponent';
const { Title } = Typography;

//数据库 模型示例 Book
interface Book {
  name: string;
  price: string;
}

//数据库操作示例
const Example1DBOprations: React.FC<{ appendLog: (line: string) => void }> = ({ appendLog }) => {

  // Book 仓库。 注意getRepository方法需要用户登录后才可以调用
  const bookRepository = ambase.db.getRepository<Book>('Book')

  //创建一个Book对象
  const handleCreateBook = () => {
    bookRepository.create({
      name: '图书1',
      price: '100'
    }).then((entity) => {
      appendLog(`create success: ${JSON.stringify(entity)}`)
    })
  }

  const handleQueryBook = () => {
    bookRepository.findOne({
      where: {
        name: '图书1'
      }
    }).then((entity) => {
      appendLog(`findOne success: ${JSON.stringify(entity)}`)
    })
  }

  const handleQueryManyBook = () => {
    bookRepository.findAll({
      where: {
        name: {
          [Op.like]: '图%'
        }
      }
    }).then((entities) => {
      appendLog(`findAll success: ${JSON.stringify(entities)}`)
    })
  }
  const handleDeleteBook = () => {
    //删除名称为'图书1'的所有图书
    bookRepository.delete({
      where: {
        name: '图书1'
      }
    }).then((count) => {
      appendLog(`delete success: ${count}`)
    })
  }


  return (
    <div className='flex-grow flex-shrink w-full'>
      <Divider>数据库操作示例</Divider>
      <Space>
        <Button onClick={handleCreateBook}>创建Book</Button>
        <Button onClick={handleQueryBook} >查询1个Book</Button>
        <Button onClick={handleQueryManyBook}>查询多个Book</Button>
        {/* 下面这个删除只有管理员角色才启用 */}
        <Button onClick={handleDeleteBook} disabled={!ambase.auth.checkAuth({ allowAnonymous: false, allowRoles: ['admin', 'superadmin'] })}>删除全部Book</Button>
        {/* 下面这个删除按钮只有管理员看得见 */}
        <AuthenticatedComponent authParams={{ allowAnonymous: false, allowRoles: ['admin', 'superadmin'] }}><Button onClick={handleDeleteBook}>删除全部Book</Button></AuthenticatedComponent>
      </Space>
    </div>
  );
};


interface Book {
  name: string
  price: string
}

//后端API调用示例
const Example1APIOprations: React.FC<{ appendLog: (line: string) => void }> = ({ appendLog }) => {
  const handleRequest = () => {

    ambase.api.doRequest<Book>('/helloworld', {}).then((text) => {
      appendLog(`request helloworld success: ${JSON.stringify(text)}`)
    }).catch(err => {
      appendLog(`request helloworld failed: ${err.message}`)
    })

  }
  return (
    <div className='flex-grow flex-shrink w-full'>
      <Divider>API调用示例</Divider>
      <Space>
        <Button onClick={handleRequest}>调用‘/helloworld’</Button>
      </Space>
    </div>
  );
};


const Example1: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [log, setLog] = React.useState<string>('')

  const { currentUser } = useSnapshot(UserStore)

  const appendLog = (line: string) => {
    setLog((prev) => prev + "◆◆◆" + line + '\n')
  }


  useEffect(() => {
    //检查是否是登录回来，即url中是否有ticket参数
    const ticket = searchParams.get("ticket") || ambase.auth.getTicket();
    if (ticket) {
      console.debug(`ticket: ${ticket}`)
      ambase.auth.setTicket(ticket);
      searchParams.delete('ticket');
      setSearchParams(searchParams)
      ambase.auth.getCurrentUserInfo()
        .then((userInfo) => {
          UserStore.currentUser = userInfo;
          appendLog(`登录成功: ${JSON.stringify(userInfo)}`)
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className='flex-grow flex-shrink w-full'>
        <Title level={2} >示例页面1</Title>
        <Divider>用户登录</Divider>
        {currentUser ? <div>当前用户: {currentUser.name}, 角色: {currentUser.roles.join(',')}</div> : <div>未登录： <Button onClick={gotoLoginWithSSO}>点击登录</Button></div>}
        {currentUser ? <div>
          <Example1DBOprations appendLog={appendLog}></Example1DBOprations>
          <Example1APIOprations appendLog={appendLog}></Example1APIOprations>
        </div> : <div>更多操作需要登录后可见</div>}
      </div>
      <Divider size='small'>日志 <Button danger onClick={() => setLog('')}>
        ClearLog
      </Button></Divider>
      <div className='relative border border-black  bg-red-100 h-[200px] w-full p-1'>
        <div className="relative flex-grow h-full overflow-scroll break-all whitespace-pre-line">
          {log}
        </div>
      </div>
    </div>
  );
};

export default Example1;