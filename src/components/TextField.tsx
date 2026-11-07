import type { InputHTMLAttributes, ReactNode } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  suffix?: ReactNode;
}

export default function TextField({ label, error, suffix, id, ...rest }: Props) {
  const fieldId = id ?? rest.name;
  return (
    <div className="field">
      <label htmlFor={fieldId}>{label}</label>
      <div className="input-wrap">
        <input id={fieldId} aria-invalid={!!error} className={error ? 'invalid' : ''} {...rest} />
        {suffix}
      </div>
      {error && <p className="error-text" role="alert">{error}</p>}
    </div>
  );
}
