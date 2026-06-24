// 📁 src/features/dashboard/components/LiveAlerts.jsx

import { useNavigate } from "react-router-dom";
import { Globe, Smartphone, MessageCircle, Phone, Home, Building2, User, Clock } from "lucide-react";

const SOURCE_BADGE = {
  website:  { label:"website",  bg:"bg-blue-100",   text:"text-blue-700",   Icon: Globe          },
  app:      { label:"app",      bg:"bg-slate-100",  text:"text-slate-700",  Icon: Smartphone     },
  whatsapp: { label:"whatsapp", bg:"bg-green-100",  text:"text-green-700",  Icon: MessageCircle  },
  call:     { label:"call",     bg:"bg-orange-100", text:"text-orange-700", Icon: Phone          },
};

const TYPE_ICON = {
  message: { bg:"bg-blue-50",   border:"border-blue-200",   Icon: MessageCircle, iconColor:"text-blue-500"   },
  call:    { bg:"bg-green-50",  border:"border-green-200",  Icon: Phone,         iconColor:"text-green-500"  },
  tour:    { bg:"bg-orange-50", border:"border-orange-200", Icon: Home,          iconColor:"text-orange-500" },
};




export default function LiveAlerts({ alerts = [] }) {
  const navigate = useNavigate();

  const handleAlertClick = (alert) => {
    const path = alert.linkTo || (alert.type === "tour" ? "/admin/tour-requests" : "/admin/inquiries");
    navigate(path);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-50">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#2D368E]">Live Alerts</h3>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"/>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"/>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Contact initiated events</p>
        </div>
      </div>

      {/* Alert List */}
      <div className="divide-y divide-slate-50 max-h-[420px] overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="px-6 py-10 text-center text-slate-400 text-sm">No live alerts</div>
        ) : (
          alerts.map((alert) => {
            const src  = SOURCE_BADGE[alert.source]  ?? SOURCE_BADGE.website;
            const type = TYPE_ICON[alert.type]       ?? TYPE_ICON.message;
            return (
              <div
                key={alert.id}
                onClick={() => handleAlertClick(alert)}
                className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {/* Type icon */}
                <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border ${type.bg} ${type.border}`}>
                  <type.Icon size={16} className={type.iconColor} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[#2D368E]">{alert.action}</span>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${src.bg} ${src.text}`}>
                      <src.Icon size={10} />{src.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
                    <Building2 size={12} className="text-slate-400" />
                    <span className="font-medium text-slate-600">{alert.property}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <User size={11} />
                      <span>
                        {alert.person}
                        {alert.anon && <span className="ml-1.5 bg-slate-200 text-slate-600 text-xs font-bold px-1.5 py-0.5 rounded">Anon</span>}
                      </span>
                    </span>
                    <span className="flex items-center gap-1"><Clock size={11} /><span>{alert.time}</span></span>
                  </div>
                </div>

                {/* Arrow hint */}
                <span className="text-slate-300 text-xs self-center">›</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}