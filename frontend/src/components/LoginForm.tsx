import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: unknown) {
      console.error('Full error:', err);
      let errorMsg = 'Login failed';
      if (axios.isAxiosError(err)) {
        console.error('Error response:', err.response);
        errorMsg = err.response?.data?.message || err.message || errorMsg;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute top-[137px] left-[514px] w-[412px] h-[494px] bg-white rounded-[16px] shadow-[0_0_2px_rgba(23,26,31,0.12),0_8px_17px_rgba(23,26,31,0.15)] p-6">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <h2 className="text-2xl font-bold mb-6">Sign In to TaskFlow</h2>

        {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors mb-4"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <button
              type="button"
              onClick={() => {
                window.location.href = "http://localhost:3000/auth/google";
              }}
              className="w-full bg-white text-gray-800 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors mb-4"
            >
              Sign in with Google
      </button>

        <p className="mt-auto text-center text-sm">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            Register
          </a>
        </p>
      </form>
    </div>
  );
};
