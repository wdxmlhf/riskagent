import { createRepo } from '@ad/ambase-backend'
import { ExampleModel } from './ExampleModel'
import { ExambleBook } from './ExambleBook'
import { AgentChatHistory } from './AgentChatHistory'
import { AgentInfo } from './AgentInfo'

//创建并导出数据仓库
//'example_model' 是数据库表的名称
export const exampleRepository = createRepo<ExampleModel>('example_model')

//创建并导出数据仓库
//'example_books' 是数据库表的名称，需要按照实际的模型进行命名
export const exampleBookRepository = createRepo<ExambleBook>('example_books')

//创建并导出Agent对话历史数据仓库
//'agent_chat_history' 是数据库表的名称
export const agentChatHistoryRepository = createRepo<AgentChatHistory>('agent_chat_history')

//创建并导出Agent信息数据仓库
//'agent_info' 是数据库表的名称
export const agentInfoRepository = createRepo<AgentInfo>('agent_info')

//上述`createRepo`创建方法，可以访问表内所有的数据，没有行权限检查。如果需要限制用户访问，只允许查询当前登录用户自己的数据，可以使用以下createUserPrivateRepo方法创建：
//export const bookRepository = createUserPrivateRepo<ExambleBook>('example_books')
