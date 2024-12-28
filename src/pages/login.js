import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import '../app/globals.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/login', { username, password });
      localStorage.setItem('token', response.data.token);
      setMessage(response.data.message);
      // Redirect to user-specific anime page after successful login
      router.push(`/${username}/anime`);
    } catch (error) {
      console.error('Login failed:', error);
      setMessage(error.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-200 text-text-100">
      <div className="bg-bg-300 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-primary-300 text-center">Login</h1>
        {message && <p className="mb-4 text-accent-200 text-center">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 bg-bg-100 text-text-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-bg-100 text-text-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
          <button type="submit" className="w-full p-3 bg-primary-200 text-bg-100 rounded-lg hover:bg-primary-300 transition duration-300">Login</button>
        </form>
      </div>
    </div>
  );
}
