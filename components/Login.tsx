import React from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { MOCK_USER_JOHN, MOCK_ADMIN_SARAH } from '../constants';
import { MetalliQIcon } from './ui/Logo';
import type { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)] p-4">
      <Card className="w-full max-w-sm" padding="lg">
        <div className="text-center mb-8">
            <MetalliQIcon className="h-16 w-16 text-[var(--color-brand-primary)] mx-auto" />
            <h2 className="mt-4 text-2xl font-bold text-[var(--text-primary)]">MetalliQ</h2>
            <p className="text-[var(--text-secondary)]">AI-Powered Metals Sustainability</p>
        </div>
        <div className="space-y-4">
            <p className="text-center text-sm text-[var(--text-secondary)]">This is a simulated login. No password is required.</p>
            <Button onClick={() => onLogin(MOCK_USER_JOHN)} className="w-full" size="lg">
            Sign In as User (John Doe)
          </Button>
          <Button onClick={() => onLogin(MOCK_ADMIN_SARAH)} variant="secondary" className="w-full" size="lg">
            Sign In as Admin (Sarah Singh)
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Login;