// 📁 src/features/dashboard/components/OperationalQueue.jsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import {
  X,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  User,
  Clock,
} from 'lucide-react';
import {
  MOCK_MODE as USERS_MOCK_MODE,
  MOCK_USERS,
} from '../../admin/api/usersApi';

const PRIORITY = {
  high: { bg: 'bg-red-100', text: 'text-red-700', label: 'high' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'medium' },
  low: { bg: 'bg-green-100', text: 'text-green-700', label: 'low' },
};
const TABS = ['unassigned', 'overdue', 'stale'];
const TAB_ICON = { unassigned: User, overdue: Clock, stale: Clock };
const columnHelper = createColumnHelper();

export default function OperationalQueue({ queue = [] }) {
  const [activeTab, setActiveTab] = useState('unassigned');
  const [assignItem, setAssignItem] = useState(null);
  const [successItem, setSuccessItem] = useState(null);
  const navigate = useNavigate();

  const counts = useMemo(
    () =>
      TABS.reduce((acc, tab) => {
        acc[tab] = queue.filter((r) => r.status === tab).length;
        return acc;
      }, {}),
    [queue],
  );
  const filteredData = useMemo(
    () => queue.filter((r) => r.status === activeTab),
    [queue, activeTab],
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: '',
        cell: (info) => {
          const row = info.row.original;
          const p = PRIORITY[row.priority] ?? PRIORITY.low;
          const ok = successItem === row.id;
          return (
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-[#2D368E]">
                  {row.name}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.bg} ${p.text}`}
                >
                  {p.label}
                </span>
                {row.itemType === 'tour' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">
                    Tour
                  </span>
                )}
                {row.itemType === 'enquiry' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                    Enquiry
                  </span>
                )}
                {ok && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                    <CheckCircle size={11} /> Assigned
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400 flex-wrap">
                <span className="text-slate-500 font-medium">
                  {row.property}
                </span>
                <span>•</span>
                <span>{row.source}</span>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  <span>
                    <Clock size={12} />
                  </span>
                  {row.elapsed}
                </span>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('id', {
        header: '',
        cell: (info) => {
          const row = info.row.original;
          // Only show arrow for tours
          if (row.itemType === 'tour') {
            return (
              <button
                onClick={() =>
                  navigate('/admin/tour-requests', {
                    state: { tourId: row.rawId },
                  })
                }
                className="text-orange-500 hover:text-orange-600 cursor-pointer p-1"
                title="Go to Tour Details"
              >
                <ArrowRight size={18} />
              </button>
            );
          }
          return null;
        },
        size: 50,
      }),
    ],
    [successItem],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <>
      {assignItem && (
        <AssignModal
          item={assignItem}
          onClose={() => setAssignItem(null)}
          onSuccess={() => {
            setSuccessItem(assignItem.id);
            setTimeout(() => setSuccessItem(null), 3000);
          }}
        />
      )}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-slate-50">
          <h3 className="text-sm font-bold text-[#2D368E]">
            Operational Queues
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Leads requiring attention
          </p>
        </div>
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-100">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${isActive ? 'bg-[#2D368E] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                {(() => {
                  const TabIcon = TAB_ICON[tab];
                  return <TabIcon size={12} />;
                })()}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs font-bold min-w-[18px] text-center ${isActive ? 'bg-white text-[#2D368E]' : 'bg-slate-200 text-slate-600'}`}
                >
                  {counts[tab] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
        <div className="overflow-y-auto max-h-[320px]">
          {table.getRowModel().rows.length === 0 ? (
            <div className="px-6 py-10 text-center text-slate-400 text-sm">
              No {activeTab} items
            </div>
          ) : (
            <table className="w-full">
              <tbody className="divide-y divide-slate-50">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4"
                        style={
                          cell.column.columnDef.size
                            ? { width: cell.column.columnDef.size }
                            : {}
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
