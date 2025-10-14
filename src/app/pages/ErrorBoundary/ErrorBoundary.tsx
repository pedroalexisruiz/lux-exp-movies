import { isRouteErrorResponse, useRouteError, useNavigate } from 'react-router';
import errorImage from '@assets/movie-error.jpg';
import { RxReload } from 'react-icons/rx';
import { MdHomeFilled } from 'react-icons/md';
import './ErrorBoundary.scss';
import { Button } from '@/app/shared/ui/Carousel/Button/Button';

export default function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  let title = 'Something went wrong';
  let message = 'Please try again.';
  let status = 500;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    title = `${status} ${error.statusText || ''}`.trim();
    message = (error.data && (error.data.message || error.data.error)) || message;
  } else if (error instanceof Error) {
    message = error.message || message;
  }

  return (
    <section className="erbo-container">
      <img
        data-testid={`movie-error-image-${title}`}
        className="erbo_image"
        src={errorImage}
        alt={title}
        loading="lazy"
      />
      <h1 className="erbo-title">{title}</h1>
      <p className="erbo-description">{message}</p>

      <div className="erbo_actions">
        <Button onClick={() => navigate(0)}>
          <RxReload />
          Retry
        </Button>
        <Button variant='secondary' onClick={() => navigate('/')}>
          <MdHomeFilled />
          Go home
        </Button>
      </div>

      <p className="erbo-help-text">If you’re offline, reconnect and hit Retry.</p>
    </section>
  );
}
