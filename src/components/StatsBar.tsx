"use client";

interface Stats {
  total: number;
  pending: number;
  processing: number;
  resolved: number;
  escalated: number;
  today: number;
}

interface StatsBarProps {
  stats: Stats | null;
}

export default function StatsBar({ stats }: StatsBarProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-ift-blue/20 rounded-xl p-4 animate-pulse h-20" />
        ))}
      </div>
    );
  }

  const cards = [
    { label: "Total", value: stats.total, color: "text-ift-light" },
    { label: "Today", value: stats.today, color: "text-blue-400" },
    { label: "Pending", value: stats.pending, color: "text-yellow-400" },
    { label: "Processing", value: stats.processing, color: "text-blue-400" },
    { label: "Resolved", value: stats.resolved, color: "text-emerald-400" },
    { label: "Escalated", value: stats.escalated, color: "text-amber-400" },
  ];

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-ift-blue/20 border border-ift-blue/30 rounded-xl p-4 text-center"
        >
          <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          <p className="text-xs text-ift-light/50 mt-1">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
