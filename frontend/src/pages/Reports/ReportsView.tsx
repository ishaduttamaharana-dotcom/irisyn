import React from 'react';
import { useReports } from '@/hooks/usePlatformData';
import DataStateContainer from '@/components/ui/DataStateContainer';
import { FilePieChart, Download, FileText } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { data: reports, isLoading, isError, refetch } = useReports();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FilePieChart className="w-6 h-6 text-emerald-400" />
            <span>Operational Reports & Export</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generated platform health, telemetry freshness, and asset maintenance reports.
          </p>
        </div>
      </div>

      <DataStateContainer
        status="success"
        isLoading={isLoading}
        isError={isError}
        isEmpty={!reports || reports.length === 0}
        onRetry={refetch}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports?.map((report) => (
            <div
              key={report.id}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">{report.title}</h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Category: {report.category} • ID: {report.id}
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 uppercase">
                  {report.format}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span>Generated: {new Date(report.generatedAt).toLocaleDateString()}</span>
                <button className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 font-semibold transition-all">
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </DataStateContainer>
    </div>
  );
};

export default ReportsView;
