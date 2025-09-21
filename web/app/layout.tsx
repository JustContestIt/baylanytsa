import type { Metadata } from 'next';
import NavBar from '../components/Navbar';
import './global.css'

export const metadata: Metadata = {
  title: 'Bailanysta',
  description: 'Cоциальная сеть',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="min-h-screen">
        <NavBar />
        <main className="container py-6">{children}</main>
      </body>
    </html>
  );
}
