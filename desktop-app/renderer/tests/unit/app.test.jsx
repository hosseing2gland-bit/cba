import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import { store } from '../../src/store/store';
import App from '../../src/pages/App';

vi.stubGlobal('window', {
  api: {
    request: vi.fn(() => Promise.resolve([])),
    refreshToken: vi.fn(() => Promise.resolve({ accessToken: 'new-token' })),
    downloadProfileFile: vi.fn(),
  },
});

describe('App shell', () => {
  it('renders the main sections', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(screen.getByText('مدیریت پروفایل مرورگر')).toBeInTheDocument();
    expect(screen.getByText('ثبت‌نام')).toBeInTheDocument();
    expect(screen.getByText('پروفایل‌ها')).toBeInTheDocument();
    expect(screen.getByText('تیم شما')).toBeInTheDocument();
  });
});
