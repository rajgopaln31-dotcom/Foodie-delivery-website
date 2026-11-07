import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Header';
import TextField from '../components/TextField';
import { useToast } from '../components/Toast';
import { authApi } from '../services/api';
import { login, register } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { isEmail, isMobile, passwordError } from '../utils/validators';

type Mode = 'login' | 'register' | 'forgot';
interface Fields { name: string; email: string; mobile: string; password: string; confirm: string; identifier: string }
type Errors = Partial<Record<keyof Fields, string>>;

const empty: Fields = { name: '', email: '', mobile: '', password: '', confirm: '', identifier: '' };

function validate(mode: Mode, f: Fields): Errors {
  const e: Errors = {};
  if (mode === 'login') {
    if (!f.identifier.trim()) e.identifier = 'Email or mobile number is required';
    else if (!isEmail(f.identifier) && !isMobile(f.identifier)) e.identifier = 'Enter a valid email or 10-digit mobile number';
    if (!f.password) e.password = 'Password is required';
  } else if (mode === 'register') {
    if (f.name.trim().length < 2) e.name = 'Full name is required';
    if (!f.email.trim()) e.email = 'Email is required';
    else if (!isEmail(f.email)) e.email = 'Enter a valid email address';
    if (!f.mobile.trim()) e.mobile = 'Mobile number is required';
    else if (!isMobile(f.mobile)) e.mobile = 'Enter a valid 10-digit mobile number';
    e.password = passwordError(f.password);
    if (!f.confirm) e.confirm = 'Please confirm your password';
    else if (f.confirm !== f.password) e.confirm = 'Passwords do not match';
  } else if (!f.email.trim()) e.email = 'Email is required';
  else if (!isEmail(f.email)) e.email = 'Enter a valid email address';
  return Object.fromEntries(Object.entries(e).filter(([, v]) => v)) as Errors;
}

export default function LoginPage() {
  const user = useAppSelector((s) => s.auth.user);
  const loading = useAppSelector((s) => s.auth.status === 'loading');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useToast();
  const [mode, setMode] = useState<Mode>('login');
  const [f, setF] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? '/';
  if (user) return <Navigate to={from} replace />;

  const set = (k: keyof Fields) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = k === 'mobile' ? e.target.value.replace(/\D/g, '') : e.target.value;
    setF((cur) => ({ ...cur, [k]: value }));
    setErrors((cur) => ({ ...cur, [k]: undefined }));
  };

  const switchMode = (m: Mode) => { setMode(m); setErrors({}); setShow(false); setF((cur) => ({ ...empty, identifier: m === 'login' ? cur.email : '' })); };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy || loading) return;
    const found = validate(mode, f);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setBusy(true);
    try {
      if (mode === 'login') {
        await dispatch(login({ identifier: f.identifier.trim(), password: f.password })).unwrap();
        notify('Login successful. Welcome back!', 'success');
        navigate(from, { replace: true });
      } else if (mode === 'register') {
        await dispatch(register({ name: f.name, email: f.email, mobile: f.mobile, password: f.password })).unwrap();
        notify('Account created! Please log in.', 'success');
        setMode('login');
        setF({ ...empty, identifier: f.email.trim() });
      } else {
        await authApi.requestPasswordReset(f.email.trim());
        notify(`Demo mode: a password reset link for ${f.email.trim()} is simulated (no email is sent).`, 'info');
        switchMode('login');
      }
    } catch (err) {
      notify(typeof err === 'string' ? err : 'Something went wrong. Please try again.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const toggle = (
    <button type="button" className="link-btn" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((s) => !s)}>
      {show ? 'Hide' : 'Show'}
    </button>
  );
  const pending = busy || loading;

  return (
    <div className="auth-page">
      <div className="auth-hero" aria-hidden="true">
        <div>
          <h1>Craving something delicious?</h1>
          <p>Order from the best restaurants near you and get it delivered hot.</p>
          <div className="auth-emoji">🍕 🍔 🍛 🍜 🥗 🍰</div>
        </div>
      </div>
      <div className="auth-card">
        <Logo />
        <h2>{mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create your account' : 'Forgot password'}</h2>
        {mode === 'login' && <p className="muted small">Demo account: <strong>demo@foodiego.com</strong> / <strong>Demo@123</strong></p>}

        <form onSubmit={submit} noValidate>
          {mode === 'login' && (
            <>
              <TextField label="Email or mobile number" name="identifier" value={f.identifier} error={errors.identifier} autoComplete="username" onChange={set('identifier')} />
              <TextField label="Password" name="password" type={show ? 'text' : 'password'} value={f.password} error={errors.password} autoComplete="current-password" suffix={toggle} onChange={set('password')} />
              <button type="button" className="link-btn right" onClick={() => switchMode('forgot')}>Forgot Password?</button>
            </>
          )}
          {mode === 'register' && (
            <>
              <TextField label="Full name" name="name" value={f.name} error={errors.name} autoComplete="name" onChange={set('name')} />
              <TextField label="Email" name="email" type="email" value={f.email} error={errors.email} autoComplete="email" onChange={set('email')} />
              <TextField label="Mobile number" name="mobile" value={f.mobile} error={errors.mobile} inputMode="numeric" maxLength={10} autoComplete="tel" onChange={set('mobile')} />
              <TextField label="Password" name="password" type={show ? 'text' : 'password'} value={f.password} error={errors.password} autoComplete="new-password" suffix={toggle} onChange={set('password')} />
              <TextField label="Confirm password" name="confirm" type={show ? 'text' : 'password'} value={f.confirm} error={errors.confirm} autoComplete="new-password" onChange={set('confirm')} />
            </>
          )}
          {mode === 'forgot' && (
            <TextField label="Registered email" name="email" type="email" value={f.email} error={errors.email} autoComplete="email" onChange={set('email')} />
          )}
          <button type="submit" className="btn btn-primary btn-block" disabled={pending}>
            {pending ? 'Please wait…' : mode === 'login' ? 'Login' : mode === 'register' ? 'Create Account' : 'Send reset link'}
          </button>
        </form>

        <p className="switch-mode">
          {mode === 'login' ? (
            <>New to FoodieGo? <button className="link-btn" onClick={() => switchMode('register')}>Create Account</button></>
          ) : (
            <>Back to <button className="link-btn" onClick={() => switchMode('login')}>Login</button></>
          )}
        </p>
      </div>
    </div>
  );
}
