import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Вхід | Sell Point',
  description: 'Увійдіть до свого акаунту на Sell Point',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 