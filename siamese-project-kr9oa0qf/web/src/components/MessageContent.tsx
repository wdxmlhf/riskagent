import React from 'react';
import { renderMarkdown } from '../markdownRenderer';
import EChartsRenderer from './EChartsRenderer';
import HTMLContentRenderer from './HTMLContentRenderer';
import { parseContentWithCharts, hasCharts } from '../utils/contentParser';

export interface MessageContentProps {
  content: string;
  className?: string;
}

// 检测内容类型的辅助函数
const detectContentType = (content: string): 'html' | 'markdown' | 'text' => {
  // HTML检测：包含HTML标签且不是简单的markdown
  const htmlPattern = /<\/?[a-z][\s\S]*>/i;
  const complexHtmlPattern = /<(table|div|video|img|h[1-6])[^>]*>/i;
  
  // 如果包含复杂的HTML结构，认为是HTML内容
  if (complexHtmlPattern.test(content)) {
    return 'html';
  }
  
  // 如果包含基本HTML标签但也有markdown特征，优先使用markdown
  const markdownPattern = /#{1,6}\s|^\s*[-*+]\s|\*\*.*\*\*|\[.*\]\(.*\)|```/m;
  if (markdownPattern.test(content)) {
    return 'markdown';
  }
  
  // 如果只是简单的HTML标签，也使用HTML渲染
  if (htmlPattern.test(content)) {
    return 'html';
  }
  
  return 'text';
};

const MessageContent: React.FC<MessageContentProps> = ({ content, className = '' }) => {
  // 首先检查是否包含图表
  if (hasCharts(content)) {
    const parsedContent = parseContentWithCharts(content);
    
    return (
      <div className={`prose prose-sm max-w-none text-gray-200 font-medium ${className}`}>
        {parsedContent.textParts.map((textPart, index) => {
          // 检查是否为图表占位符
          const chartMatch = textPart.match(/^\[CHART:(.+)\]$/);
          
          if (chartMatch) {
            const chartId = chartMatch[1];
            const chartConfig = parsedContent.chartConfigs.find(c => c.id === chartId);
            
            if (chartConfig) {
              return (
                <EChartsRenderer
                  key={chartId}
                  id={chartId}
                  config={chartConfig.config}
                  height="400px"
                />
              );
            } else {
              return (
                <div key={index} className="text-red-400 text-sm">
                  图表渲染错误：找不到配置 {chartId}
                </div>
              );
            }
          } else {
            // 检测文本部分的内容类型
            const contentType = detectContentType(textPart);
            
            if (contentType === 'html') {
              return (
                <HTMLContentRenderer
                  key={index}
                  htmlContent={textPart}
                  className="mb-4"
                />
              );
            } else {
              // 使用markdown渲染
              return (
                <div
                  key={index}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(textPart) }}
                />
              );
            }
          }
        })}
      </div>
    );
  } else {
    // 没有图表，检测整体内容类型
    const contentType = detectContentType(content);
    
    if (contentType === 'html') {
      return (
        <HTMLContentRenderer
          htmlContent={content}
          className={`max-w-none ${className}`}
        />
      );
    } else {
      // 使用markdown渲染
      return (
        <div 
          className={`prose prose-sm max-w-none text-gray-200 font-medium ${className}`}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
      );
    }
  }
};

export default MessageContent;
