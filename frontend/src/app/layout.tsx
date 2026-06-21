import React from 'react';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
// @ts-ignore

export const metadata = {
  title: 'Trao AI Travel Planner',
  description: 'AI Driven Travel Itinerary Generative Application Engine',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-white antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}