## API: POST /rest/risk/control/manager/dataPlatform/chatInfo

### 访问控制

- 匿名访问：不允许
- 需要角色：user、admin、superadmin

### 模型定义
```
interface ChatInfoRequest {
    /** Agent代码 */
    agentCode: string;
    /** 页码，从1开始 */
    pageNum: number;
    /** 每页记录数 */
    pageSize: number;
    /** 会话ID */
    chatId: string;
    /** 用户名 */
    userName: string;
}

interface ChatRecord {
    /** Agent代码 */
    agentCode: string;
    /** 对话ID */
    chatId: string;
    /** 问题ID */
    questionId: string;
    /** 回答ID */
    answerId: string;
    /** 问题内容 */
    question: string;
    /** 回答内容 */
    answer: string;
    /** 对话时间 */
    chatTime: string;

    //以下为基础属性
    id: number; //自增ID
    createTime: string; //YYYY-MM-DDTHH:mm:ss.SSSZ
    updateTime: string; //YYYY-MM-DDTHH:mm:ss.SSSZ
}

interface ChatInfoResponse {
    /** 当前页码 */
    pageNum: number;
    /** 每页记录数 */
    pageSize: number;
    /** 总记录数 */
    total: number;
    /** 对话记录列表 */
    data: ChatRecord[];
}
```

### 请求参数示例
```
{
    "agentCode": "AGENT_001",
    "pageNum": 1,
    "pageSize": 20,
    "chatId": "CHAT_20241218_001",
    "userName": "zhangsan"
}
```

### 返回内容示例
```
{
    "code": 0,
    "data": {
        "code": 200,
        "data": {
            "pageNum": 1,
            "pageSize": 20,
            "total": 45,
            "data": [
                {
                    "agentCode": "AGENT_001",
                    "chatId": "CHAT_20241218_001",
                    "questionId": "Q_001",
                    "answerId": "A_001",
                    "question": "你好，请介绍一下这个Agent的功能",
                    "answer": "您好！我是一个专业的AI助手，主要功能包括...",
                    "chatTime": "2024-12-18T10:30:00.000Z",
                    "id": 1001,
                    "createTime": "2024-12-18T10:30:00.000Z",
                    "updateTime": "2024-12-18T10:30:00.000Z"
                },
                {
                    "agentCode": "AGENT_001",
                    "chatId": "CHAT_20241218_001",
                    "questionId": "Q_002",
                    "answerId": "A_002",
                    "question": "能帮我分析一下这个问题吗？",
                    "answer": "当然可以！让我来为您分析一下...",
                    "chatTime": "2024-12-18T10:32:15.000Z",
                    "id": 1002,
                    "createTime": "2024-12-18T10:32:15.000Z",
                    "updateTime": "2024-12-18T10:32:15.000Z"
                }
            ]
        }
    },
    "msg": "success"
}
```

### 错误结果示例
```
{
    "code": 0,
    "data": {
        "code": 500,
        "msg": "服务器错误"
    }
}
```

### 业务说明
- 当existAgentChat接口返回的chatId > 0时调用此接口
- 用于获取指定会话的完整对话历史记录
- 支持分页查询，方便加载更多历史对话
- 按对话时间倒序排列，最新的对话记录在前
- 用于恢复用户与Agent的完整对话上下文
