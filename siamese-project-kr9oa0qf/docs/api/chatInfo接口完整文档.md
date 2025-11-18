## API: POST /rest/risk/control/manager/dataPlatform/chatInfo

### 访问控制

- 匿名访问：不允许
- 需要角色：user、admin、superadmin

### 接口说明

此接口用于获取指定Agent的详细对话历史信息，支持分页查询。当existAgentChat接口返回的chatId > 0时调用此接口，用于恢复用户与Agent的完整对话上下文。

### 模型定义
```typescript
interface ChatInfoRequest {
    /** Agent代码，必填 */
    agentCode: string;
    /** 页码，从1开始，必填 */
    pageNum: number;
    /** 每页记录数，必填 */
    pageSize: number;
    /** 会话ID，从existAgentChat接口获取，必填 */
    chatId: string;
    /** 用户名，SSO用户信息，必填 */
    userName: string;
}

interface ChatRecord {
    /** Agent代码 */
    agentCode: string;
    /** 对话ID */
    chatId: string;
    /** 问题ID，唯一标识每个问题 */
    questionId: string;
    /** 回答ID，唯一标识每个回答 */
    answerId: string;
    /** 用户提出的问题内容 */
    question: string;
    /** Agent回答的内容 */
    answer: string;
    /** 对话时间，ISO 8601格式 */
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
    /** 对话记录列表，按时间倒序排列 */
    data: ChatRecord[];
}
```

### 请求参数说明

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| agentCode | string | 是 | Agent的唯一标识符 |
| pageNum | number | 是 | 页码，从1开始 |
| pageSize | number | 是 | 每页返回的记录数，建议范围：1-100 |
| chatId | string | 是 | 对话会话ID，通过existAgentChat接口获取 |
| userName | string | 是 | 当前用户的用户名 |

### 请求参数示例
```json
{
    "agentCode": "AGENT_001",
    "pageNum": 1,
    "pageSize": 20,
    "chatId": "CHAT_20241218_001",
    "userName": "zhangsan"
}
```

### 返回数据结构说明

#### 成功响应格式
```json
{
    "code": 0,                    // 网关状态码，0表示请求成功
    "data": {
        "code": 200,              // 业务状态码，200表示业务处理成功
        "data": {
            "pageNum": 1,         // 当前页码
            "pageSize": 20,       // 每页记录数
            "total": 45,          // 总记录数
            "data": [             // 对话记录数组
                {
                    "agentCode": "AGENT_001",
                    "chatId": "CHAT_20241218_001",
                    "questionId": "Q_001",
                    "answerId": "A_001",
                    "question": "你好，请介绍一下这个Agent的功能",
                    "answer": "您好！我是一个专业的AI助手，主要功能包括问答咨询、数据分析、文档处理等。",
                    "chatTime": "2024-12-18T10:30:00.000Z",
                    "id": 1001,
                    "createTime": "2024-12-18T10:30:00.000Z",
                    "updateTime": "2024-12-18T10:30:00.000Z"
                }
            ]
        }
    },
    "msg": "success"              // 响应消息
}
```

### 响应字段详细说明

#### 外层响应字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| code | number | 网关状态码，0表示网关处理成功 |
| data | object | 业务层返回的完整数据 |
| msg | string | 响应消息，通常为"success" |

#### 业务数据字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| code | number | 业务状态码，200表示业务处理成功 |
| data | object | 分页对话数据 |

#### 分页数据字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| pageNum | number | 当前页码 |
| pageSize | number | 每页记录数 |
| total | number | 符合条件的总记录数 |
| data | array | 对话记录数组 |

#### 对话记录字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| agentCode | string | Agent唯一标识 |
| chatId | string | 对话会话ID |
| questionId | string | 问题唯一标识 |
| answerId | string | 回答唯一标识 |
| question | string | 用户提问内容 |
| answer | string | Agent回答内容 |
| chatTime | string | 对话时间，ISO 8601格式 |
| id | number | 数据库自增ID |
| createTime | string | 记录创建时间 |
| updateTime | string | 记录更新时间 |

### 错误响应示例
```json
{
    "code": 0,
    "data": {
        "code": 500,
        "msg": "服务器错误"
    }
}
```

### 使用场景

1. **对话历史恢复**：用户重新进入Agent对话页面时，恢复之前的对话记录
2. **分页加载**：当对话记录较多时，支持分页加载历史记录
3. **上下文展示**：在对话界面展示完整的问答历史，帮助用户了解对话进程

### 注意事项

1. 调用此接口前需要先调用existAgentChat接口确认存在对话历史
2. 对话记录按chatTime倒序排列，最新的记录在前
3. 建议pageSize设置为合理值（如20-50），避免单次请求数据过大
4. chatTime字段采用ISO 8601格式，前端需要正确解析时间格式
5. question和answer字段可能包含较长文本，前端需要做好文本展示处理
