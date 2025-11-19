import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import MessageContent from './MessageContent';

interface HTMLContentRendererProps {
  htmlContent: string;
  className?: string;
}

interface VideoLoadState {
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
}

const HTMLContentRenderer: React.FC<HTMLContentRendererProps> = ({ htmlContent, className = '' }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoLoadStates, setVideoLoadStates] = useState<Map<string, VideoLoadState>>(new Map());
  
  // 解码HTML实体
  const decodeHTMLEntities = (text: string): string => {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
  };

  // 预处理文本内容，将HTML转换为Markdown友好的格式
  const preprocessTextForMarkdown = (htmlContent: string, textContent: string): string => {
    console.log('=== Preprocessing text for Markdown ===');
    console.log('Original textContent:', JSON.stringify(textContent.substring(0, 200)));
    console.log('Original htmlContent:', JSON.stringify(htmlContent.substring(0, 200)));

    let processedContent = textContent;

    // 处理JSON字符串中的转义换行符
    if (processedContent.includes('\\n')) {
      console.log('Found escaped newlines, converting...');
      processedContent = processedContent.replace(/\\n/g, '\n');
    }

    // 处理JSON字符串中的其他转义字符
    processedContent = processedContent
      .replace(/\\t/g, '\t')
      .replace(/\\r/g, '\r')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'");

    // 检查是否包含Markdown表格语法
    const tablePattern = /\|.*\|/;
    const separatorPattern = /[-=]{2,}/; // 更宽松的分隔符检测
    const hasTableSyntax = tablePattern.test(processedContent) && separatorPattern.test(processedContent);

    console.log('Table detection:', { hasTableSyntax, tablePattern: tablePattern.test(processedContent), separatorPattern: separatorPattern.test(processedContent) });

    if (hasTableSyntax) {
      console.log('Detected Markdown table in content');

      // 对于包含表格的内容，谨慎处理格式
      const lines = processedContent.split('\n');
      console.log('Table lines before processing:', lines.length, lines);

      const processedLines = lines.map(line => {
        // 只移除行首行尾的空白，保留表格结构
        return line.trim();
      }).filter((line, index, arr) => {
        // 只移除完全空白的行，但保留表格分隔符
        if (line === '') {
          // 检查前后行是否为表格行，如果是则保留这个空行可能是必要的
          const prevLine = arr[index - 1] || '';
          const nextLine = arr[index + 1] || '';
          return prevLine.includes('|') || nextLine.includes('|') ? false : true;
        }
        return true;
      });

      processedContent = processedLines.join('\n');
      console.log('Table lines after processing:', processedLines.length, processedLines);
    }

    // 处理<br/>标签转换为换行符
    if (htmlContent.includes('<br')) {
      processedContent = htmlContent
        .replace(/<br\s*\/?>/gi, '\n')  // 将<br>转换为换行符
        .replace(/<[^>]*>/g, '')        // 移除其他HTML标签
        .replace(/&nbsp;/g, ' ')        // 处理不间断空格
        .replace(/&amp;/g, '&')         // 处理HTML实体
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"');
    }

    // 确保换行符被保留
    processedContent = processedContent.trim();
    console.log('Final processed content:', JSON.stringify(processedContent.substring(0, 300)));
    console.log('=== End preprocessing ===');

    return processedContent;
  };

  // 检测是否为混合内容（第一行为###标题，后续为Markdown）
  const isMixedContent = (text: string): boolean => {
    if (!text || typeof text !== 'string') return false;

    const lines = text.trim().split('\n');
    if (lines.length < 2) return false;

    // 检查第一行是否以### 开头，且后续内容包含Markdown语法
    const firstLineIsTitle = lines[0].trim().startsWith('### ');
    const restContent = lines.slice(1).join('\n');

    return firstLineIsTitle && hasMarkdownSyntax(restContent, '');
  };

  // 验证表格的完整性
  const validateTableCompleteness = (text: string): boolean => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return false;

    // 找到所有包含表格分隔符的行
    const separatorLines = lines.filter(line => /^[\s\|]*[-=:]{2,}[\s\|]*$/.test(line.trim()));

    // 找到所有表格行
    const tableLines = lines.filter(line => line.includes('|'));

    console.log('Table validation:', {
      totalLines: lines.length,
      separatorLines: separatorLines.length,
      tableLines: tableLines.length,
      separators: separatorLines,
      firstFewTableLines: tableLines.slice(0, 3)
    });

    // 表格应该有至少1个分隔符行和至少2个表格行（表头+数据）
    return separatorLines.length >= 1 && tableLines.length >= 2;
  };

  // 检测是否包含Markdown表格
  const hasMarkdownTable = (text: string): boolean => {
    const hasTableColumns = /\|.*\|/.test(text);
    const hasSeparator = /[-=:]{2,}/.test(text) || /\|\s*[-:]+\s*\|/.test(text);
    const isComplete = hasTableColumns && hasSeparator && validateTableCompleteness(text);

    console.log('Table detection result:', { hasTableColumns, hasSeparator, isComplete, text: text.substring(0, 200) });
    return isComplete;
  };

  // 检测文本是否包含Markdown语法
  const hasMarkdownSyntax = (text: string, htmlContent: string = ''): boolean => {
    if (!text || typeof text !== 'string') return false;

    // 预处理文本
    const cleanText = preprocessTextForMarkdown(htmlContent, text);

    // Markdown语法模式
    const markdownPatterns = [
      /#{1,6}\s+.+/,           // 标题 (# ## ### 等)
      /\*\*[^*]+\*\*/,         // 加粗 (**text**)
      /\*[^*]+\*/,             // 斜体 (*text*)
      /^\s*\d+\.\s+/m,         // 有序列表 (1. 2. 3.)
      /^\s*[-*+]\s+/m,         // 无序列表 (- * +)
      /^\s*>\s+/m,             // 引用 (>)
      /`[^`]+`/,               // 行内代码 (`code`)
      /```[\s\S]*```/,         // 代码块 (```code```)
      /\[.*?\]\(.*?\)/,        // 链接 ([text](url))
      /!\[.*?\]\(.*?\)/,       // 图片 (![alt](url))
      /\|.*\|/                 // 表格 (|col1|col2|)
    ];

    // 检查是否匹配任何Markdown模式
    const hasMarkdown = markdownPatterns.some(pattern => pattern.test(cleanText));

    // 额外检查：如果文本很长且包含多个换行，很可能是结构化内容
    const lineCount = (cleanText.match(/\n/g) || []).length;
    const hasStructure = lineCount > 2 && (
      cleanText.includes('**') || 
      cleanText.includes('###') || 
      /^\s*\d+\./m.test(cleanText) ||
      hasMarkdownTable(cleanText)
    );

    const finalResult = hasMarkdown || hasStructure;

    console.log('Markdown detection:', { 
      text: cleanText.substring(0, 150), 
      hasMarkdown, 
      hasStructure, 
      lineCount, 
      finalResult 
    });
    return finalResult;
  };

  // 渲染混合内容（第一行标题 + 后续Markdown内容）
  const renderMixedContent = (content: string): JSX.Element => {
    const lines = content.trim().split('\n');
    const firstLine = lines[0].trim();
    const restContent = lines.slice(1).join('\n').trim();

    // 去除第一行的### 前缀，作为普通标题显示
    const titleText = firstLine.replace(/^###\s*/, '');

    console.log('Rendering mixed content:', { titleText, restContent: restContent.substring(0, 100) });

    return (
      <div className="mixed-content-container">
        <div className="text-sm font-semibold text-gray-100 mb-2">{titleText}</div>
        <MessageContent 
          content={restContent}
          className="text-gray-200 leading-normal text-sm [&_h1]:text-base [&_h1]:font-semibold [&_h1]:text-gray-100 [&_h1]:mt-2 [&_h1]:mb-1 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-gray-100 [&_h2]:mt-2 [&_h2]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-gray-100 [&_h3]:mt-1.5 [&_h3]:mb-0.5 [&_h4]:text-xs [&_h4]:font-semibold [&_h4]:text-gray-200 [&_h4]:mt-1 [&_h4]:mb-0.5 [&_p]:text-sm [&_p]:mb-1 [&_p]:leading-normal [&_li]:text-sm [&_li]:mb-0.5 [&_ul]:my-1 [&_ol]:my-1 [&_strong]:font-semibold [&_strong]:text-gray-100 [&_code]:bg-gray-700 [&_code]:px-1 [&_code]:rounded [&_code]:text-xs"
        />
      </div>
    );
  };

  // 获取视频MIME类型
  const getVideoMimeType = (url: string): string => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('.mp4') || lowerUrl.includes('mp4')) return 'video/mp4';
    if (lowerUrl.includes('.webm')) return 'video/webm';
    if (lowerUrl.includes('.ogg') || lowerUrl.includes('.ogv')) return 'video/ogg';
    if (lowerUrl.includes('.mov')) return 'video/quicktime';
    if (lowerUrl.includes('.avi')) return 'video/x-msvideo';
    
    // 默认返回mp4
    return 'video/mp4';
  };

  // 视频加载状态管理
  const updateVideoLoadState = (videoId: string, state: Partial<VideoLoadState>) => {
    setVideoLoadStates(prev => {
      const newStates = new Map(prev);
      const currentState = newStates.get(videoId) || { isLoading: false, hasError: false, errorMessage: '' };
      newStates.set(videoId, { ...currentState, ...state });
      return newStates;
    });
  };

  // 视频加载事件处理
  const handleVideoLoadStart = (videoId: string) => {
    console.log(`Video load started: ${videoId}`);
    updateVideoLoadState(videoId, { isLoading: true, hasError: false, errorMessage: '' });
  };

  const handleVideoLoadedData = (videoId: string) => {
    console.log(`Video data loaded: ${videoId}`);
    updateVideoLoadState(videoId, { isLoading: false, hasError: false, errorMessage: '' });
  };

  const handleVideoError = (videoId: string, error: Event) => {
    const target = error.target as HTMLVideoElement;
    let errorMessage = '视频加载失败';
    
    if (target.error) {
      switch (target.error.code) {
        case target.error.MEDIA_ERR_ABORTED:
          errorMessage = '视频加载被中止';
          break;
        case target.error.MEDIA_ERR_NETWORK:
          errorMessage = '网络错误，无法加载视频';
          break;
        case target.error.MEDIA_ERR_DECODE:
          errorMessage = '视频解码错误';
          break;
        case target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = '视频格式不支持';
          break;
        default:
          errorMessage = '未知视频错误';
      }
    }
    
    console.error(`Video error: ${videoId}`, errorMessage, error);
    updateVideoLoadState(videoId, { isLoading: false, hasError: true, errorMessage });
  };

  // 渲染视频组件
  const renderVideoElement = (src: string, poster?: string, sources?: Array<{src: string, type?: string}>, videoId?: string) => {
    const id = videoId || `video-${Math.random().toString(36).substr(2, 9)}`;
    const loadState = videoLoadStates.get(id) || { isLoading: false, hasError: false, errorMessage: '' };
    
    // 检查是否有视频源
    if (!src || src.trim() === '') {
      console.warn('Empty video source provided');
      return (
        <div className="w-full max-w-xs border border-red-500 rounded p-4 bg-red-900/20">
          <div className="flex items-center space-x-2 text-red-400">
            <Icon icon="mdi:alert-circle" className="text-lg" />
            <span className="text-sm">视频地址为空</span>
          </div>
        </div>
      );
    }

    if (loadState.hasError) {
      return (
        <div className="w-full max-w-xs border border-yellow-500 rounded p-4 bg-yellow-900/20">
          <div className="flex items-center space-x-2 text-yellow-400 mb-2">
            <Icon icon="mdi:video-off" className="text-lg" />
            <span className="text-sm">视频加载失败</span>
          </div>
          <div className="text-xs text-gray-400 mb-2">{loadState.errorMessage}</div>
          <button
            onClick={() => {
              updateVideoLoadState(id, { isLoading: false, hasError: false, errorMessage: '' });
              // 强制重新加载视频
              const videoElement = document.querySelector(`video[data-video-id="${id}"]`) as HTMLVideoElement;
              if (videoElement) {
                videoElement.load();
              }
            }}
            className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded transition-colors"
          >
            重新加载
          </button>
          <div className="text-xs text-gray-500 mt-2 break-all">
            URL: {src}
          </div>
        </div>
      );
    }

    return (
      <div className="video-container w-full max-w-[600px] mx-auto text-center py-2">
        {loadState.isLoading && (
          <div className="absolute inset-0 bg-gray-800/50 flex items-center justify-center rounded">
            <div className="flex items-center space-x-2 text-gray-300">
              <Icon icon="mdi:loading" className="text-lg animate-spin" />
              <span className="text-sm">加载中...</span>
            </div>
          </div>
        )}
        
        <video
          data-video-id={id}
          controls
          preload="metadata" // 预加载元数据
          className="video-player w-full h-[340px] rounded-lg shadow-lg border border-gray-600 bg-black"
          style={{ objectFit: 'contain' }}
          poster={poster}
          crossOrigin="anonymous" // 尝试处理跨域
          onLoadStart={() => handleVideoLoadStart(id)}
          onLoadedData={() => handleVideoLoadedData(id)}
          onError={(e) => handleVideoError(id, e)}
          onCanPlay={() => {
            console.log(`Video can play: ${id}`);
            updateVideoLoadState(id, { isLoading: false });
          }}
        >
          {/* 主要视频源 */}
          <source src={src} type={getVideoMimeType(src)} />
          
          {/* 额外的视频源 */}
          {sources && sources.map((source, index) => (
            source.src && source.src.trim() !== '' && (
              <source
                key={index}
                src={source.src}
                type={source.type || getVideoMimeType(source.src)}
              />
            )
          ))}
          
          {/* 不支持时的回退内容 */}
          <div className="p-4 text-center text-gray-400">
            <Icon icon="mdi:video-off" className="text-2xl mb-2 mx-auto" />
            <p className="text-sm">您的浏览器不支持视频播放</p>
            <p className="text-xs mt-1">
              建议使用最新版本的 Chrome、Firefox 或 Safari 浏览器
            </p>
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-blue-400 hover:text-blue-300 text-xs underline"
            >
              直接下载视频
            </a>
          </div>
        </video>

        {/* 全屏播放提示 */}
        <div className="fullscreen-hint mt-2 text-gray-400 text-xs">
          提示：点击播放器右下角全屏按钮或双击视频可全屏播放
        </div>
      </div>
    );
  };

  // 处理表格单元格内容
  const renderCellContent = (cellHTML: string, textContent: string) => {
    // 检查是否包含完整的HTML文档（视频内容）
    if (cellHTML.includes('<!DOCTYPE html>') || cellHTML.includes('<html')) {
      return renderEmbeddedHTML(cellHTML);
    }

    // 检查是否包含视频标签
    if (cellHTML.includes('<video')) {
      return renderVideoContent(cellHTML);
    }

    // 检查是否包含图片
    if (cellHTML.includes('<img')) {
      return renderImageContent(cellHTML);
    }

    // 检查是否包含链接或URL
    if (cellHTML.includes('<a') || textContent.includes('http')) {
      return renderLinkContent(cellHTML, textContent);
    }

    // 检查是否为Markdown内容
    // 优先级：如果有复杂HTML结构，使用HTML渲染；如果是纯文本或简单HTML且包含Markdown语法，使用Markdown渲染
    const hasComplexHTML = /<(table|div|video|img|h[1-6]|ul|ol|li)[^>]*>/i.test(cellHTML);
    const isSimpleHTML = cellHTML.includes('<br') && !hasComplexHTML; // 包含换行但不复杂的HTML

    // 检查是否为混合内容（第一行标题+后续Markdown）
    if ((isSimpleHTML || !hasComplexHTML)) {
      const processedContent = preprocessTextForMarkdown(cellHTML, textContent);

      if (isMixedContent(processedContent)) {
        console.log('Rendering cell content as mixed content:', {
          originalText: textContent.substring(0, 100),
          processedContent: processedContent.substring(0, 100)
        });

        return renderMixedContent(processedContent);
      }

      // 特别检查是否为纯Markdown表格内容
      if (hasMarkdownTable(processedContent)) {
        console.log('Rendering cell content as Markdown table:', {
          originalLength: textContent.length,
          processedLength: processedContent.length,
          lineCount: processedContent.split('\n').length,
          processedContent: processedContent.substring(0, 100)
        });

        return (
          <div className="markdown-table-content whitespace-pre-wrap break-words">
            <MessageContent 
              content={processedContent}
              className="text-gray-200 leading-normal text-sm [&_table]:w-full [&_table]:border-collapse [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-xs [&_th]:font-medium [&_th]:bg-gray-700/50 [&_th]:border [&_th]:border-gray-600 [&_td]:px-3 [&_td]:py-2 [&_td]:text-xs [&_td]:border [&_td]:border-gray-600 [&_td]:bg-gray-800/30"
            />
          </div>
        );
      }
    }

    if ((isSimpleHTML || !hasComplexHTML) && hasMarkdownSyntax(textContent, cellHTML)) {
      const processedContent = preprocessTextForMarkdown(cellHTML, textContent);
      console.log('Rendering cell content as Markdown:', {
        originalText: textContent.substring(0, 100),
        processedContent: processedContent.substring(0, 100),
        hasTable: hasMarkdownTable(processedContent),
        hasComplexHTML,
        isSimpleHTML
      });

      return (
        <div className="markdown-cell-content text-sm whitespace-pre-wrap break-words">
          <MessageContent 
            content={processedContent}
            className="text-gray-200 leading-normal text-sm [&_h1]:text-base [&_h1]:font-semibold [&_h1]:text-gray-100 [&_h1]:mt-2 [&_h1]:mb-1 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-gray-100 [&_h2]:mt-2 [&_h2]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-gray-100 [&_h3]:mt-1.5 [&_h3]:mb-0.5 [&_h4]:text-xs [&_h4]:font-semibold [&_h4]:text-gray-200 [&_h4]:mt-1 [&_h4]:mb-0.5 [&_p]:text-sm [&_p]:mb-1 [&_p]:leading-normal [&_li]:text-sm [&_li]:mb-0.5 [&_ul]:my-1 [&_ol]:my-1 [&_strong]:font-semibold [&_strong]:text-gray-100 [&_code]:bg-gray-700 [&_code]:px-1 [&_code]:rounded [&_code]:text-xs"
          />
        </div>
      );
    }

    // 普通内容
    return (
      <div 
        className="text-gray-200 text-sm leading-normal"
        dangerouslySetInnerHTML={{ __html: cellHTML }}
      />
    );
  };

  // 根据列内容类型获取列宽样式
  const getColumnWidth = (headerText: string, cellContent: string, columnIndex: number) => {
    const lowerHeader = headerText.toLowerCase();
    const lowerContent = cellContent.toLowerCase();
    
    // 视频ID列 - 较窄
    if (lowerHeader.includes('id') || lowerHeader.includes('序号')) {
      return 'w-[12%] min-w-[80px]';
    }
    // 视频地址列 - 最宽，用于视频播放
    if (lowerHeader.includes('视频') || lowerHeader.includes('video') || lowerContent.includes('<video') || lowerContent.includes('<!doctype')) {
      return 'w-[45%] min-w-[300px]';
    }
    // ASR和OCR列 - 中等宽度
    if (lowerHeader.includes('asr') || lowerHeader.includes('ocr') || lowerHeader.includes('文本')) {
      return 'w-[21.5%] min-w-[150px]';
    }
    // 默认列宽
    return 'w-auto min-w-[100px]';
  };

  // 渲染嵌入的HTML文档（主要用于视频内容）
  const renderEmbeddedHTML = (htmlContent: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      const videos = doc.querySelectorAll('video');
      
      if (videos.length > 0) {
        return (
          <div className="space-y-2">
            {Array.from(videos).map((video, index) => {
              // 优先从source标签获取视频地址，如果没有source则从video标签获取src
              let src = video.getAttribute('src') || '';
              const poster = video.getAttribute('poster') || undefined;
              const sources = Array.from(video.querySelectorAll('source')).map(source => ({
                src: source.getAttribute('src') || '',
                type: source.getAttribute('type') || undefined
              }));

              // 如果video标签没有直接的src，但有source子标签，使用第一个有效的source作为主src
              if ((!src || src.trim() === '') && sources.length > 0) {
                const firstValidSource = sources.find(source => source.src && source.src.trim() !== '');
                if (firstValidSource) {
                  src = firstValidSource.src;
                  console.log(`Using first source as main src for embedded video: ${src}`);
                }
              }
              
              const videoId = `embedded-video-${index}`;
              console.log(`Rendering embedded video ${videoId}:`, { src, poster, sources });
              
              return renderVideoElement(src, poster, sources, videoId);
            })}
          </div>
        );
      }

      return (
        <div 
          className="text-gray-200 text-sm"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      );
    } catch (error) {
      console.error('Embedded HTML parsing error:', error);
      return <span className="text-gray-200 text-sm">{htmlContent}</span>;
    }
  };

  // 渲染视频内容
  const renderVideoContent = (content: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<div>${content}</div>`, 'text/html');
      const video = doc.querySelector('video');
      
      if (!video) {
        return (
          <div className="w-full max-w-xs border border-red-500 rounded p-4 bg-red-900/20">
            <div className="flex items-center space-x-2 text-red-400">
              <Icon icon="mdi:alert-circle" className="text-lg" />
              <span className="text-sm">视频标签解析失败</span>
            </div>
          </div>
        );
      }

      // 优先从source标签获取视频地址，如果没有source则从video标签获取src
      let src = video.getAttribute('src') || '';
      const poster = video.getAttribute('poster') || undefined;
      const sources = Array.from(video.querySelectorAll('source')).map(source => ({
        src: source.getAttribute('src') || '',
        type: source.getAttribute('type') || undefined
      }));

      // 如果video标签没有直接的src，但有source子标签，使用第一个有效的source作为主src
      if ((!src || src.trim() === '') && sources.length > 0) {
        const firstValidSource = sources.find(source => source.src && source.src.trim() !== '');
        if (firstValidSource) {
          src = firstValidSource.src;
          console.log(`Using first source as main src: ${src}`);
        }
      }
      
      const videoId = `video-content-${Math.random().toString(36).substr(2, 9)}`;
      console.log(`Rendering video content ${videoId}:`, { src, poster, sources });

      return renderVideoElement(src, poster, sources, videoId);
    } catch (error) {
      console.error('Video content parsing error:', error);
      return (
        <div className="w-full max-w-xs border border-red-500 rounded p-4 bg-red-900/20">
          <div className="flex items-center space-x-2 text-red-400">
            <Icon icon="mdi:alert-circle" className="text-lg" />
            <span className="text-sm">视频解析异常</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">{error.message}</div>
        </div>
      );
    }
  };

  // 渲染图片内容
  const renderImageContent = (content: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<div>${content}</div>`, 'text/html');
      const img = doc.querySelector('img');
      
      if (!img) {
        return <span className="text-gray-400 text-sm">图片加载失败</span>;
      }

      const imgSrc = img.getAttribute('src') || '';
      const imgAlt = img.getAttribute('alt') || '图片';

      return (
        <img
          src={imgSrc}
          alt={imgAlt}
          className="max-w-full max-h-32 object-contain cursor-pointer border border-gray-600 rounded"
          onClick={() => setImagePreview(imgSrc)}
          loading="lazy"
        />
      );
    } catch (error) {
      return <span className="text-gray-400 text-sm">图片解析失败</span>;
    }
  };

  // 渲染链接内容
  const renderLinkContent = (htmlContent: string, textContent: string) => {
    // 自动识别URL并转换为链接
    const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/g;
    
    if (urlRegex.test(textContent)) {
      const parts = textContent.split(urlRegex);
      return (
        <div className="text-sm">
          {parts.map((part, index) => {
            if (part.match(urlRegex)) {
              return (
                <a
                  key={index}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline hover:text-blue-300 transition-colors"
                >
                  {part}
                </a>
              );
            }
            return <span key={index} className="text-gray-200">{part}</span>;
          })}
        </div>
      );
    }

    // 处理现有的a标签
    return (
      <div 
        className="text-sm"
        dangerouslySetInnerHTML={{ 
          __html: htmlContent.replace(
            /<a\s+([^>]*href="[^"]*"[^>]*)>/gi, 
            '<a $1 target="_blank" rel="noopener noreferrer" class="text-blue-400 underline hover:text-blue-300 transition-colors">'
          ) 
        }}
      />
    );
  };

  // 渲染表格
  const renderTable = (table: HTMLTableElement, index: number) => {
    const headers: string[] = [];
    const rows: { cells: string[], htmlCells: string[] }[] = [];
    
    // 提取表头
    const headerRow = table.querySelector('thead tr') || table.querySelector('tr:first-child');
    if (headerRow) {
      const headerCells = headerRow.querySelectorAll('th, td');
      headerCells.forEach(cell => {
        headers.push(cell.textContent?.trim() || '');
      });
    }

    // 提取数据行
    const bodyRows = table.querySelectorAll('tbody tr') || 
                     (table.querySelector('thead') ? 
                       table.querySelectorAll('tr:not(thead tr)') : 
                       table.querySelectorAll('tr:not(:first-child)'));
    
    bodyRows.forEach(row => {
      const cells: string[] = [];
      const htmlCells: string[] = [];
      const rowCells = row.querySelectorAll('td');
      
      rowCells.forEach(cell => {
        cells.push(cell.textContent?.trim() || '');
        htmlCells.push(cell.innerHTML || '');
      });
      
      if (cells.length > 0) {
        rows.push({ cells, htmlCells });
      }
    });

    return (
      <div className="mb-4 overflow-x-auto bg-gray-900/20 rounded-lg border border-gray-700">
        <table className="w-full border-collapse border border-gray-600">
          {headers.length > 0 && (
            <thead>
              <tr className="bg-gray-700/50">
                {headers.map((header, headerIndex) => (
                  <th
                    key={headerIndex}
                    className={`px-3 py-3 text-left text-sm font-medium text-gray-200 border border-gray-600 bg-gray-800/50 ${
                      getColumnWidth(header, '', headerIndex)}`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="bg-gray-800/30 hover:bg-gray-700/30 transition-colors">
                {row.htmlCells.map((cellHTML, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={`px-3 py-3 border border-gray-600 align-top ${
                      getColumnWidth(headers[cellIndex] || '', row.cells[cellIndex] || '', cellIndex)}`}
                  >
                    {renderCellContent(cellHTML, row.cells[cellIndex])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // 按顺序解析HTML内容
  const parseHTMLContentInOrder = () => {
    try {
      // 解码HTML实体
      let decodedContent = decodeHTMLEntities(htmlContent);
      
      // 创建DOM解析器
      const parser = new DOMParser();
      const doc = parser.parseFromString(decodedContent, 'text/html');

      const elements: JSX.Element[] = [];
      let elementIndex = 0;

      // 获取body中的所有直接子元素，按顺序处理
      const bodyElement = doc.body;
      if (!bodyElement) {
        return [];
      }

      // 遍历所有子节点（包括文本节点）
      const processNode = (node: Node): JSX.Element | null => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          
          // 处理标题
          if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(element.tagName)) {
            const level = parseInt(element.tagName[1]);
            let sizeClass = 'text-lg';
            
            if (level === 1) sizeClass = 'text-xl';
            else if (level === 2) sizeClass = 'text-lg';
            else if (level >= 3) sizeClass = 'text-base';
            
            return (
              <div key={`title-${elementIndex++}`} className="mb-2">
                <h1 className={`${sizeClass} font-semibold text-gray-200`}>
                  {element.textContent}
                </h1>
              </div>
            );
          }
          
          // 处理视频元素
          if (element.tagName === 'VIDEO') {
            // 优先从source标签获取视频地址，如果没有source则从video标签获取src
            let src = element.getAttribute('src') || '';
            const poster = element.getAttribute('poster') || undefined;
            const sources = Array.from(element.querySelectorAll('source')).map(source => ({
              src: source.getAttribute('src') || '',
              type: source.getAttribute('type') || undefined
            }));

            // 如果video标签没有直接的src，但有source子标签，使用第一个有效的source作为主src
            if ((!src || src.trim() === '') && sources.length > 0) {
              const firstValidSource = sources.find(source => source.src && source.src.trim() !== '');
              if (firstValidSource) {
                src = firstValidSource.src;
                console.log(`Using first source as main src for direct video: ${src}`);
              }
            }

            const videoId = `direct-video-${elementIndex++}`;
            console.log(`Rendering direct video element ${videoId}:`, { src, poster, sources });

            return (
              <div key={videoId} className="mb-4">
                {renderVideoElement(src, poster, sources, videoId)}
              </div>
            );
          }

          // 处理表格
          if (element.tagName === 'TABLE') {
            return (
              <div key={`table-${elementIndex++}`}>
                {renderTable(element as HTMLTableElement, elementIndex)}
              </div>
            );
          }
          
          // 处理段落
          if (element.tagName === 'P' && element.textContent?.trim()) {
            return (
              <div key={`p-${elementIndex++}`} className="mb-2">
                <div 
                  className="text-gray-200 text-sm leading-normal"
                  dangerouslySetInnerHTML={{ __html: element.innerHTML }}
                />
              </div>
            );
          }

          // 处理其他块级元素
          if (['DIV', 'SECTION', 'ARTICLE'].includes(element.tagName)) {
            // 首先检查这个容器是否包含视频
            const videos = element.querySelectorAll('video');
            if (videos.length > 0) {
              const videoElements: JSX.Element[] = [];
              videos.forEach((video, videoIndex) => {
                // 优先从source标签获取视频地址，如果没有source则从video标签获取src
                let src = video.getAttribute('src') || '';
                const poster = video.getAttribute('poster') || undefined;
                const sources = Array.from(video.querySelectorAll('source')).map(source => ({
                  src: source.getAttribute('src') || '',
                  type: source.getAttribute('type') || undefined
                }));

                // 如果video标签没有直接的src，但有source子标签，使用第一个有效的source作为主src
                if ((!src || src.trim() === '') && sources.length > 0) {
                  const firstValidSource = sources.find(source => source.src && source.src.trim() !== '');
                  if (firstValidSource) {
                    src = firstValidSource.src;
                    console.log(`Using first source as main src for container video: ${src}`);
                  }
                }

                const videoId = `container-video-${elementIndex}-${videoIndex}`;
                console.log(`Rendering container video element ${videoId}:`, { src, poster, sources });

                videoElements.push(renderVideoElement(src, poster, sources, videoId));
              });

              return (
                <div key={`video-container-${elementIndex++}`} className="mb-4 space-y-2">
                  {videoElements}
                </div>
              );
            }

            const childElements: JSX.Element[] = [];
            Array.from(element.childNodes).forEach(child => {
              const childElement = processNode(child);
              if (childElement) {
                childElements.push(childElement);
              }
            });
            
            if (childElements.length > 0) {
              return (
                <div key={`container-${elementIndex++}`}>
                  {childElements}
                </div>
              );
            }
          }
        }
        
        return null;
      };

      // 处理所有子节点
      Array.from(bodyElement.childNodes).forEach(node => {
        const element = processNode(node);
        if (element) {
          elements.push(element);
        }
      });

      return elements;
    } catch (error) {
      console.error('HTML解析错误:', error);
      return [];
    }
  };

  // 如果不是HTML内容，直接返回
  if (!htmlContent.includes('<') || !htmlContent.includes('>')) {
    return (
      <div className={`text-gray-200 text-sm leading-normal ${className}`}>
        {htmlContent}
      </div>
    );
  }

  const elements = parseHTMLContentInOrder();

  return (
    <>
      <div className={className}>
        {elements.length > 0 ? (
          <div>
            {elements}
          </div>
        ) : (
          <div 
            className="text-gray-200 text-sm leading-normal"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )}
      </div>

      {/* 图片预览模态框 */}
      {imagePreview && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setImagePreview(null)}
        >
          <div className="relative max-w-full max-h-full">
            <img
              src={imagePreview}
              alt="预览"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setImagePreview(null)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default HTMLContentRenderer;
