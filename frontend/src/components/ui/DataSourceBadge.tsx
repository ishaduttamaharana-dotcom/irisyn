import React from 'react';
import { AssetSource } from '../../types/domain';
import { Cpu, CpuIcon, Layers } from 'lucide-react';

interface DataSourceBadgeProps {
  source: AssetSource | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({
  source,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  let badgeStyles = 'inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-md transition-colors border';
  
  if (size === 'sm') {
    badgeStyles += ' px-2 py-0.5 text-[10px]';
  } else if (size === 'lg') {
    badgeStyles += ' px-3 py-1.5 text-xs';
  } else {
    badgeStyles += ' px-2.5 py-1 text-xs';
  }

  const normSource = source?.toUpperCase() || '';

  if (normSource.includes('LOCAL') || normSource.includes('REAL-TIME')) {
    badgeStyles += ' bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    return (
      <span className={`${badgeStyles} ${className}`} title="Live hardware telemetry from local host laptop/computer">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        {showIcon && <Cpu className="w-3.5 h-3.5 text-emerald-400" />}
        <span>REAL-TIME LOCAL</span>
      </span>
    );
  }

  if (normSource.includes('SIMULATED') || normSource.includes('SIM')) {
    badgeStyles += ' bg-purple-500/10 text-purple-300 border-purple-500/30';
    return (
      <span className={`${badgeStyles} ${className}`} title="Physics-based synthetic industrial asset data">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
        {showIcon && <CpuIcon className="w-3.5 h-3.5 text-purple-300" />}
        <span>SIMULATED</span>
      </span>
    );
  }

  // Default to TARGET / FUTURE
  badgeStyles += ' bg-indigo-500/10 text-indigo-300 border-indigo-500/30 border-dashed';
  return (
    <span className={`${badgeStyles} ${className}`} title="Target / Future industrial edge protocol (PLC, MQTT, OPC-UA, Red Hat Edge)">
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
      {showIcon && <Layers className="w-3.5 h-3.5 text-indigo-400" />}
      <span>TARGET / FUTURE</span>
    </span>
  );
};

export default DataSourceBadge;
