'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
  });
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

  const validatePassword = (password: string) => {
    // Require at least 8 characters, one number, and one special character.
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])/;
    return password.length >= 8 && regex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validatePassword(formData.password)) {
      setError(
        'Password must be at least 8 characters long and include a number and a special character.'
      );
      return;
    }

    const res = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (res.ok) {
      // On successful registration, redirect to login
      router.push('/login');
    } else {
      setError(data.error || 'Registration failed');
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
          Register
        </h1>
        {error && <p className='text-pinkAccent mb-2'>{error}</p>}
        <input
          type='text'
          placeholder='Full Name'
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className='border border-secondaryText p-2 mb-2 w-full rounded bg-surface text-primaryText'
          required
        />
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
          className='border border-secondaryText p-2 mb-1 w-full rounded bg-surface text-primaryText'
          required
        />
        <p className='text-xs text-secondaryText mb-4'>
          Password must be at least 8 characters long and include at least one
          number and one special character.
        </p>
        <button
          type='submit'
          className='bg-accent text-background py-2 px-4 rounded w-full'
        >
          Register
        </button>
        <p className='text-secondaryText mt-4'>
          Already have an account?{' '}
          <Link href='/login' className='text-accent'>
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
