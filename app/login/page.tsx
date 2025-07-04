'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    const res = await signIn('credentials', {
      redirect: false,
      email: formData.email,
      password: formData.password,
    });
    
    if (res?.error) {
      setError(res.error);
      setIsLoading(false)
    } else {
      setSuccessMessage('Login successful! Redirecting...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    }
  }   
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
    <Card className="w-full max-w-md shadow-none">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-medium">Welcome back</CardTitle>
          <CardDescription className="text-gray-500">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-12"
              />
            </div>
            <div className="space-y-1">
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="h-12"
              />
            </div>
            {successMessage && (
            <div className="text-green-600 text-center mb-2">
              {successMessage}
            </div>
          )}
            {error && (
              <div className="text-sm text-red-600 text-center">{error}</div>
            )}
            <Button
              type="submit"
              className="w-full h-12 bg-black hover:bg-gray-900"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link href="/signup" className="text-black hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}