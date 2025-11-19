// 聊天内容解析和处理工具函数
export interface DataStringContent {
  success: boolean;
  code: number;
  msg: string;
  data: string;
  traceId: string;
  conversationId: string;
  result: string;
}

// HTML内容安全处理函数
export const sanitizeHTML = (htmlContent: string): string => {
  // 基本的HTML标签白名单
  const allowedTags = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'div', 'span', 'br', 'hr',
    'strong', 'b', 'em', 'i', 'u', 's',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
    'ul', 'ol', 'li', 'dl', 'dt', 'dd',
    'a', 'img', 'video', 'audio', 'source',
    'pre', 'code', 'blockquote',
    'details', 'summary'
  ];

  // 危险脚本标签检测和移除
  const scriptPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  const stylePattern = /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi;
  const onEventPattern = /\s+on\w+\s*=\s*["'][^"']*["']/gi;
  
  let cleanedContent = htmlContent
    .replace(scriptPattern, '')
    .replace(stylePattern, '')
    .replace(onEventPattern, '');

  console.log('HTML内容安全处理完成');
  return cleanedContent;
};

// HTML转Markdown的辅助函数
export const convertHTMLToMarkdown = (htmlContent: string): string => {
  try {
    // 简单的HTML到Markdown转换
    let markdownContent = htmlContent
      // 标题转换
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
      .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
      .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
      // 段落转换
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      // 换行转换
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<hr\s*\/?>/gi, '\n---\n')
      // 强调转换
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      .replace(/<u[^>]*>(.*?)<\/u>/gi, '_$1_')
      // 链接转换
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      // 图片转换
      .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')
      .replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)')
      // 代码转换
      .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
      .replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gi, '```\n$1\n```')
      .replace(/<pre[^>]*>(.*?)<\/pre>/gi, '```\n$1\n```')
      // 列表转换
      .replace(/<ul[^>]*>(.*?)<\/ul>/gi, (match, content) => {
        return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n') + '\n';
      })
      .replace(/<ol[^>]*>(.*?)<\/ol>/gi, (match, content) => {
        let counter = 1;
        return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${counter++}. $1\n`) + '\n';
      })
      // 引用转换
      .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n')
      // 移除其他HTML标签
      .replace(/<[^>]+>/g, '')
      // 清理多余的空行
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    console.log('HTML转Markdown转换完成');
    return markdownContent;
  } catch (error) {
    console.error('HTML转Markdown失败:', error);
    return htmlContent.replace(/<[^>]+>/g, '').trim();
  }
};

// 增强的内容类型检测函数
export const detectContentType = (content: string): 'html' | 'markdown' | 'text' => {
  // HTML检测模式 - 更精确的检测
  const complexHtmlPattern = /<(table|thead|tbody|tr|td|th|div|video|img|h[1-6]|ul|ol|li|blockquote|pre|code)[^>]*>/i;
  const simpleHtmlPattern = /<\/?[a-z][\s\S]*>/i;
  
  // Markdown检测模式
  const markdownPatterns = [
    /#{1,6}\s/,                    // 标题
    /^\s*[-*+]\s/m,                // 无序列表
    /^\s*\d+\.\s/m,                // 有序列表
    /\*\*.*\*\*/,                  // 加粗
    /\*.*\*/,                      // 斜体
    /\[.*\]\(.*\)/,                // 链接
    /```[\s\S]*```/,               // 代码块
    /`[^`]+`/,                     // 行内代码
    /^\s*>/m,                      // 引用
    /^\s*\|.*\|/m                  // 表格
  ];
  
  // 如果包含复杂的HTML结构，优先判断为HTML
  if (complexHtmlPattern.test(content)) {
    console.log('检测到复杂HTML结构');
    return 'html';
  }
  
  // 检测Markdown特征
  const hasMarkdownFeatures = markdownPatterns.some(pattern => pattern.test(content));
  
  if (hasMarkdownFeatures) {
    console.log('检测到Markdown特征');
    return 'markdown';
  }
  
  // 如果包含简单HTML标签但没有Markdown特征，判断为HTML
  if (simpleHtmlPattern.test(content)) {
    console.log('检测到简单HTML标签');
    return 'html';
  }
  
  console.log('判断为纯文本');
  return 'text';
};

// 检测并预处理结构化报告内容
export const preprocessStructuredReport = (content: string): string => {
  console.log('开始预处理结构化报告内容');

  const hasTable = content.includes('|') && content.includes('---');
  const hasEmojiTitles = /[📊📋🎯⚡🔍💡⚠️🚫✅❌🟢🔴]/g.test(content);
  const hasSections = content.includes('---') || /#{1,6}\s/.test(content);
  const hasListItems = /^\s*[\*\-\+]\s/m.test(content);

  const reportFeatures = {
    hasTable,
    hasEmojiTitles,
    hasSections,
    hasListItems,
    contentLength: content.length
  };

  console.log('结构化报告特征检测:', reportFeatures);

  if (hasTable || hasEmojiTitles || hasSections) {
    console.log('检测到结构化报告，进行格式化处理');

    let processedContent = content;

    // 优化表格格式
    if (hasTable) {
      processedContent = processedContent.replace(/(\n|^)(\|.*\|)\n/g, '\n\n$2\n');
      processedContent = processedContent.replace(/(\|.*\|\n)(---.*\n)/g, '$1\n\n$2\n');
      console.log('表格格式优化完成');
    }

    // 优化分隔线
    processedContent = processedContent.replace(/([^\n])\n(---+)\n([^\n])/g, '$1\n\n$2\n\n$3');

    // 优化emoji标题
    processedContent = processedContent.replace(/(^|\n)(#{1,6}\s*[📊📋🎯⚡🔍💡⚠️🚫✅❌🟢🔴][^#\n]*)/gm, '$1\n$2\n');

    // 优化列表项
    processedContent = processedContent.replace(/([^\n])\n(\s*[\*\-\+]\s[^\n]*)/g, '$1\n\n$2');

    // 清理多余的连续空行
    processedContent = processedContent.replace(/\n{3,}/g, '\n\n');

    console.log('结构化报告预处理完成');
    return processedContent.trim();
  }

  console.log('非结构化报告内容，跳过预处理');
  return content;
};

// 通用的AI回答内容解析函数
export const parseAnswerContent = (answer: string): string => {
  if (!answer || typeof answer !== 'string') {
    return answer || '';
  }
  
  try {
    const parsed = JSON.parse(answer);
    
    if (parsed && typeof parsed === 'object' && parsed.success && parsed.data !== undefined) {
      console.log('解析answer JSON成功，提取data字段:', parsed.data);
      return String(parsed.data);
    }
    
    console.log('answer JSON格式不符合预期，使用原始content');
    return answer;
    
  } catch (error) {
    console.log('answer不是有效JSON，使用原始content:', error);
    return answer;
  }
};

// 解析dataString中的JSON内容
export const parseDataString = (dataString: string): string => {
  try {
    console.log('开始解析dataString:', dataString);

    const firstLayerParsed = JSON.parse(dataString);
    console.log('第一层解析结果:', firstLayerParsed);

    if (firstLayerParsed && typeof firstLayerParsed === 'object') {
      // 检查新的数据结构：success=true, code=1, data字段包含实际内容
      if (firstLayerParsed.success === true && firstLayerParsed.code === 1 && firstLayerParsed.data !== undefined) {
        const dataContent = String(firstLayerParsed.data);

        const contentPreview = dataContent.length > 200 
          ? dataContent.substring(0, 200) + '...' 
          : dataContent;
        console.log('新格式接口成功提取到data字段内容预览:', contentPreview);

        // 保存重要的响应信息
        if (firstLayerParsed.conversationId) {
          console.log('提取到conversationId:', firstLayerParsed.conversationId);
        }
        if (firstLayerParsed.traceId) {
          console.log('提取到traceId:', firstLayerParsed.traceId);
        }

        // 检测内容类型并处理
        const contentType = detectContentType(dataContent);
        console.log('检测到的内容类型:', contentType);

        const hasMarkdown = dataContent.includes('##') || dataContent.includes('**') || dataContent.includes('- ');
        const hasEcharts = dataContent.includes('```echarts');
        const hasTable = dataContent.includes('|') && dataContent.includes('---');
        const hasEmojiTitles = /[📊📋🎯⚡🔍💡⚠️🚫✅❌🟢🔴]/g.test(dataContent);
        const isStructuredReport = hasTable || hasEmojiTitles || dataContent.includes('账户诊断') || dataContent.includes('报告');
        const isHTMLContent = contentType === 'html';

        const detailedAnalysis = {
          长度: dataContent.length,
          包含markdown: hasMarkdown,
          包含echarts图表: hasEcharts,
          包含表格: hasTable,
          包含emoji标题: hasEmojiTitles,
          疑似结构化报告: isStructuredReport,
          是否为HTML: isHTMLContent,
          内容类型: contentType,
          success: firstLayerParsed.success,
          code: firstLayerParsed.code
        };

        console.log('增强内容分析:', detailedAnalysis);

        // 根据内容类型进行不同的处理
        if (isHTMLContent) {
          console.log('检测到HTML内容，进行安全处理');
          const safeHTML = sanitizeHTML(dataContent);
          console.log('HTML内容安全处理完成，保持HTML格式用于专用渲染器');
          return safeHTML;
        } else if (isStructuredReport) {
          console.log('处理结构化报告内容');
          const processedContent = preprocessStructuredReport(dataContent);
          console.log('结构化报告处理完成，长度:', processedContent.length);
          return processedContent;
        } else if (hasEcharts) {
          console.log('检测到echarts图表，保持原格式');
          return dataContent;
        } else {
          console.log('普通内容，直接返回');
          return dataContent;
        }

      } else if (firstLayerParsed.success && firstLayerParsed.data !== undefined) {
        const dataContent = String(firstLayerParsed.data);
        console.log('兼容格式处理，提取data字段内容');
        return dataContent;
      } else if (firstLayerParsed.success === false && firstLayerParsed.msg) {
        console.log('接口返回错误信息:', firstLayerParsed.msg);
        return `处理失败：${firstLayerParsed.msg}`;
      } else if (firstLayerParsed.data !== undefined) {
        console.log('检测到直接data字段，使用兼容模式');
        return parseAnswerContent(String(firstLayerParsed.data));
      } else {
        console.log('数据结构不符合预期:', Object.keys(firstLayerParsed));
        return 'AI响应数据格式不符合预期';
      }
    } else {
      console.log('第一层解析结果不是有效对象，类型:', typeof firstLayerParsed);
      return 'AI响应数据格式错误：解析结果不是有效对象';
    }
  } catch (error) {
    console.error('解析dataString失败:', error);
    console.log('原始dataString长度:', dataString.length);
    console.log('原始dataString前100字符:', dataString.substring(0, 100));

    const errorMsg = error instanceof Error ? error.message : '未知错误';
    return `⚠️ **数据解析失败**\n\n错误详情: ${errorMsg}\n\n如果问题持续，请联系技术支持。`;
  }
};
