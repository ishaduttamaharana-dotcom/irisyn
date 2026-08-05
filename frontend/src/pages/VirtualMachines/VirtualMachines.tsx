import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/layouts/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { getVirtualMachines } from '@/services/vms.service';
import { VirtualMachine } from '@/types/domain';
import PageLoader from '@/components/loading/PageLoader';
import ErrorState from '@/components/error/ErrorState';
import { apiClient } from '@/services/apiClient';
import { Play, Square, RotateCcw, ArrowLeftRight, RefreshCw } from 'lucide-react';

const VirtualMachines = () => {
  const queryClient = useQueryClient();
  const [migratingVmName, setMigratingVmName] = useState<string | null>(null);
  const [migrationProgress, setMigrationProgress] = useState<number>(0);

  // Fetch live VMs
  const { data: vms = [], isLoading, error, refetch } = useQuery({
    queryKey: ['vms'],
    queryFn: getVirtualMachines,
  });

  // Action mutations
  const runActionMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      apiClient.post<VirtualMachine>(`/vms/${id}/${action}`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vms'] });
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      queryClient.invalidateQueries({ queryKey: ['cluster'] });
    },
  });

  const handleMigration = (id: string, name: string) => {
    setMigratingVmName(name);
    setMigrationProgress(0);

    // Simulate real-time progress steps for migration
    const interval = setInterval(() => {
      setMigrationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Trigger actual backend migration after animation completes
          runActionMutation.mutate(
            { id, action: 'migrate' },
            {
              onSettled: () => {
                setMigratingVmName(null);
              },
            }
          );
          return 100;
        }
        return prev + 25;
      });
    }, 500);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Virtual Machines" description="Consulting OpenShift Virtualization...">
        <PageLoader />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Virtual Machines" description="Offline">
        <ErrorState message="Failed to load virtual machines." onRetry={refetch} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Virtual Machines" description="Inventory and live VM orchestration via OpenShift Virtualization">
      <div className="space-y-6">
        
        {/* Active Migration Simulation Overlay */}
        {migratingVmName && (
          <div className="p-4 rounded-xl border border-brand-200 dark:border-brand-900 bg-brand-50/30 dark:bg-brand-950/10 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-brand-500">
                <RefreshCw className="animate-spin" size={14} />
                Live Migrating VM: <strong className="text-slate-800 dark:text-slate-200">{migratingVmName}</strong>
              </span>
              <span>{migrationProgress}% Complete</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-brand-500 transition-all duration-300" style={{ width: `${migrationProgress}%` }} />
            </div>
            <span className="text-[10px] text-slate-400">Copying VM memory page-table registers dynamically between nodes...</span>
          </div>
        )}

        <DataTable<VirtualMachine>
          rowKey={(v) => v.id}
          rows={vms}
          columns={[
            { key: 'name', header: 'Name', accessor: (v) => v.name },
            { key: 'host', header: 'Host Server ID', accessor: (v) => <span className="font-mono">{v.hostServerId}</span> },
            { key: 'status', header: 'Status', accessor: (v) => <Badge status={v.status} /> },
            { key: 'vcpu', header: 'vCPU', accessor: (v) => v.vcpu },
            { key: 'ram', header: 'RAM (GB)', accessor: (v) => v.ramGb },
            {
              key: 'actions',
              header: 'Actions',
              accessor: (v) => {
                const isOffline = v.status === 'OFFLINE';
                return (
                  <div className="flex items-center gap-2">
                    {isOffline ? (
                      <button
                        onClick={() => runActionMutation.mutate({ id: v.id, action: 'start' })}
                        title="Start VM"
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-500"
                      >
                        <Play size={14} />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => runActionMutation.mutate({ id: v.id, action: 'stop' })}
                          title="Stop VM"
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-500"
                        >
                          <Square size={14} />
                        </button>
                        <button
                          onClick={() => runActionMutation.mutate({ id: v.id, action: 'restart' })}
                          title="Restart VM"
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-500"
                        >
                          <RotateCcw size={14} />
                        </button>
                        <button
                          onClick={() => handleMigration(v.id, v.name)}
                          disabled={runActionMutation.isPending || !!migratingVmName}
                          title="Live Migrate VM"
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-brand-500 disabled:opacity-50"
                        >
                          <ArrowLeftRight size={14} />
                        </button>
                      </>
                    )}
                  </div>
                );
              },
            },
          ]}
        />
      </div>
    </DashboardLayout>
  );
};

export default VirtualMachines;
