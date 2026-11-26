import { useState } from 'react';
import type { BugAppProps } from './registry';

type TextField = 'username' | 'email' | 'password';
type Field = TextField | 'terms';
type FormState = Record<TextField, string> & { terms: boolean };
type Errors = Partial<Record<Field, string>>;
const initial: FormState = { username: '', email: '', password: '', terms: false };
const fields = [
  { id: 'username', label: 'Username', type: 'text' },
  { id: 'email', label: 'Email', type: 'email' },
  { id: 'password', label: 'Password', type: 'password' },
] as const;

export function SignupForm({ onTrigger }: BugAppProps) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState('');

  function edit<FieldName extends Field>(key: FieldName, value: FormState[FieldName]) {
    setForm((previous) => ({ ...previous, [key]: value }));
    setSuccess('');
    if (key === 'password' && errors.email) {
      onTrigger('wrong-field-clear');
      setErrors((previous) => ({ ...previous, password: undefined, email: undefined }));
      return;
    }
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  }

  function submit() {
    const next: Errors = {};
    const name = form.username.trimEnd();
    if (!/^[a-z0-9_]{3,20}$/i.test(name)) next.username = 'Use 3 to 20 letters, digits or underscores.';
    if (!/^[^@\s]+@[^@\s]+$/.test(form.email)) next.email = 'Enter an email address.';
    if (form.password.length < 8 || !/[a-z]/i.test(form.password) || !/[0-9]/.test(form.password)) {
      next.password = 'Use at least 10 characters with a letter and a digit.';
    }
    setSuccess('');
    if (!Object.keys(next).length) {
      if (name.toLowerCase() === 'reserved') {
        next.username = 'Username is already taken.';
        onTrigger('false-success');
      } else {
        if (form.username !== name) onTrigger('username-trailing');
        if (!/\.[a-z]{2,}$/i.test(form.email.split('@')[1])) onTrigger('email-no-tld');
        if (form.password.length < 10) onTrigger('password-short');
        if (!form.terms) onTrigger('terms-skipped');
      }
      setSuccess(form.username);
    }
    setErrors(next);
  }

  return (
    <section className="bug-app" aria-label="Signup form">
      <h2 className="h3">Create an account</h2>
      <form className="bug-signup" noValidate onSubmit={(event) => { event.preventDefault(); submit(); }}>
        {fields.map(({ id, label, type }) =>
          <div key={id}>
            <label className="field">
              <span>{label}</span>
              <input className="input" type={type} value={form[id]} autoComplete={id === 'password' ? 'new-password' : 'off'} aria-invalid={!!errors[id]}
                aria-describedby={errors[id] ? `signup-error-${id}` : undefined} onChange={(event) => edit(id, event.target.value)} />
            </label>
            {errors[id] && <small id={`signup-error-${id}`} className="fail" role="alert">{errors[id]}</small>}
          </div>,
        )}
        <label className="check small">
          <input type="checkbox" checked={form.terms} onChange={(event) => edit('terms', event.target.checked)} />
          I accept the terms
        </label>
        <button className="btn btn--primary" type="submit">Create account</button>
      </form>
      {success && <p className="notice notice--ok bug-signup-success" role="status">Account created. Username: <code>{JSON.stringify(success)}</code></p>}
    </section>
  );
}
