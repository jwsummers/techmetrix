// app/login/page.tsx
'use client';
import { signIn, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (session.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/user');
      }
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const res = await signIn('credentials', {
      redirect: false,
      username: formData.username,
      password: formData.password,
    });
    if (res?.error) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-background'>
      <form
        onSubmit={handleSubmit}
        className='p-6 bg-surface shadow-md rounded w-80'
      >
        <Link href={'/'}>
          <Image
            src='/images/TM-logo-whiteRB.png'
            alt='Logo'
            width={50}
            height={50}
          ></Image>
        </Link>
        <h1 className='text-xl font-bold mb-4 text-center text-primaryText'>
          Login
        </h1>
        {error && <p className='text-pinkAccent mb-2'>{error}</p>}
        <input
          type='text'
          placeholder='Username'
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          className='border border-secondaryText p-2 mb-2 w-full rounded bg-surface text-primaryText'
          required
        />
        <input
          type='password'
          placeholder='Password'
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className='border border-secondaryText p-2 mb-4 w-full rounded bg-surface text-primaryText'
          required
        />
        <button
          type='submit'
          className='bg-accent text-background py-2 px-4 rounded w-full'
        >
          Login
        </button>
        <p className='text-xs text-secondaryText mt-2'>
          Don&apos;t have an account?{' '}
          <a href='/register' className='text-accent'>
            Register
          </a>
        </p>
      </form>
    </div>
  );
}
