import { agentChatHistoryRepository, agentInfoRepository } from '@/repos';
import {
    HandleResultError,
    HandleResultOK,
    Router,
} from '@ad/ambase-backend'

/**
 * Agent对话历史相关接口
 */
const router = new Router()

//检查Agent对话历史记录接口
router.register('/r/rest/risk/control/manager/dataPlatform/existAgentChat', async (req, ctx) => {
    try {
        const { agentCode, userName } = req.body;
        
        // 参数验证
        if (!agentCode || typeof agentCode !== 'string') {
            return new HandleResultError(400, 'agentCode参数不能为空且必须为字符串')
        }
        
        if (!userName || typeof userName !== 'string') {
            return new HandleResultError(400, 'userName参数不能为空且必须为字符串')
        }

        // 查询该用户与指定Agent的最新对话记录
        const chatHistory = await agentChatHistoryRepository.findOne({
            where: {
                agentCode: agentCode.trim(),
                userName: userName.trim()
            },
            order: [
                ['createTime', 'DESC']
            ]
        });

        // 如果找到历史记录，返回详细信息
        if (chatHistory) {
            return new HandleResultOK({
                agentCode: chatHistory.agentCode,
                chatId: chatHistory.chatId,
                questionId: chatHistory.questionId,
                answerId: chatHistory.answerId,
                question: chatHistory.question,
                answer: chatHistory.answer,
                chatTime: chatHistory.chatTime,
                id: chatHistory.id,
                createTime: chatHistory.createTime,
                updateTime: chatHistory.updateTime
            });
        }

        // 如果没有找到历史记录，返回null
        return new HandleResultOK(null);

    } catch (error) {
        console.error('查询Agent对话历史记录失败:', error.message, error.stack);
        return new HandleResultError(500, '服务器内部错误，请稍后重试');
    }
})

//获取Agent对话历史详情接口（分页查询）
router.register('/rest/risk/control/manager/dataPlatform/chatInfo', async (req, ctx) => {
    try {
        const { agentCode, pageNum, pageSize, chatId, userName } = req.body;
        
        // 参数验证
        if (!agentCode || typeof agentCode !== 'string') {
            return new HandleResultError(400, 'agentCode参数不能为空且必须为字符串')
        }
        
        if (!userName || typeof userName !== 'string') {
            return new HandleResultError(400, 'userName参数不能为空且必须为字符串')
        }
        
        if (!chatId || typeof chatId !== 'string') {
            return new HandleResultError(400, 'chatId参数不能为空且必须为字符串')
        }
        
        // 验证分页参数
        const currentPageNum = parseInt(pageNum);
        const currentPageSize = parseInt(pageSize);
        
        if (!currentPageNum || currentPageNum < 1) {
            return new HandleResultError(400, 'pageNum参数必须为大于0的整数')
        }
        
        if (!currentPageSize || currentPageSize < 1 || currentPageSize > 100) {
            return new HandleResultError(400, 'pageSize参数必须为1-100之间的整数')
        }

        // 构建查询条件
        const whereCondition = {
            agentCode: agentCode.trim(),
            userName: userName.trim(),
            chatId: chatId.trim()
        };

        // 查询总数
        const total = await agentChatHistoryRepository.count({
            where: whereCondition
        });

        // 计算分页偏移量
        const offset = (currentPageNum - 1) * currentPageSize;

        // 分页查询对话记录，按chatTime倒序排列
        const chatRecords = await agentChatHistoryRepository.findAll({
            where: whereCondition,
            order: [
                ['chatTime', 'DESC'],  // 按对话时间倒序
                ['createTime', 'DESC'] // 备选排序字段
            ],
            offset: offset,
            limit: currentPageSize
        });

        // 格式化返回数据
        const formattedData = chatRecords.map(record => ({
            agentCode: record.agentCode,
            chatId: record.chatId,
            questionId: record.questionId,
            answerId: record.answerId,
            question: record.question,
            answer: record.answer,
            chatTime: record.chatTime,
            id: record.id,
            createTime: record.createTime,
            updateTime: record.updateTime
        }));

        // 返回分页结果
        return new HandleResultOK({
            pageNum: currentPageNum,
            pageSize: currentPageSize,
            total: total,
            data: formattedData
        });

    } catch (error) {
        console.error('获取Agent对话历史详情失败:', error.message, error.stack);
        return new HandleResultError(500, '服务器内部错误，请稍后重试');
    }
})

