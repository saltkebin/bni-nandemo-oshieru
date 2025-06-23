import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '【SILVIS】BNI何でも教える君',
  description: 'BNIに関するご質問にAIがお答えします',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}