// 内容解析工具函数

export interface ParsedContent {
  textParts: string[];
  chartConfigs: Array<{
    id: string;
    config: any;
    position: number;
  }>;
}

/**
 * 解析包含markdown和echarts的混合内容
 * @param content 原始内容字符串
 * @returns 解析后的文本和图表配置
 */
export const parseContentWithCharts = (content: string): ParsedContent => {
  const result: ParsedContent = {
    textParts: [],
    chartConfigs: []
  };

  if (!content) {
    return result;
  }

  try {
    // 匹配echarts代码块的正则表达式
    const echartsRegex = /```echarts\s*\n([\s\S]*?)\n```/g;
    
    let lastIndex = 0;
    let match;
    let chartCounter = 0;

    // 查找所有echarts代码块
    while ((match = echartsRegex.exec(content)) !== null) {
      const matchStart = match.index;
      const matchEnd = match.index + match[0].length;
      
      // 添加echarts代码块之前的文本
      if (matchStart > lastIndex) {
        const textPart = content.slice(lastIndex, matchStart).trim();
        if (textPart) {
          result.textParts.push(textPart);
        }
      }

      // 解析echarts配置
      try {
        const configContent = match[1].trim();
        const chartConfig = JSON.parse(configContent);
        const chartId = `chart-${Date.now()}-${chartCounter++}`;
        
        result.chartConfigs.push({
          id: chartId,
          config: chartConfig,
          position: result.textParts.length
        });

        // 在文本部分添加图表占位符
        result.textParts.push(`[CHART:${chartId}]`);
      } catch (parseError) {
        console.warn('ECharts配置解析失败:', parseError);
        // 如果解析失败，将其作为普通代码块处理
        const errorText = `\`\`\`json\n${match[1]}\n\`\`\`\n*注意：图表配置格式错误*`;
        result.textParts.push(errorText);
      }

      lastIndex = matchEnd;
    }

    // 添加最后一部分文本
    if (lastIndex < content.length) {
      const textPart = content.slice(lastIndex).trim();
      if (textPart) {
        result.textParts.push(textPart);
      }
    }

    // 如果没有找到任何echarts代码块，将整个内容作为文本
    if (result.textParts.length === 0 && result.chartConfigs.length === 0) {
      result.textParts.push(content);
    }

    console.log('内容解析结果:', {
      文本部分数量: result.textParts.length,
      图表数量: result.chartConfigs.length,
      图表位置: result.chartConfigs.map(c => c.position)
    });

    return result;
  } catch (error) {
    console.error('内容解析失败:', error);
    // 发生错误时，将原始内容作为文本返回
    return {
      textParts: [content],
      chartConfigs: []
    };
  }
};

/**
 * 检查内容是否包含图表
 * @param content 内容字符串
 * @returns 是否包含图表
 */
export const hasCharts = (content: string): boolean => {
  return content.includes('```echarts');
};

/**
 * 检查内容是否为markdown格式
 * @param content 内容字符串
 * @returns 是否为markdown
 */
export const hasMarkdown = (content: string): boolean => {
  return content.includes('##') || 
         content.includes('**') || 
         content.includes('- ') ||
         content.includes('* ') ||
         content.includes('```');
};
