## API: POST /rest/risk/control/manager/dataPlatform/frequentlyAgentList

### 访问控制

- 匿名访问：不允许
- 需要角色：user、admin、superadmin

### 模型定义
```
interface FrequentAgentRequest {
    /** 用户名 */
    userName: string;
}

interface AgentInfo {
    /** Agent代码，唯一标识 */
    agentCode: string;
    /** Agent名称 */
    agentName: string;
    /** Agent分类 */
    agentCategory: string;
    /** Agent归属 */
    agentBelong: string;
    /** Agent图标URL */
    agentIcon: string;
    /** Agent管理员 */
    agentManager: string;
    /** Agent用户 */
    agentUser: string;
    /** Agent描述 */
    agentDescription: string;
    /** Agent提示词 */
    agentPrompt: string;
    /** 创建时间 */
    createTime: string;

    //以下为基础属性
    id: number; //自增ID
    updateTime: string; //YYYY-MM-DDTHH:mm:ss.SSSZ
}
```

### 请求参数示例
```
{
    "userName": "zhangsan"
}
```

### 返回内容示例
```
{
    "code": 0,
    "data": {
        "code": 200,
        "data": [
            {
                "agentCode": "AGENT_001",
                "agentName": "智能客服助手",
                "agentCategory": "客户服务",
                "agentBelong": "客服部门",
                "agentIcon": "https://example.com/icons/agent001.png",
                "agentManager": "lisi",
                "agentUser": "zhangsan",
                "agentDescription": "专业的智能客服助手，能够处理常见的客户咨询问题",
                "agentPrompt": "你是一个专业的客服助手，请礼貌地回答用户的问题",
                "createTime": "2024-12-18T09:00:00.000Z",
                "id": 1001,
                "updateTime": "2024-12-18T10:30:00.000Z"
            },
            {
                "agentCode": "AGENT_002",
                "agentName": "数据分析专家",
                "agentCategory": "数据分析",
                "agentBelong": "技术部门",
                "agentIcon": "https://example.com/icons/agent002.png",
                "agentManager": "wangwu",
                "agentUser": "zhangsan",
                "agentDescription": "专业的数据分析助手，擅长数据处理和统计分析",
                "agentPrompt": "你是一个数据分析专家，请用专业的角度分析数据",
                "createTime": "2024-12-17T14:30:00.000Z",
                "id": 1002,
                "updateTime": "2024-12-18T08:15:00.000Z"
            }
        ]
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
- 根据用户名获取该用户的常用Agent列表
- 返回的Agent按使用频率或最近使用时间排序
- Agent列表包含完整的Agent信息，便于前端展示和交互
- 用于在Agent广场或用户个人中心展示常用Agent
