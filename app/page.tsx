'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import NavBar from './components/NavBar';
import { signIn } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <p className='text-primaryText'>Loading...</p>
      </div>
    );
  }

  const handleDemoLogin = async (type: 'admin' | 'user') => {
    try {
      const res = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      if (!res.ok) {
        throw new Error('Failed to retrieve demo credentials');
      }

      const { username } = await res.json(); // No password needed now

      // Now sign in the user, bypassing password authentication
      const loginRes = await signIn('credentials', {
        redirect: false,
        username,
        password: 'bypass_demo_auth', // Dummy password (server should skip check)
      });

      if (!loginRes || loginRes.error) {
        throw new Error('Demo login failed');
      }

      // Reload the page to reflect authentication state
      window.location.reload();
    } catch (error) {
      console.error('Demo login error:', error);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col'>
      <NavBar />

      {/* Main Content */}
      <div className='flex flex-col items-center justify-center flex-grow p-6'>
        <h1 className='text-5xl font-extrabold text-white mb-6 drop-shadow-lg text-center'>
          Welcome to <span className='text-accent'>TechMetrix</span>
        </h1>
        <p className='text-lg text-gray-300 mb-8 text-center max-w-2xl leading-relaxed'>
          TechMetrix is an efficiency tracking tool designed for automotive
          technicians. Log your work hours, view performance trends, and
          optimize your workflow.
        </p>

        {/* Buttons Section */}
        {!session ? (
          <div className='mt-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4'>
            <button
              onClick={() => handleDemoLogin('user')}
              className='px-6 py-3 rounded-lg text-white text-lg font-semibold shadow-lg transition 
                bg-gradient-to-r from-blue-500 to-teal-400 hover:scale-105 hover:shadow-xl'
            >
              🚗 Demo User
            </button>
            <button
              onClick={() => handleDemoLogin('admin')}
              className='px-6 py-3 rounded-lg text-white text-lg font-semibold shadow-lg transition 
                bg-gradient-to-r from-red-500 to-orange-400 hover:scale-105 hover:shadow-xl'
            >
              🛠️ Demo Admin
            </button>
          </div>
        ) : (
          <div className='flex space-x-4'>
            {session.user.role === 'ADMIN' ? (
              <Link href='/admin'>
                <button
                  className='px-6 py-3 rounded-lg text-white text-lg font-semibold shadow-lg transition 
                  bg-gradient-to-r from-orange-500 to-yellow-400 hover:scale-105 hover:shadow-xl'
                >
                  View Admin Dashboard
                </button>
              </Link>
            ) : (
              <Link href='/user'>
                <button
                  className='px-6 py-3 rounded-lg text-white text-lg font-semibold shadow-lg transition 
                  bg-gradient-to-r from-green-500 to-teal-400 hover:scale-105 hover:shadow-xl'
                >
                  View Dashboard
                </button>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Subtle Background Effect */}
      <div className='absolute inset-0 bg-black/30  pointer-events-none'></div>
    </div>
  );
}
