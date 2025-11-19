import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export interface EChartsRendererProps {
  config: any;
  id: string;
  height?: string;
  className?: string;
}

const EChartsRenderer: React.FC<EChartsRendererProps> = ({ 
  config, 
  id, 
  height = '400px',
  className = ''
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current || !config) return;

    try {
      // 销毁可能存在的旧实例
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
      }

      // 注册自定义主题
      registerCustomTheme();

      // 创建新的图表实例，使用自定义主题
      chartInstanceRef.current = echarts.init(chartRef.current, 'riskAgent');

      // 处理图表配置的兼容性
      const processedConfig = processChartConfig(config);
      const enhancedConfig = enhanceChartStyle(processedConfig);

      // 设置图表配置
      chartInstanceRef.current.setOption({
        backgroundColor: 'transparent',
        ...processedConfig
      });

      // 响应式调整
      const handleResize = () => {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.resize();
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (chartInstanceRef.current) {
          chartInstanceRef.current.dispose();
          chartInstanceRef.current = null;
        }
      };
    } catch (error) {
      console.error('ECharts渲染失败:', error);
    }
  }, [config]);

  // 注册自定义主题
  const registerCustomTheme = () => {
    const customTheme = {
      color: [
        '#3B82F6', // 蓝色
        '#10B981', // 绿色
        '#F59E0B', // 黄色
        '#EF4444', // 红色
        '#8B5CF6', // 紫色
        '#06B6D4', // 青色
        '#F97316', // 橙色
        '#EC4899', // 粉色
        '#84CC16', // 青绿色
        '#6366F1'  // 靛蓝色
      ],
      backgroundColor: 'transparent',
      textStyle: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        color: '#E5E7EB',
        fontSize: 13,
        fontWeight: 500
      },
      title: {
        textStyle: {
          color: '#F9FAFB',
          fontSize: 18,
          fontWeight: 600
        },
        subtextStyle: {
          color: '#D1D5DB',
          fontSize: 14
        }
      },
      line: {
        itemStyle: {
          borderWidth: 3
        },
        lineStyle: {
          width: 3
        },
        symbolSize: 8,
        symbol: 'emptyCircle',
        smooth: true
      },
      radar: {
        itemStyle: {
          borderWidth: 2
        },
        lineStyle: {
          width: 2
        },
        symbolSize: 6,
        symbol: 'emptyCircle',
        smooth: true
      },
      bar: {
        itemStyle: {
          barBorderWidth: 0,
          barBorderColor: '#ccc'
        }
      },
      pie: {
        itemStyle: {
          borderWidth: 0,
          borderColor: '#ccc'
        }
      },
      scatter: {
        itemStyle: {
          borderWidth: 0,
          borderColor: '#ccc'
        }
      },
      boxplot: {
        itemStyle: {
          borderWidth: 0,
          borderColor: '#ccc'
        }
      },
      parallel: {
        itemStyle: {
          borderWidth: 0,
          borderColor: '#ccc'
        }
      },
      sankey: {
        itemStyle: {
          borderWidth: 0,
          borderColor: '#ccc'
        }
      },
      funnel: {
        itemStyle: {
          borderWidth: 0,
          borderColor: '#ccc'
        }
      },
      gauge: {
        itemStyle: {
          borderWidth: 0,
          borderColor: '#ccc'
        }
      },
      candlestick: {
        itemStyle: {
          color: '#10B981',
          color0: '#EF4444',
          borderColor: '#10B981',
          borderColor0: '#EF4444',
          borderWidth: 1
        }
      },
      graph: {
        itemStyle: {
          borderWidth: 0,
          borderColor: '#ccc'
        },
        lineStyle: {
          width: 2,
          color: '#6B7280'
        },
        symbolSize: 8,
        symbol: 'emptyCircle',
        smooth: true,
        label: {
          color: '#F3F4F6'
        }
      },
      categoryAxis: {
        axisLine: {
          show: true,
          lineStyle: {
            color: '#4B5563'
          }
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: '#4B5563'
          }
        },
        axisLabel: {
          show: true,
          color: '#9CA3AF'
        },
        splitLine: {
          show: false,
          lineStyle: {
            color: ['#374151']
          }
        },
        splitArea: {
          show: false,
          areaStyle: {
            color: ['rgba(55, 65, 81, 0.1)', 'rgba(55, 65, 81, 0.05)']
          }
        }
      },
      valueAxis: {
        axisLine: {
          show: true,
          lineStyle: {
            color: '#4B5563'
          }
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: '#4B5563'
          }
        },
        axisLabel: {
          show: true,
          color: '#9CA3AF'
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: ['#374151'],
            type: 'dashed'
          }
        },
        splitArea: {
          show: false,
          areaStyle: {
            color: ['rgba(55, 65, 81, 0.1)', 'rgba(55, 65, 81, 0.05)']
          }
        }
      },
      logAxis: {
        axisLine: {
          show: true,
          lineStyle: {
            color: '#4B5563'
          }
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: '#4B5563'
          }
        },
        axisLabel: {
          show: true,
          color: '#9CA3AF'
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: ['#374151'],
            type: 'dashed'
          }
        },
        splitArea: {
          show: false,
          areaStyle: {
            color: ['rgba(55, 65, 81, 0.1)', 'rgba(55, 65, 81, 0.05)']
          }
        }
      },
      timeAxis: {
        axisLine: {
          show: true,
          lineStyle: {
            color: '#4B5563'
          }
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: '#4B5563'
          }
        },
        axisLabel: {
          show: true,
          color: '#9CA3AF'
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: ['#374151'],
            type: 'dashed'
          }
        },
        splitArea: {
          show: false,
          areaStyle: {
            color: ['rgba(55, 65, 81, 0.1)', 'rgba(55, 65, 81, 0.05)']
          }
        }
      },
      toolbox: {
        color: ['#9CA3AF', '#9CA3AF', '#9CA3AF', '#9CA3AF']
      },
      legend: {
        textStyle: {
          color: '#E5E7EB',
          fontSize: 13,
          fontWeight: 500
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        borderColor: '#4B5563',
        borderWidth: 1,
        textStyle: {
          color: '#F3F4F6',
          fontSize: 12
        },
        extraCssText: 'border-radius: 8px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);'
      },
      timeline: {
        lineStyle: {
          color: '#4B5563',
          width: 2
        },
        itemStyle: {
          color: '#3B82F6',
          borderWidth: 1
        },
        controlStyle: {
          color: '#3B82F6',
          borderColor: '#3B82F6',
          borderWidth: 1
        },
        checkpointStyle: {
          color: '#10B981',
          borderColor: '#065F46'
        },
        label: {
          color: '#9CA3AF'
        },
        emphasis: {
          itemStyle: {
            color: '#60A5FA'
          },
          controlStyle: {
            color: '#60A5FA',
            borderColor: '#60A5FA',
            borderWidth: 2
          },
          label: {
            color: '#E5E7EB'
          }
        }
      },
      visualMap: {
        color: ['#EF4444', '#F59E0B', '#10B981']
      },
      dataZoom: {
        backgroundColor: 'rgba(17, 24, 39, 0.3)',
        dataBackgroundColor: 'rgba(75, 85, 99, 0.3)',
        fillerColor: 'rgba(59, 130, 246, 0.2)',
        handleColor: '#3B82F6',
        handleSize: '100%',
        textStyle: {
          color: '#9CA3AF'
        }
      },
      markPoint: {
        label: {
          color: '#F3F4F6'
        },
        emphasis: {
          label: {
            color: '#F3F4F6'
          }
        }
      }
    };

    // 注册主题
    try {
      echarts.registerTheme('riskAgent', customTheme);
    } catch (error) {
      console.warn('主题注册失败:', error);
    }
  };

  // 增强图表样式
  const enhanceChartStyle = (originalConfig: any) => {
    let enhancedConfig = { ...originalConfig };

    // 增强图例样式
    if (enhancedConfig.legend) {
      enhancedConfig.legend = {
        ...enhancedConfig.legend,
        textStyle: {
          color: '#E5E7EB',
          fontSize: 13,
          fontWeight: 500,
          ...enhancedConfig.legend.textStyle
        },
        itemGap: 20,
        padding: [10, 0]
      };
    }

    // 增强工具提示样式
    if (!enhancedConfig.tooltip) {
      enhancedConfig.tooltip = {};
    }
    enhancedConfig.tooltip = {
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      borderColor: '#4B5563',
      borderWidth: 1,
      textStyle: {
        color: '#F3F4F6',
        fontSize: 12,
        fontWeight: 500
      },
      padding: [12, 16],
      extraCssText: 'border-radius: 8px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5); backdrop-filter: blur(8px);',
      ...enhancedConfig.tooltip
    };

    // 增强系列样式
    if (enhancedConfig.series) {
      enhancedConfig.series = enhancedConfig.series.map((series: any) => {
        let enhancedSeries = { ...series };

        // 图形样式增强
        if (series.type === 'graph') {
          enhancedSeries = {
            ...enhancedSeries,
            itemStyle: {
              borderColor: '#1F2937',
              borderWidth: 3,
              shadowBlur: 15,
              shadowColor: 'rgba(0, 0, 0, 0.3)',
              ...series.itemStyle
            },
            lineStyle: {
              width: 3,
              opacity: 0.8,
              curveness: 0.1,
              ...series.lineStyle
            },
            label: {
              color: '#F3F4F6',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              backgroundColor: 'rgba(17, 24, 39, 0.8)',
              borderRadius: 6,
              padding: [6, 10],
              borderColor: '#4B5563',
              borderWidth: 1,
              ...series.label
            },
            emphasis: {
              focus: 'adjacency',
              itemStyle: {
                shadowBlur: 25,
                shadowColor: 'rgba(59, 130, 246, 0.6)',
                borderWidth: 4
              },
              lineStyle: {
                width: 5,
                opacity: 1
              },
              label: {
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: '#3B82F6'
              },
              ...series.emphasis
            }
          };
        } else if (series.type === 'bar') {
          enhancedSeries = {
            ...enhancedSeries,
            itemStyle: {
              borderRadius: [4, 4, 0, 0],
              shadowBlur: 8,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
              ...series.itemStyle
            }
          };
        } else if (series.type === 'line') {
          enhancedSeries = {
            ...enhancedSeries,
            lineStyle: {
              width: 3,
              shadowBlur: 5,
              shadowColor: 'rgba(0, 0, 0, 0.3)',
              ...series.lineStyle
            },
            itemStyle: {
              shadowBlur: 8,
              shadowColor: 'rgba(0, 0, 0, 0.3)',
              ...series.itemStyle
            }
          };
        } else if (series.type === 'pie') {
          enhancedSeries = {
            ...enhancedSeries,
            itemStyle: {
              borderColor: '#1F2937',
              borderWidth: 2,
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.3)',
              ...series.itemStyle
            },
            label: {
              color: '#F3F4F6',
              fontSize: 12,
              fontWeight: 600,
              ...series.label
            }
          };
        }

        return enhancedSeries;
      });
    }

    return enhancedConfig;
  };

  // 处理图表配置的兼容性
  const processChartConfig = (originalConfig: any) => {
    let processedConfig = { ...originalConfig };

    // 处理focusNodeAdjacency转换
    if (processedConfig.series) {
      processedConfig.series = processedConfig.series.map((series: any) => {
        if (series.type === 'graph' && series.focusNodeAdjacency !== undefined) {
          // 将focusNodeAdjacency转换为新的emphasis配置
          const newSeries = { ...series };
          delete newSeries.focusNodeAdjacency;
          
          if (!newSeries.emphasis) {
            newSeries.emphasis = {};
          }
          
          newSeries.emphasis.focus = series.focusNodeAdjacency ? 'adjacency' : 'none';
          
          return newSeries;
        }
        return series;
      });
    }

    // 处理legend配置
    if (processedConfig.legend) {
      if (processedConfig.legend.show === undefined) {
        processedConfig.legend.show = true;
      }
    }

    return processedConfig;
  };

  if (!config) {
    return (
      <div className={`bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl p-4 border border-gray-600/40 ${className}`}>
        <div className="text-gray-400 text-center">图表配置无效</div>
      </div>
    );
  }

  return (
    <div className={`my-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl p-6 border border-gray-600/40 shadow-xl ${className}`}>
      <div
        ref={chartRef}
        id={id}
        style={{ width: '100%', height }}
        className="echarts-container"
      />
    </div>
  );
};

export default EChartsRenderer;
