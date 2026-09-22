import React, { useState, useEffect } from 'react';
import { dbService } from '@/api/client';
import { ShieldAlert, ShieldCheck, RefreshCw, Star, AlertTriangle, Eye } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

interface FraudRecord {
  id: string;
  alert_type: string;
  severity: string;
  status: string;
  description: string;
  affected_user_id?: number;
  order_id?: number;
  shipper_id?: number;
  ip_address?: string;
  device_fingerprint?: string;
  created_at: string;
  review_note?: string | null;
}

const ALERT_TYPE_LABELS: Record<string, string> = {
  SHIPPER_FRAUD: '🛵 Shipper bị đánh giá thấp',
  SHOP_FRAUD: '🏪 Quán bị đánh giá thấp',
};

const SEV_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  LOW:      { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Thấp' },
  MEDIUM:   { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Trung bình' },
  HIGH:     { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Cao' },
  CRITICAL: { bg: 'bg-rose-600', text: 'text-white', label: 'Nguy hiểm' },
};

export function FraudAlertsPage() {
  const [alerts, setAlerts] = useState<FraudRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sevFilter, setSevFilter] = useState('ALL');
  const [selected, setSelected] = useState<FraudRecord | null>(null);
  const [note, setNote] = useState('');

  const load = async () => {
    setLoading(true);
    const data = await dbService.getFraudAlerts();
    setAlerts(data as any);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = alerts.filter(a =>
    sevFilter === 'ALL' || a.severity === sevFilter
  );

  const handleDismiss = async () => {
    if (!selected) return;
    await dbService.reviewFraudAlert(selected.id, 'DISMISSED' as any, note);
    setSelected(null);
    setNote('');
    load();
  };

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-rose-500" />
            Cảnh báo Gian lận
          </h1>
          <p className="text-slate-500 text-sm mt-1">Phát hiện từ đánh giá tiêu cực (rating ≤2★) và hành vi bất thường</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-600 transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-rose-50 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{criticalCount}</div>
            <div className="text-xs text-slate-500">Cảnh báo nghiêm trọng</div>
          </div>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{alerts.length}</div>
            <div className="text-xs text-slate-500">Tổng cảnh báo</div>
          </div>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{alerts.filter(a => a.status === 'DISMISSED').length}</div>
            <div className="text-xs text-slate-500">Đã xử lý</div>
          </div>
        </div>
      </div>

      {/* Severity Filter */}
      <div className="flex gap-2">
        {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
          <button
            key={sev}
            onClick={() => setSevFilter(sev)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              sevFilter === sev
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {sev === 'ALL' ? 'Tất cả' : SEV_CONFIG[sev]?.label || sev}
          </button>
        ))}
      </div>

      {/* Alert List */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
          Đang tải...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
          <p className="text-xl font-bold text-slate-700">Không có cảnh báo nào!</p>
          <p className="text-slate-400 text-sm mt-2">Hệ thống đang hoạt động bình thường</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => {
            const sevCfg = SEV_CONFIG[a.severity] || SEV_CONFIG.LOW;
            return (
              <div key={a.id} className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Severity Badge */}
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${sevCfg.bg}`}>
                    <ShieldAlert className={`w-5 h-5 ${sevCfg.text}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-slate-800 text-sm">
                        {ALERT_TYPE_LABELS[a.alert_type] || a.alert_type}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${sevCfg.bg} ${sevCfg.text}`}>
                        {sevCfg.label}
                      </span>
                      {a.order_id && (
                        <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          Đơn #{a.order_id}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-600 mt-1 italic">"{a.description}"</p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      {a.shipper_id && <span>Shipper #{a.shipper_id}</span>}
                      {a.affected_user_id && <span>Khách #{a.affected_user_id}</span>}
                      <span>{new Date(a.created_at).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => setSelected(a)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Chi tiết
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Chi tiết cảnh báo gian lận">
        {selected && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Loại cảnh báo:</span>
                <span className="font-semibold">{ALERT_TYPE_LABELS[selected.alert_type] || selected.alert_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mức độ:</span>
                <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${SEV_CONFIG[selected.severity]?.bg} ${SEV_CONFIG[selected.severity]?.text}`}>
                  {SEV_CONFIG[selected.severity]?.label}
                </span>
              </div>
              {selected.order_id && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Đơn hàng:</span>
                  <span className="font-mono font-bold text-blue-600">#{selected.order_id}</span>
                </div>
              )}
              {selected.shipper_id && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Shipper:</span>
                  <span className="font-semibold">#{selected.shipper_id}</span>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-slate-600 italic bg-rose-50 rounded-xl p-3 border border-rose-100">
                "{selected.description}"
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Ghi chú xử lý</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Nhập ghi chú xử lý (tùy chọn)..."
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDismiss}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors"
              >
                ✅ Đánh dấu đã xử lý
              </button>
              <button
                onClick={() => setSelected(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-sm transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
