import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, register } from '../store/slices/authSlice';

const AuthForms = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });

  const onSubmit = (event) => {
    event.preventDefault();
    if (mode === 'login') {
      dispatch(login({ email: form.email, password: form.password }));
    } else {
      dispatch(register(form));
    }
  };

  return (
    <div className="card">
      <div className="row">
        <h2>{mode === 'login' ? 'ورود' : 'ثبت‌نام'}</h2>
        <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'ثبت‌نام' : 'ورود'}
        </button>
      </div>
      <form onSubmit={onSubmit}>
        {mode === 'register' && (
          <label>
            نام
            <input
              name="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
        )}
        <label>
          ایمیل
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </label>
        <label>
          رمز عبور
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </label>
        <button type="submit" disabled={auth.status === 'loading'}>
          {auth.status === 'loading' ? 'در حال ارسال...' : 'تایید'}
        </button>
        {auth.error && <p>{auth.error}</p>}
        {auth.user && <p>خوش آمدید، {auth.user.email}</p>}
      </form>
    </div>
  );
};

export default AuthForms;
