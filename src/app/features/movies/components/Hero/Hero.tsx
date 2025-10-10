import './Hero.scss';

export function Hero({
  backdrop,
  poster,
  children,
}: {
  backdrop?: string;
  poster: string;
  children: React.ReactNode;
}) {
  return (
    <header className="md-hero">
      <div className="md-hero__backdrop" style={{ backgroundImage: `url('${backdrop || ''}')` }} />
      <div className="md-hero__overlay" />
      <div className="md-hero__container">
        <div className="md-hero__poster">
          <img src={poster} alt="" />
        </div>
        <div className="md-hero__content">{children}</div>
      </div>
    </header>
  );
}
