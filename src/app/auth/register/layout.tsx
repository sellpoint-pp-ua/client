import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Реєстрація | Sell Point',
  description: 'Створіть новий акаунт на Sell Point',
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 