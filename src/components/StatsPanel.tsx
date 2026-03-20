interface StatsPanelProps {
  stats: { label: string; value: string | number }[];
}

export function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
      {stats.map((stat) => (
        <div key={stat.label}>
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
          </p>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
