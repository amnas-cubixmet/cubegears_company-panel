import React, { useEffect, useId, useState } from 'react';
import { Label } from './Label';

const DEFAULT_COUNTRIES = [
  { code: '+91', label: 'IN', flag: '🇮🇳' }, { code: '+971', label: 'AE', flag: '🇦🇪' },
  { code: '+966', label: 'SA', flag: '🇸🇦' }, { code: '+974', label: 'QA', flag: '🇶🇦' },
  { code: '+965', label: 'KW', flag: '🇰🇼' }, { code: '+968', label: 'OM', flag: '🇴🇲' },
  { code: '+973', label: 'BH', flag: '🇧🇭' }
];

export const PhoneInput = ({ label, error, helper, success, required = false, disabled = false, countryCode = '+91', onCountryCodeChange, countries = DEFAULT_COUNTRIES, containerStyle, className = '', id, ...props }) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [selectedCode, setSelectedCode] = useState(countryCode);
  useEffect(() => setSelectedCode(countryCode), [countryCode]);
  const message = error || success || helper;
  return <div className={`ui-field form-field cubegears-field-group ${className}`.trim()} style={containerStyle}>
    {label && <Label htmlFor={inputId} required={required}>{label}</Label>}
    <div className={`ui-input-shell ui-phone form-control${error ? ' ui-input-shell--error has-error' : ''}${success ? ' ui-input-shell--success' : ''}${disabled ? ' ui-input-shell--disabled is-disabled' : ''}`}>
      <select className="ui-phone__country" value={selectedCode} disabled={disabled} onChange={(event) => { setSelectedCode(event.target.value); onCountryCodeChange?.(event.target.value); }} aria-label="Country calling code">
        {countries.map((country) => <option key={country.code} value={country.code}>{country.flag} {country.label} {country.code}</option>)}
      </select>
      <input id={inputId} className="ui-input" type="tel" inputMode="tel" autoComplete="tel-national" required={required} disabled={disabled} aria-invalid={Boolean(error)} {...props} />
    </div>
    {message && <span className={`ui-field__message${error ? ' ui-field__message--error' : success ? ' ui-field__message--success' : ''}`}>{message}</span>}
  </div>;
};
