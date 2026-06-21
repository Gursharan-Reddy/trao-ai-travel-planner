"use client";
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration rejected');
      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch server connection');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">Get Started</h2>
        <p className="auth-subtitle">Create your Trao AI travel account</p>
        
        {error && <div className="alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="form-input" />
          </div>
          <button type="submit" className="btn btn-secondary">Register</button>
        </form>
        <p className="auth-footer">Already registered? <Link href="/login" className="auth-link">Log In</Link></p>
      </div>
    </div>
  );
}