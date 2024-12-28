import { useState } from 'react';
import axios from 'axios';
import '../app/globals.css';
import { useRouter } from 'next/router';  // Add this import

export default function Register() {
  const router = useRouter();  // Add this line
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/register', { username, password });
      setMessage(response.data.message);
      // Redirect to the login page after successful registration
      router.push('/login');
    } catch (error) {
      console.error('Registration failed:', error);
      setMessage(error.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded shadow-md">
        <h1 className="text-2xl mb-4">Register</h1>
        {message && <p className="mb-4">{message}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-4 bg-gray-700 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 bg-gray-700 rounded"
        />
        <button type="submit" className="w-full p-2 bg-blue-600 rounded">Register</button>
      </form>
    </div>
  );
}
