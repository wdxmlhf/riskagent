## API: POST /r/rest/risk/control/manager/dataPlatform/existAgentChat

### 访问控制

- 匿名访问：不允许
- 需要角色：user、admin、superadmin

### 模型定义
```
interface AgentChatCheckRequest {
    /** Agent代码 */
    agentCode: string;
    /** 用户名 */
    userName: string;
}

interface AgentChatHistory {
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
```

### 请求参数示例
```
{
    "agentCode": "AGENT_001",
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
            "agentCode": "AGENT_001",
            "chatId": "CHAT_20241218_001",
            "questionId": "Q_001",
            "answerId": "A_001",
            "question": "你好，请介绍一下这个Agent的功能",
            "answer": "您好！我是一个专业的AI助手...",
            "chatTime": "2024-12-18T10:30:00.000Z",
            "id": 1001,
            "createTime": "2024-12-18T10:30:00.000Z",
            "updateTime": "2024-12-18T10:30:00.000Z"
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
- 用户从Agent广场跳转到具体Agent对话页面时调用此接口
- 检查该用户与指定Agent是否已有对话历史
- 如果有历史记录，返回最新的对话信息，可用于恢复上次对话状态
- 如果无历史记录，data字段可能为null，表示需要开始新的对话
