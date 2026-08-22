import React from 'react';
import './globals.css';

export const metadata = {
  title: '이사견적·계약서',
  description: '통인익스프레스 이사견적 및 계약서 PWA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
