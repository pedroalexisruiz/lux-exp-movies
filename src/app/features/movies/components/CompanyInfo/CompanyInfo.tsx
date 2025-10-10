import './CompanyInfo.scss';

export function CompanyInfo({
  avatar,
  name,
  role,
}: {
  avatar: string;
  name: string;
  role?: string;
}) {
  return (
    <li className="md-company-info__item">
      <img className="md-company-info__avatar" src={avatar} alt="" aria-hidden />
      <div className="md-company-info__texts">
        <span className="md-company-info__name">{name}</span>
        {role && <span className="md-company-info__role">{role}</span>}
      </div>
    </li>
  );
}
