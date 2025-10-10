import './Meta.scss';
import { FaStar } from 'react-icons/fa';

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
        <FaStar />
        <span>{rating}</span> {votes && <span className="md-meta__votes">{votes}</span>}
      </li>
    </ul>
  );
}
