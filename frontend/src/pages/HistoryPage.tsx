import { useEffect, useState } from 'react';
import { activityApiService } from '../services';
import type { Activity } from '../types/activity.types';
import { HistoryItem } from '../components/history/HistoryItem';
import { History, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 20;

export function HistoryPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    loadActivities();
  }, []);

  async function loadActivities() {
    try {
      const res = await activityApiService.listActivities({
        take: 200,
        skip: 0,
      });
      const sorted = (res.data || []).sort(
        (a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
      );
      setActivities(sorted);
    } catch {
      // API may not be available
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(activities.length / PAGE_SIZE);
  const paged = activities.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-wider uppercase">
          History
        </h1>
        <p className="text-xs text-slate-500 uppercase tracking-widest mt-0.5">
          {activities.length} total sessions
        </p>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activities.length === 0 ? (
        <div className="p-12 flex flex-col items-center gap-4 text-center">
          <History size={48} className="text-slate-700" />
          <p className="text-slate-500 text-sm">No activities recorded yet</p>
          <p className="text-xs text-slate-600">
            Start tracking to see your history here
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paged.map((activity) => (
              <HistoryItem key={activity.id} activity={activity} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 py-4">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg bg-slate-800 border border-slate-700 disabled:opacity-30 text-slate-400 hover:text-white transition"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-slate-400 font-medium">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg bg-slate-800 border border-slate-700 disabled:opacity-30 text-slate-400 hover:text-white transition"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
