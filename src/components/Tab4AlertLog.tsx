import React, { useState } from 'react';
import { AlertLogItem } from '../types';
import { BellRing, Mail, CheckCircle2, ShieldAlert, Download, Trash2, Send } from 'lucide-react';

interface Tab4Props {
  currentCount: number;
  predictedCount: number;
  activityLabel: string;
  activityConfidence: number;
  securityGuards: number;
  medicalStaff: number;
  direction: string;
  alerts: AlertLogItem[];
  onAddAlert: (newAlert: AlertLogItem) => void;
  onClearAlerts: () => void;
}

export const Tab4AlertLog: React.FC<Tab4Props> = ({
  currentCount,
  predictedCount,
  activityLabel,
  activityConfidence,
  securityGuards,
  medicalStaff,
  direction,
  alerts,
  onAddAlert,
  onClearAlerts,
}) => {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [lastDispatchedBanner, setLastDispatchedBanner] = useState<string | null>(
    `ALERT RAISED: Detected 'fighting' behavior with 97% confidence`
  );
  const [dispatchMethod, setDispatchMethod] = useState<'Email' | 'SMS' | 'PA System'>('Email');

  const handleEvaluateAndDispatch = () => {
    setIsEvaluating(true);

    setTimeout(() => {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
        now.getDate()
      )} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

      let reason = `Detected '${activityLabel.toLowerCase()}' behavior with ${Math.round(
        activityConfidence
      )}% confidence`;

      if (activityLabel === 'NORMAL' && predictedCount > 115) {
        reason = `Congestion forecast exceeded safety threshold (${predictedCount.toFixed(1)} > 115)`;
      } else if (activityLabel === 'NORMAL') {
        reason = `Routine automated safety patrol evaluation (All parameters nominal)`;
      }

      const nextId = (alerts.length > 0 ? Math.max(...alerts.map((a) => a.id)) : 0) + 1;

      const newAlert: AlertLogItem = {
        id: nextId,
        timestamp,
        reason,
        current_count: currentCount,
        predicted_count: parseFloat(predictedCount.toFixed(4)),
        direction: direction || 'None',
        anomaly_label: activityLabel.toLowerCase(),
        anomaly_confidence: parseFloat((activityConfidence / 100).toFixed(4)),
        security_guards: securityGuards,
        medical_staff: Math.max(1, medicalStaff),
      };

      setLastDispatchedBanner(`ALERT RAISED: ${reason}`);
      onAddAlert(newAlert);
      setIsEvaluating(false);
    }, 400);
  };

  const handleExportCSV = () => {
    const headers = [
      'id',
      'timestamp',
      'reason',
      'current_count',
      'predicted_count',
      'direction',
      'anomaly_label',
      'anomaly_confidence',
      'security_guards',
      'medical_staff',
    ];
    const rows = alerts.map((a) =>
      [
        a.id,
        `"${a.timestamp}"`,
        `"${a.reason}"`,
        a.current_count,
        a.predicted_count,
        `"${a.direction}"`,
        `"${a.anomaly_label}"`,
        a.anomaly_confidence,
        a.security_guards,
        a.medical_staff,
      ].join(',')
    );
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `crowd_safety_alert_log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Emergency Alert Dispatch
        </h2>
        <p className="text-sm text-[#a3a8b8] mt-1">
          Combines the latest results from Tabs 1-3 and decides whether to notify responders.
        </p>
      </div>

      {/* Combined State Summary matching video */}
      <div className="bg-[#1e212b] border border-[#3b3d4a] rounded p-3 font-mono text-xs md:text-sm text-slate-200 shadow-sm">
        <span className="text-white font-bold">Current count:</span>{' '}
        <span className="text-emerald-400 font-bold">{currentCount}</span> |{' '}
        <span className="text-white font-bold">Predicted count:</span>{' '}
        <span className="text-cyan-400 font-bold">{predictedCount.toFixed(14)}</span> |{' '}
        <span className="text-white font-bold">Activity:</span>{' '}
        <span className="text-red-400 font-bold">{activityLabel.toLowerCase()}</span>{' '}
        <span className="text-[#808495]">({(activityConfidence / 100).toFixed(15)})</span>
      </div>

      {/* Evaluate & Dispatch Button matching video */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleEvaluateAndDispatch}
          disabled={isEvaluating}
          className="bg-[#262730] hover:bg-[#31333f] active:bg-[#ff4b4b] text-white border border-[#3b3d4a] px-4 py-2 rounded text-xs md:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer shadow"
        >
          <BellRing className={`w-4 h-4 ${isEvaluating ? 'animate-bounce text-[#ff4b4b]' : 'text-[#ff4b4b]'}`} />
          {isEvaluating ? 'Evaluating Multi-Modal Risk...' : 'Evaluate & Dispatch Alert Now'}
        </button>

        <button
          onClick={handleExportCSV}
          className="bg-[#0e1117] hover:bg-[#1e212b] text-slate-300 border border-[#3b3d4a] px-3 py-2 rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>

        {alerts.length > 0 && (
          <button
            onClick={onClearAlerts}
            className="text-xs text-[#808495] hover:text-red-400 px-2 py-2 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Raised Alert Banner matching video exact dark red styling */}
      {lastDispatchedBanner && (
        <div className="bg-[#3c1218] border border-[#ff4b4b]/60 rounded-lg p-3.5 text-white flex items-center gap-3 shadow-lg">
          <ShieldAlert className="w-5 h-5 text-[#ff4b4b] shrink-0" />
          <div className="font-semibold text-sm md:text-base tracking-wide text-red-100">
            {lastDispatchedBanner}
          </div>
        </div>
      )}

      {/* Notified via: Email matching video */}
      <div className="text-xs md:text-sm text-[#a3a8b8] flex items-center gap-2">
        <span className="text-slate-400">Notified via:</span>
        <span className="text-white font-medium flex items-center gap-1.5 bg-[#1e212b] px-2.5 py-1 rounded border border-[#3b3d4a]">
          <Mail className="w-3.5 h-3.5 text-emerald-400" />
          {dispatchMethod} (Automated Dispatch Engine)
        </span>
      </div>

      {/* Recent Alert History Table matching video */}
      <div className="space-y-2">
        <h3 className="text-base md:text-lg font-bold text-white tracking-tight">
          Recent Alert History
        </h3>

        <div className="w-full bg-[#131720] border border-[#262730] rounded-lg overflow-x-auto shadow-xl">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-[#262730] bg-[#1e212b] text-[#a3a8b8] font-mono text-[11px] md:text-xs">
                <th className="py-2.5 px-3">id</th>
                <th className="py-2.5 px-3">timestamp</th>
                <th className="py-2.5 px-4 min-w-[280px]">reason</th>
                <th className="py-2.5 px-3 text-right">current_count</th>
                <th className="py-2.5 px-3 text-right">predicted_count</th>
                <th className="py-2.5 px-3">direction</th>
                <th className="py-2.5 px-3">anomaly_label</th>
                <th className="py-2.5 px-3 text-right">anomaly_confidence</th>
                <th className="py-2.5 px-3 text-center">security_guards</th>
                <th className="py-2.5 px-3 text-center">medical_staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262730] text-slate-200 font-mono text-[11px] md:text-xs">
              {alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-[#1e212b]/60 transition-colors">
                  <td className="py-2 px-3 font-bold text-slate-300">{alert.id}</td>
                  <td className="py-2 px-3 text-[#a3a8b8] whitespace-nowrap">{alert.timestamp}</td>
                  <td className="py-2 px-4 text-white font-sans text-xs">
                    {alert.reason}
                  </td>
                  <td className="py-2 px-3 text-right text-emerald-400 font-bold">
                    {alert.current_count}
                  </td>
                  <td className="py-2 px-3 text-right text-cyan-400">
                    {typeof alert.predicted_count === 'number'
                      ? alert.predicted_count.toFixed(4)
                      : alert.predicted_count}
                  </td>
                  <td className="py-2 px-3 text-amber-300">{alert.direction}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        alert.anomaly_label === 'fighting'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : alert.anomaly_label === 'running'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {alert.anomaly_label}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right text-slate-300">
                    {alert.anomaly_confidence.toFixed(4)}
                  </td>
                  <td className="py-2 px-3 text-center text-emerald-400 font-semibold">
                    {alert.security_guards}
                  </td>
                  <td className="py-2 px-3 text-center text-cyan-400 font-semibold">
                    {alert.medical_staff}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
