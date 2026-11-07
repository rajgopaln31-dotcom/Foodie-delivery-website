import { useState, type FormEvent } from 'react';
import type { Address, AddressInput } from '../types';
import { isMobile, isPin } from '../utils/validators';
import TextField from './TextField';

type Form = AddressInput;
type Errors = Partial<Record<keyof Form, string>>;

const empty: Form = {
  fullName: '', mobile: '', house: '', street: '', landmark: '', city: '', state: '', pin: '', instructions: '', isDefault: false,
};

function validate(f: Form): Errors {
  const e: Errors = {};
  if (f.fullName.trim().length < 2) e.fullName = 'Full name is required';
  if (!f.mobile.trim()) e.mobile = 'Mobile number is required';
  else if (!isMobile(f.mobile)) e.mobile = 'Enter a valid 10-digit mobile number';
  if (!f.house.trim()) e.house = 'House / flat number is required';
  if (!f.street.trim()) e.street = 'Street / area is required';
  if (!f.city.trim()) e.city = 'City is required';
  if (!f.state.trim()) e.state = 'State is required';
  if (!f.pin.trim()) e.pin = 'PIN code is required';
  else if (!isPin(f.pin)) e.pin = 'Enter a valid 6-digit PIN code';
  return e;
}

interface Props {
  initial?: Address;
  onSubmit: (value: AddressInput) => void;
  onCancel: () => void;
}

export default function AddressForm({ initial, onSubmit, onCancel }: Props) {
  const [f, setF] = useState<Form>(initial ? { ...initial } : empty);
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setF((cur) => ({ ...cur, [key]: value }));
    setErrors((cur) => ({ ...cur, [key]: undefined }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate(f);
    setErrors(found);
    if (Object.keys(found).length === 0) {
      onSubmit({ ...f, fullName: f.fullName.trim(), mobile: f.mobile.trim(), pin: f.pin.trim() });
    }
  };

  return (
    <form className="panel address-form" onSubmit={submit} noValidate>
      <h3>{initial ? 'Edit address' : 'Add new address'}</h3>
      <div className="form-grid">
        <TextField label="Full name" name="fullName" value={f.fullName} error={errors.fullName} autoComplete="name" onChange={(e) => set('fullName', e.target.value)} />
        <TextField label="Mobile number" name="mobile" value={f.mobile} error={errors.mobile} inputMode="numeric" maxLength={10} autoComplete="tel" onChange={(e) => set('mobile', e.target.value.replace(/\D/g, ''))} />
        <TextField label="House / Flat no." name="house" value={f.house} error={errors.house} onChange={(e) => set('house', e.target.value)} />
        <TextField label="Street / Area" name="street" value={f.street} error={errors.street} onChange={(e) => set('street', e.target.value)} />
        <TextField label="Landmark (optional)" name="landmark" value={f.landmark} onChange={(e) => set('landmark', e.target.value)} />
        <TextField label="City" name="city" value={f.city} error={errors.city} onChange={(e) => set('city', e.target.value)} />
        <TextField label="State" name="state" value={f.state} error={errors.state} onChange={(e) => set('state', e.target.value)} />
        <TextField label="PIN code" name="pin" value={f.pin} error={errors.pin} inputMode="numeric" maxLength={6} onChange={(e) => set('pin', e.target.value.replace(/\D/g, ''))} />
      </div>
      <div className="field">
        <label htmlFor="instructions">Delivery instructions (optional)</label>
        <textarea id="instructions" rows={2} value={f.instructions} placeholder="e.g. Ring the bell twice, leave at the door" onChange={(e) => set('instructions', e.target.value)} />
      </div>
      <label className="check">
        <input type="checkbox" checked={f.isDefault} onChange={(e) => set('isDefault', e.target.checked)} /> Make this my default address
      </label>
      <div className="row end">
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">{initial ? 'Save changes' : 'Save address'}</button>
      </div>
    </form>
  );
}
