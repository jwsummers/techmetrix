'use client';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

export default function NavBar() {
  const { data: session, status } = useSession();

  return (
    <nav className='flex items-center justify-between px-6 shadow-md'>
      <Link href='/'>
        <Image
          src='/images/TM-logo-whiteRB.png'
          alt='Logo'
          width={150}
          height={50}
        ></Image>
      </Link>
      {status === 'authenticated' && session?.user ? (
        <div className='flex items-center space-x-4'>
          <span className='text-primaryText'>
            Welcome {session.user.username}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className='bg-orangeAccent text-background py-1 px-3 rounded hover:bg-orangeAccent/90 transition'
          >
            Logout
          </button>
        </div>
      ) : (
        <div className='flex space-x-4'>
          <Link href='/login'>
            <button className='bg-accent text-background py-1 px-3 rounded hover:bg-accent/90 transition'>
              Login
            </button>
          </Link>
          <Link href='/register'>
            <button className='bg-tealAccent text-background py-1 px-3 rounded hover:bg-tealAccent/90 transition'>
              Register
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
}
