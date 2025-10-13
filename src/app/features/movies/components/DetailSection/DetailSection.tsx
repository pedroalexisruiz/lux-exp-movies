import './DetailSection.scss';

export function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="md-detail-section" data-testid={`detail-${title}`}>
      <h3 className="md-detail-section__title">{title}</h3>
      {children}
    </div>
  );
}
