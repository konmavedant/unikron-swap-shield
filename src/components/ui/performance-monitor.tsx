import { useEffect, memo } from 'react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

interface PerformanceMonitorProps {
  componentName: string;
  children: React.ReactNode;
  trackProps?: Record<string, any>;
}

const PerformanceMonitorComponent = ({ 
  componentName, 
  children, 
  trackProps = {} 
}: PerformanceMonitorProps) => {
  const { measure } = usePerformanceMonitor();

  useEffect(() => {
    const renderStart = performance.now();
    
    return () => {
      measure(`${componentName}-render`, () => {
        const renderTime = performance.now() - renderStart;
        return renderTime;
      }, {
        component: componentName,
        props: Object.keys(trackProps),
        ...trackProps,
      });
    };
  }, [componentName, measure, trackProps]);

  return <>{children}</>;
};

export const PerformanceMonitor = memo(PerformanceMonitorComponent);