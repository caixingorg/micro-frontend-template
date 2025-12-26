import React, { useState, useEffect } from 'react';
import { FloatButton, Modal, Card, Statistic, Row, Col, Progress } from 'antd';
import { MonitorOutlined, CloseOutlined } from '@ant-design/icons';

interface PerformanceData {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  memoryUsage: number;
  jsHeapSizeUsed: number;
  jsHeapSizeTotal: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);

  useEffect(() => {
    const collectPerformanceData = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const memory = (performance as any).memory;

      let fcp = 0;
      let lcp = 0;

      // 获取 First Contentful Paint
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
      if (fcpEntry) {
        fcp = fcpEntry.startTime;
      }

      // 获取 Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) {
              lcp = lastEntry.startTime;
            }
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          console.warn('LCP observation failed:', e);
        }
      }

      const data: PerformanceData = {
        loadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
        domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : 0,
        firstContentfulPaint: fcp,
        largestContentfulPaint: lcp,
        memoryUsage: memory ? memory.usedJSHeapSize / 1048576 : 0, // MB
        jsHeapSizeUsed: memory ? memory.usedJSHeapSize / 1048576 : 0, // MB
        jsHeapSizeTotal: memory ? memory.totalJSHeapSize / 1048576 : 0, // MB
      };

      setPerformanceData(data);
    };

    // 收集性能数据
    if (document.readyState === 'complete') {
      collectPerformanceData();
    } else {
      window.addEventListener('load', collectPerformanceData);
    }

    // 定期更新内存使用情况
    const interval = setInterval(() => {
      const memory = (performance as any).memory;
      if (memory) {
        setPerformanceData(prev => prev ? {
          ...prev,
          memoryUsage: memory.usedJSHeapSize / 1048576,
          jsHeapSizeUsed: memory.usedJSHeapSize / 1048576,
          jsHeapSizeTotal: memory.totalJSHeapSize / 1048576,
        } : null);
      }
    }, 5000);

    return () => {
      window.removeEventListener('load', collectPerformanceData);
      clearInterval(interval);
    };
  }, []);

  const getPerformanceScore = (loadTime: number) => {
    if (loadTime < 1000) return { score: 100, color: '#52c41a', status: '优秀' };
    if (loadTime < 2500) return { score: 85, color: '#faad14', status: '良好' };
    if (loadTime < 4000) return { score: 60, color: '#fa8c16', status: '一般' };
    return { score: 30, color: '#f5222d', status: '需优化' };
  };

  if (!performanceData) {
    return (
      <FloatButton
        icon={<MonitorOutlined />}
        tooltip="性能监控"
        onClick={() => setVisible(true)}
        style={{ right: 24, bottom: 24 }}
      />
    );
  }

  const performanceScore = getPerformanceScore(performanceData.loadTime);
  const memoryUsagePercent = performanceData.jsHeapSizeTotal > 0
    ? Math.round((performanceData.jsHeapSizeUsed / performanceData.jsHeapSizeTotal) * 100)
    : 0;

  return (
    <>
      <FloatButton
        icon={<MonitorOutlined />}
        tooltip="性能监控"
        onClick={() => setVisible(true)}
        style={{ right: 24, bottom: 24 }}
        badge={{
          count: performanceScore.score,
          color: performanceScore.color,
          size: 'small',
        }}
      />

      <Modal
        title="性能监控面板"
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={800}
        closeIcon={<CloseOutlined />}
      >
        <div style={{ padding: '16px 0' }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="页面加载性能" size="small">
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <Progress
                    type="circle"
                    percent={performanceScore.score}
                    strokeColor={performanceScore.color}
                    format={() => (
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                          {performanceScore.score}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {performanceScore.status}
                        </div>
                      </div>
                    )}
                  />
                </div>
                <Statistic
                  title="页面加载时间"
                  value={performanceData.loadTime}
                  suffix="ms"
                  precision={0}
                />
                <Statistic
                  title="DOM 内容加载时间"
                  value={performanceData.domContentLoaded}
                  suffix="ms"
                  precision={0}
                  style={{ marginTop: 8 }}
                />
              </Card>
            </Col>

            <Col span={12}>
              <Card title="内存使用情况" size="small">
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <Progress
                    type="circle"
                    percent={memoryUsagePercent}
                    strokeColor={memoryUsagePercent > 80 ? '#f5222d' : '#52c41a'}
                    format={() => `${memoryUsagePercent}%`}
                  />
                </div>
                <Statistic
                  title="已用内存"
                  value={performanceData.jsHeapSizeUsed}
                  suffix="MB"
                  precision={1}
                />
                <Statistic
                  title="总内存"
                  value={performanceData.jsHeapSizeTotal}
                  suffix="MB"
                  precision={1}
                  style={{ marginTop: 8 }}
                />
              </Card>
            </Col>

            <Col span={12}>
              <Card title="渲染性能" size="small">
                <Statistic
                  title="首次内容绘制 (FCP)"
                  value={performanceData.firstContentfulPaint}
                  suffix="ms"
                  precision={0}
                />
                <Statistic
                  title="最大内容绘制 (LCP)"
                  value={performanceData.largestContentfulPaint || 0}
                  suffix="ms"
                  precision={0}
                  style={{ marginTop: 8 }}
                />
              </Card>
            </Col>

            <Col span={12}>
              <Card title="优化建议" size="small">
                <div style={{ fontSize: '14px', lineHeight: '20px' }}>
                  {performanceData.loadTime > 3000 && (
                    <div style={{ color: '#fa8c16', marginBottom: 8 }}>
                      • 页面加载时间较长，建议优化资源加载
                    </div>
                  )}
                  {memoryUsagePercent > 80 && (
                    <div style={{ color: '#f5222d', marginBottom: 8 }}>
                      • 内存使用率过高，可能存在内存泄漏
                    </div>
                  )}
                  {performanceData.firstContentfulPaint > 2000 && (
                    <div style={{ color: '#fa8c16', marginBottom: 8 }}>
                      • 首次内容绘制时间较长，建议优化关键资源
                    </div>
                  )}
                  {performanceScore.score >= 85 && (
                    <div style={{ color: '#52c41a' }}>
                      ✓ 页面性能表现良好
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </Modal>
    </>
  );
};

export default PerformanceMonitor;
