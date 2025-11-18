## API: POST /rest/risk/control/manager/dataPlatform/hotAgentList

### 访问控制

- 匿名访问：允许
- 需要角色：不限制

### 模型定义
```
interface HotAgentRequest {
    /** 用户名，可选参数，用于个性化推荐 */
    userName?: string;
}

interface HotAgentInfo {
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

或者

```
{
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
                "agentCode": "AGENT_HOT_001",
                "agentName": "智能问答助手",
                "agentCategory": "通用助手",
                "agentBelong": "AI部门",
                "agentIcon": "https://example.com/icons/hot_agent001.png",
                "agentManager": "admin",
                "agentUser": "system",
                "agentDescription": "最受欢迎的智能问答助手，能够回答各种问题",
                "agentPrompt": "你是一个智能问答助手，请准确回答用户的各种问题",
                "createTime": "2024-12-10T10:00:00.000Z",
                "id": 2001,
                "updateTime": "2024-12-18T15:30:00.000Z"
            },
            {
                "agentCode": "AGENT_HOT_002",
                "agentName": "代码助手",
                "agentCategory": "编程助手",
                "agentBelong": "技术部门",
                "agentIcon": "https://example.com/icons/hot_agent002.png",
                "agentManager": "techleader",
                "agentUser": "system",
                "agentDescription": "专业的编程助手，帮助开发者解决代码问题",
                "agentPrompt": "你是一个专业的编程助手，请帮助用户解决编程相关问题",
                "createTime": "2024-12-08T14:20:00.000Z",
                "id": 2002,
                "updateTime": "2024-12-18T12:45:00.000Z"
            },
            {
                "agentCode": "AGENT_HOT_003",
                "agentName": "文案创作助手",
                "agentCategory": "内容创作",
                "agentBelong": "营销部门",
                "agentIcon": "https://example.com/icons/hot_agent003.png",
                "agentManager": "marketing",
                "agentUser": "system",
                "agentDescription": "专业的文案创作助手，帮助用户创作高质量文案",
                "agentPrompt": "你是一个文案创作专家，请帮助用户创作优秀的文案内容",
                "createTime": "2024-12-05T16:30:00.000Z",
                "id": 2003,
                "updateTime": "2024-12-18T11:20:00.000Z"
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
- 获取平台上的热门Agent列表，按热度排序
- userName参数为可选，传入时可能返回个性化的热门推荐
- 热度通常基于使用频次、用户评分、最近活跃度等指标计算
- 返回的Agent列表适用于首页展示、Agent广场推荐等场景
- 支持匿名用户访问，便于展示平台热门内容
