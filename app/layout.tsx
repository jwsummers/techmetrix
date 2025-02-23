import type { Metadata } from 'next';
import { Providers } from './components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'TechMetrix',
  description: 'Keep track of your metrics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
