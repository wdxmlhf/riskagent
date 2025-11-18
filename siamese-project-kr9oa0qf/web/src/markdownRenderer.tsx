export const renderMarkdown = (content: string): string => {
  let html = content;

  html = html
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg shadow-lg my-4 max-w-full" />')
    .replace(/### (.*$)/gm, '<h3 class="text-lg font-semibold text-white mb-3 mt-6">$1</h3>')
    .replace(/## (.*$)/gm, '<h2 class="text-xl font-bold text-white mb-4 mt-6">$1</h2>')
    .replace(/# (.*$)/gm, '<h1 class="text-2xl font-bold text-white mb-4 mt-6">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-blue-300">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-900/50 px-2 py-1 rounded text-blue-400 text-sm font-mono">$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">$1</a>');

  const lines = html.split('\n');
  let processedLines: string[] = [];
  let inList = false;
  let inTable = false;
  let tableRows: string[] = [];
  let tableHeaderProcessed = false;

  // 改进的表格检测函数
  const isTableRow = (line: string): boolean => {
    // 更宽松的表格行检测：包含|且不是纯分隔符
    return line.includes('|') && !line.match(/^\s*\|[\s\-:=]+\|\s*$/) && line.trim().length > 0;
  };

  const isTableSeparator = (line: string): boolean => {
    // 检测表格分隔符行：|------|------|
    return /^\s*\|[\s\-:=]+\|\s*$/.test(line.trim()) || /^[\s\-:=|]+$/.test(line.trim());
  };

  const parseTableCells = (line: string): string[] => {
    // 更智能的单元格解析
    const trimmed = line.trim();
    let cells: string[];

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      // 标准格式：|cell1|cell2|cell3|
      cells = trimmed.slice(1, -1).split('|').map(cell => cell.trim());
    } else if (trimmed.includes('|')) {
      // 宽松格式：cell1|cell2|cell3
      cells = trimmed.split('|').map(cell => cell.trim());
    } else {
      cells = [trimmed];
    }

    return cells.filter(cell => cell.length > 0);
  };

  console.log('Processing markdown content with lines:', lines.length);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    console.log(`Line ${i}: "${trimmedLine}" | isTableRow: ${isTableRow(trimmedLine)} | isTableSeparator: ${isTableSeparator(trimmedLine)} | inTable: ${inTable}`);

    if (isTableRow(trimmedLine) || isTableSeparator(trimmedLine)) {
      // 开始表格处理
      if (!inTable) {
        console.log(`Starting table at line ${i}`);
        inTable = true;
        tableRows = [];
        tableHeaderProcessed = false;
      }

      // 跳过分隔符行
      if (isTableSeparator(trimmedLine)) {
        console.log(`Skipping separator line ${i}: "${trimmedLine}"`);
        continue;
      }

      // 解析表格单元格
      const cells = parseTableCells(trimmedLine);
      console.log(`Parsed cells from line ${i}:`, cells);

      if (cells.length === 0) continue;

      // 判断是否为表头
      if (!tableHeaderProcessed) {
        console.log(`Processing table header at line ${i}`);
        tableRows.push(`<thead><tr>${cells.map(cell => `<th class="px-4 py-3 bg-gray-700/80 text-left text-sm font-bold text-blue-300 border-b-2 border-blue-500">${cell}</th>`).join('')}</tr></thead><tbody>`);
        tableHeaderProcessed = true;
      } else {
        console.log(`Processing table data row at line ${i}`);
        tableRows.push(`<tr class="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">${cells.map(cell => `<td class="px-4 py-3 text-sm text-gray-200">${cell}</td>`).join('')}</tr>`);
      }

      // 检查表格是否结束
      const nextLine = lines[i + 1];
      const isLastLine = i === lines.length - 1;
      const nextLineIsNotTable = nextLine && !isTableRow(nextLine.trim()) && !isTableSeparator(nextLine.trim());

      if (isLastLine || nextLineIsNotTable) {
        console.log(`Ending table at line ${i}, nextLine: "${nextLine?.trim()}", isLastLine: ${isLastLine}, nextLineIsNotTable: ${nextLineIsNotTable}`);
        tableRows.push('</tbody>');
        const tableHtml = `<div class="overflow-x-auto my-6"><table class="w-full border-collapse bg-gray-800/50 rounded-lg overflow-hidden shadow-lg backdrop-blur-sm">${tableRows.join('')}</table></div>`;
        processedLines.push(tableHtml);
        console.log(`Complete table HTML:`, tableHtml);
        inTable = false;
        tableRows = [];
        tableHeaderProcessed = false;
      }
    } else if (line.match(/^[-*]\s+(.+)/)) {
      // 处理无序列表
      if (inTable) {
        // 如果在表格中遇到列表，结束表格
        tableRows.push('</tbody>');
        processedLines.push(`<div class="overflow-x-auto my-6"><table class="w-full border-collapse bg-gray-800/50 rounded-lg overflow-hidden shadow-lg backdrop-blur-sm">${tableRows.join('')}</table></div>`);
        inTable = false;
        tableRows = [];
        tableHeaderProcessed = false;
      }

      const content = line.replace(/^[-*]\s+/, '');
      if (!inList) {
        inList = true;
        processedLines.push('<ul class="list-disc list-inside space-y-2 my-4 text-gray-200 ml-4">');
      }
      processedLines.push(`<li class="leading-relaxed">${content}</li>`);

      if (i === lines.length - 1 || !lines[i + 1]?.match(/^[-*]\s+(.+)/)) {
        processedLines.push('</ul>');
        inList = false;
      }
    } else if (line.match(/^\d+\.\s+(.+)/)) {
      // 处理有序列表
      if (inTable) {
        // 如果在表格中遇到列表，结束表格
        tableRows.push('</tbody>');
        processedLines.push(`<div class="overflow-x-auto my-6"><table class="w-full border-collapse bg-gray-800/50 rounded-lg overflow-hidden shadow-lg backdrop-blur-sm">${tableRows.join('')}</table></div>`);
        inTable = false;
        tableRows = [];
        tableHeaderProcessed = false;
      }

      const content = line.replace(/^\d+\.\s+/, '');
      if (!inList) {
        inList = true;
        processedLines.push('<ol class="list-decimal list-inside space-y-2 my-4 text-gray-200 ml-4">');
      }
      processedLines.push(`<li class="leading-relaxed">${content}</li>`);

      if (i === lines.length - 1 || !lines[i + 1]?.match(/^\d+\.\s+(.+)/)) {
        processedLines.push('</ol>');
        inList = false;
      }
    } else if (line.match(/^```/)) {
      // 处理代码块
      if (inTable) {
        // 如果在表格中遇到代码块，结束表格
        tableRows.push('</tbody>');
        processedLines.push(`<div class="overflow-x-auto my-6"><table class="w-full border-collapse bg-gray-800/50 rounded-lg overflow-hidden shadow-lg backdrop-blur-sm">${tableRows.join('')}</table></div>`);
        inTable = false;
        tableRows = [];
        tableHeaderProcessed = false;
      }

      const nextCodeBlockIndex = lines.findIndex((l, idx) => idx > i && l.match(/^```/));
      if (nextCodeBlockIndex !== -1) {
        const codeContent = lines.slice(i + 1, nextCodeBlockIndex).join('\n');
        const language = line.replace(/^```/, '').trim();
        // 所有代码块统一处理（echarts由专门的组件处理）
          processedLines.push(`<pre class="bg-gray-900/80 rounded-lg p-4 my-4 overflow-x-auto border border-gray-700/50"><code class="text-sm text-green-400 font-mono">${codeContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`);
        i = nextCodeBlockIndex;
      }
    } else {
      // 处理普通文本
      if (inTable && trimmedLine.length > 0 && !isTableRow(trimmedLine)) {
        // 如果在表格中遇到非表格行，结束表格
        console.log(`Ending table due to non-table line at ${i}: "${trimmedLine}"`);
        tableRows.push('</tbody>');
        processedLines.push(`<div class="overflow-x-auto my-6"><table class="w-full border-collapse bg-gray-800/50 rounded-lg overflow-hidden shadow-lg backdrop-blur-sm">${tableRows.join('')}</table></div>`);
        inTable = false;
        tableRows = [];
        tableHeaderProcessed = false;
      }

      if (line.trim()) {
        processedLines.push(`<p class="leading-relaxed my-2 text-gray-200">${line}</p>`);
      } else {
        processedLines.push('<br/>');
      }
    }
  }

  // 处理未完成的表格（如果文件末尾是表格）
  if (inTable) {
    console.log('Ending table at end of content');
    tableRows.push('</tbody>');
    processedLines.push(`<div class="overflow-x-auto my-6"><table class="w-full border-collapse bg-gray-800/50 rounded-lg overflow-hidden shadow-lg backdrop-blur-sm">${tableRows.join('')}</table></div>`);
  }

  return processedLines.join('\n');
};

export const formatTimestamp = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const generateSampleResponses = () => {
  return [
    {
      content: `## 风险分析报告

基于您的查询，我们进行了全面的数据分析，以下是详细结果：

### 数据概览

| 指标名称 | 数值 | 同比增长 | 风险等级 |
|---------|------|---------|---------|
| 总订单量 | 15,234 | +23.5% | 低 |
| 退单量 | 1,456 | +45.2% | 高 |
| 转化率 | 9.56% | -8.3% | 中 |
| 客单价 | ¥156.80 | +12.1% | 低 |

### 趋势分析图表

![数据趋势图](https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800)

### 核心发现

- **异常峰值**: 在8月15日检测到退单率异常峰值达62%
- **地域分布**: 华东地区占比最高，达45.3%
- **设备类型**: iOS设备退单率明显高于Android

### 建议措施

1. 加强实时监控机制
2. 优化用户体验流程
3. 建立预警阈值系统
4. 定期复查数据模式

更多详细信息请访问[风控文档中心](https://example.com/docs)了解。`,
      hasTable: true,
      hasImage: true
    },
    {
      content: `## 流量质量分析报告

### 执行摘要

本次分析针对近30天的流量数据进行了深度挖掘，识别出多个潜在风险点。

### 详细数据表

| 时间段 | 流量来源 | 访问量 | 转化率 | 异常标记 |
|--------|---------|--------|--------|----------|
| 08:00-12:00 | 自然搜索 | 45,231 | 12.3% | 正常 |
| 12:00-18:00 | 付费广告 | 32,156 | 8.7% | 异常 |
| 18:00-22:00 | 社交媒体 | 28,945 | 15.6% | 正常 |
| 22:00-08:00 | 直接访问 | 12,087 | 6.2% | 可疑 |

### 流量来源分布

![流量分析图表](https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=800)

### 技术实现

使用以下算法进行分析：

\`\`\`python
def analyze_traffic(data):
    risk_score = calculate_risk(data)
    anomalies = detect_anomalies(data)
    return {
        'score': risk_score,
        'anomalies': anomalies
    }
\`\`\`

### 结论与建议

- 付费广告渠道需要优化投放策略
- 建议增加22:00-08:00时段的监控力度
- 社交媒体表现优秀，可适当增加预算`,
      hasTable: true,
      hasImage: true
    },
    {
      content: `## 用户行为分析深度报告

### 分析维度

本次分析覆盖以下关键维度：

| 维度 | 指标 | 阈值 | 当前值 | 状态 |
|-----|------|------|--------|------|
| 用户活跃度 | DAU/MAU | >0.35 | 0.42 | ✓ 健康 |
| 留存率 | 7日留存 | >40% | 38.5% | ⚠ 预警 |
| 付费转化 | ARPU | >¥50 | ¥68.2 | ✓ 优秀 |
| 流失率 | 月流失率 | <15% | 18.3% | ✗ 异常 |

### 用户画像

![用户画像分析](https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?auto=compress&cs=tinysrgb&w=800)

### 关键洞察

**高价值用户特征：**
1. 平均年龄25-35岁
2. 一线城市占比67%
3. 使用频率>5次/周
4. 付费意愿强

**风险用户识别：**
- 连续7天未登录
- 付费后立即卸载
- 异常退款申请

### 行动计划

详细的优化方案已同步至**项目管理系统**，请查看[任务列表](https://example.com/tasks)跟进执行。

![执行计划甘特图](https://images.pexels.com/photos/3184460/pexels-photo-3184460.jpeg?auto=compress&cs=tinysrgb&w=800)`,
      hasTable: true,
      hasImage: true
    }
  ];
};
