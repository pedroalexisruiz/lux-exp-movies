import './Meta.scss';

export function Meta({
  year,
  status,
  runtime,
  rating,
  votes,
}: {
  year: string;
  status?: string;
  runtime: string;
  rating: string;
  votes?: string;
}) {
  return (
    <ul className="md-meta" aria-label="Metadatos de la película">
      <li className="md-meta__item">{year}</li>
      {status && <li className="md-meta__item">{status}</li>}
      <li className="md-meta__item">{runtime}</li>
      <li className="md-meta__item md-meta__item--rating" aria-label="Puntuación">
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
          />
        </svg>
        <span>{rating}</span> {votes && <span className="md-meta__votes">{votes}</span>}
      </li>
    </ul>
  );
}
