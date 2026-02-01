import type { Competition } from '@/types/expertise';

interface CompetitionsSectionProps {
  competitions: Competition[];
}

export function CompetitionsSection({ competitions }: CompetitionsSectionProps) {
  if (competitions.length === 0) return null;

  const sorted = [...competitions].sort((a, b) => a.order - b.order);

  return (
    <section className="py-12 border-t border-border">
      <h2 className="font-display text-2xl font-medium mb-8">Competitions</h2>
      <div className="space-y-6">
        {sorted.map((comp, index) => (
          <article
            key={comp.id || `comp-${index}`}
            className="p-5 border border-border bg-card"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
              <div>
                <h3 className="font-display text-lg font-medium">{comp.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {comp.year} • {comp.role}
                  {comp.teamContext && ` • ${comp.teamContext}`}
                </p>
              </div>
              <span className="text-sm font-medium text-foreground/90 bg-secondary px-3 py-1 self-start">
                {comp.outcome}
              </span>
            </div>
            <p className="text-sm text-foreground/80 italic">{comp.keyLearning}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