//获取用户常用Agent列表接口
router.register('/rest/risk/control/manager/dataPlatform/frequentlyAgentList', async (req, ctx) => {
    try {
        const { userName } = req.body;
        
        // 参数验证
        if (!userName || typeof userName !== 'string') {
            return new HandleResultError(400, 'userName参数不能为空且必须为字符串')
        }

        // 查询用户常用Agent列表
        // 首先从对话历史中获取用户使用过的Agent代码，按使用频率排序
        const chatHistories = await agentChatHistoryRepository.findAll({
            where: {
                userName: userName.trim()
            },
            order: [
                ['createTime', 'DESC'] // 按创建时间倒序
            ]
        });

        // 统计每个agentCode的使用频率和最近使用时间
        const agentUsageMap = new Map();
        chatHistories.forEach(chat => {
            const agentCode = chat.agentCode;
            if (agentUsageMap.has(agentCode)) {
                const existing = agentUsageMap.get(agentCode);
                existing.count += 1;
                if (new Date(chat.createTime) > new Date(existing.lastUsed)) {
                    existing.lastUsed = chat.createTime;
                }
            } else {
                agentUsageMap.set(agentCode, {
                    agentCode: agentCode,
                    count: 1,
                    lastUsed: chat.createTime
                });
            }
        });

        // 获取使用过的Agent代码列表，按使用频率和最近使用时间排序
        const sortedAgentCodes = Array.from(agentUsageMap.values())
            .sort((a, b) => {
                // 先按使用次数降序排序，如果次数相同则按最近使用时间降序排序
                if (b.count !== a.count) {
                    return b.count - a.count;
                }
                return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
            })
            .map(item => item.agentCode);

        // 如果用户没有使用过任何Agent，返回空列表
        if (sortedAgentCodes.length === 0) {
            return new HandleResultOK([]);
        }

        // 根据Agent代码查询Agent详细信息
        const agentInfoList = await agentInfoRepository.findAll({
            where: {
                agentCode: {
                    [Op.in]: sortedAgentCodes
                }
            }
        });

        // 按照使用频率顺序重新排列Agent信息
        const sortedAgentInfoList = [];
        sortedAgentCodes.forEach(agentCode => {
            const agentInfo = agentInfoList.find(info => info.agentCode === agentCode);
            if (agentInfo) {
                sortedAgentInfoList.push({
                    agentCode: agentInfo.agentCode,
                    agentName: agentInfo.agentName,
                    agentCategory: agentInfo.agentCategory,
                    agentBelong: agentInfo.agentBelong,
                    agentIcon: agentInfo.agentIcon,
                    agentManager: agentInfo.agentManager,
                    agentUser: agentInfo.agentUser,
                    agentDescription: agentInfo.agentDescription,
                    agentPrompt: agentInfo.agentPrompt,
                    createTime: agentInfo.createTime,
                    id: agentInfo.id,
                    updateTime: agentInfo.updateTime
                });
            }
        });

        return new HandleResultOK(sortedAgentInfoList);

    } catch (error) {
        console.error('获取用户常用Agent列表失败:', error.message, error.stack);
        return new HandleResultError(500, '服务器内部错误，请稍后重试');
    }
})

