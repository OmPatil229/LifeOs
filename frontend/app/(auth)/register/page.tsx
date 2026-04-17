'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, token } = useAuthStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  React.useEffect(() => {
    if (token) router.push('/dashboard');
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      router.push('/dashboard');
    } catch (err) {
      // Error is handled in the store
    }
  };

  return (
    <>
      <div className="auth-header">
        <h1 className="auth-logo">LIFE/OS</h1>
        <p className="auth-subtitle">Initialize New User Protocol</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="name">Full Name</label>
          <input
            className="form-input"
            id="name"
            type="text"
            placeholder="Agent Zero"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address</label>
          <input
            className="form-input"
            id="email"
            type="email"
            placeholder="name@nexus.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Passphrase</label>
          <input
            className="form-input"
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="auth-button" type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="pulse" size={18} />
          ) : (
            <>
              Initialize Account <UserPlus size={18} />
            </>
          )}
        </button>
      </form>

      <div className="auth-footer">
        Already in the system?
        <Link href="/login" className="auth-link">Authorize Identity</Link>
      </div>
    </>
  );
}
