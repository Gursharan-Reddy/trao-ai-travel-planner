"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Direct absolute URL fallback ensures it doesn't default to a broken domain path
      const baseApi = process.env.NEXT_PUBLIC_API_URL || 'https://trao-ai-travel-planner-5fn9.onrender.com/api';
      const response = await fetch(`${baseApi}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication sequence failed.');
      }

      login(data.token, data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to connect to authentication stream.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Trao AI Travel Planner Portal</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="form-input" 
              placeholder="name@example.com"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="form-input" 
              placeholder="••••••••"
            />
          </div>
          
          <button type="submit" disabled={loading} className="btn-auth">
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        
        <p className="auth-switch-text">
          New explorer? 
          <Link href="/register" className="auth-link">Create Account</Link>
        </p>
      </div>
    </div>
  );
}