//获取热门Agent列表接口
router.register('/rest/risk/control/manager/dataPlatform/hotAgentList', async (req, ctx) => {
    try {
        const { userName } = req.body;
        
        // userName参数是可选的，如果提供了需要验证类型
        if (userName && typeof userName !== 'string') {
            return new HandleResultError(400, 'userName参数必须为字符串')
        }

        // 获取所有Agent对话历史，用于计算热度
        const allChatHistories = await agentChatHistoryRepository.findAll({
            order: [
                ['createTime', 'DESC']
            ]
        });

        // 统计每个Agent的使用频次和最近活跃度
        const agentHotMap = new Map();
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        allChatHistories.forEach(chat => {
            const agentCode = chat.agentCode;
            const chatTime = new Date(chat.createTime);
            
            if (agentHotMap.has(agentCode)) {
                const existing = agentHotMap.get(agentCode);
                existing.totalCount += 1;
                
                // 最近7天的使用次数权重更高
                if (chatTime >= sevenDaysAgo) {
                    existing.recentCount += 1;
                }
                
                // 更新最近使用时间
                if (chatTime > new Date(existing.lastUsed)) {
                    existing.lastUsed = chat.createTime;
                }
            } else {
                const recentCount = chatTime >= sevenDaysAgo ? 1 : 0;
                agentHotMap.set(agentCode, {
                    agentCode: agentCode,
                    totalCount: 1,
                    recentCount: recentCount,
                    lastUsed: chat.createTime
                });
            }
        });

        // 计算热度分数并排序
        const sortedHotAgents = Array.from(agentHotMap.values())
            .map(item => {
                // 热度计算：最近7天使用次数 * 2 + 总使用次数 * 0.5 + 最近活跃度加成
                const daysSinceLastUse = (now.getTime() - new Date(item.lastUsed).getTime()) / (1000 * 60 * 60 * 24);
                const recencyBonus = Math.max(0, 10 - daysSinceLastUse); // 最近使用的加成分数
                
                const hotScore = item.recentCount * 2 + item.totalCount * 0.5 + recencyBonus;
                
                return {
                    ...item,
                    hotScore: hotScore
                };
            })
            .sort((a, b) => b.hotScore - a.hotScore) // 按热度分数降序排序
            .slice(0, 20); // 取前20个热门Agent

        // 如果没有任何对话历史，返回所有Agent按创建时间排序
        let hotAgentCodes = sortedHotAgents.map(item => item.agentCode);
        
        if (hotAgentCodes.length === 0) {
            // 没有对话历史时，直接查询所有Agent并按创建时间排序
            const allAgents = await agentInfoRepository.findAll({
                order: [
                    ['createTime', 'DESC']
                ],
                limit: 20
            });
            
            return new HandleResultOK(allAgents.map(agent => ({
                agentCode: agent.agentCode,
                agentName: agent.agentName,
                agentCategory: agent.agentCategory,
                agentBelong: agent.agentBelong,
                agentIcon: agent.agentIcon,
                agentManager: agent.agentManager,
                agentUser: agent.agentUser,
                agentDescription: agent.agentDescription,
                agentPrompt: agent.agentPrompt,
                createTime: agent.createTime,
                id: agent.id,
                updateTime: agent.updateTime
            })));
        }

        // 根据热门Agent代码查询Agent详细信息
        const hotAgentInfoList = await agentInfoRepository.findAll({
            where: {
                agentCode: {
                    [Op.in]: hotAgentCodes
                }
            }
        });

        // 按照热度排序重新排列Agent信息
        const sortedHotAgentInfoList = [];
        hotAgentCodes.forEach(agentCode => {
            const agentInfo = hotAgentInfoList.find(info => info.agentCode === agentCode);
            if (agentInfo) {
                sortedHotAgentInfoList.push({
                    agentCode: agentInfo.agentCode,
                    agentName: agentInfo.agentName,
                    agentCategory: agentInfo.agentCategory,
                    agentBelong: agentInfo.agentBelong,
                    agentIcon: agentInfo.agentIcon,
                    agentManager: agentInfo.agentManager,
                    agentUser: agentInfo.agentUser,
                    agentDescription: agentInfo.agentDescription,
                    agentPrompt: agentInfo.agentPrompt,
                    createTime: agentInfo.createTime,
                    id: agentInfo.id,
                    updateTime: agentInfo.updateTime
                });
            }
        });

        // 如果提供了userName，可以在这里进行个性化推荐调整
        // 暂时直接返回热门列表，后续可以根据用户偏好进行调整

        return new HandleResultOK(sortedHotAgentInfoList);

    } catch (error) {
        console.error('获取热门Agent列表失败:', error.message, error.stack);
        return new HandleResultError(500, '服务器内部错误，请稍后重试');
    }
}, { allowAnonymous: true }) // 允许匿名访问

export default router
