import { ExternalLink } from 'lucide-react';
import type { Certification } from '@/types/expertise';

interface CertificationsSectionProps {
  certifications: Certification[];
}

export function CertificationsSection({ certifications }: CertificationsSectionProps) {
  if (certifications.length === 0) return null;

  const sorted = [...certifications].sort((a, b) => a.order - b.order);

  return (
    <section className="py-12 border-t border-border">
      <h2 className="font-display text-2xl font-medium mb-8">Certifications & Awards</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {sorted.map((cert, index) => (
          <article
            key={cert.id || `cert-${index}`}
            className="p-5 border border-border bg-card hover:border-foreground/20 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-display text-lg font-medium mb-1">{cert.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {cert.issuingBody} • {cert.dateEarned}
                </p>
                <p className="text-sm text-foreground/80">{cert.relevanceNote}</p>
              </div>
              {cert.verificationLink && (
                <a
                  href={cert.verificationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Verify certification"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
