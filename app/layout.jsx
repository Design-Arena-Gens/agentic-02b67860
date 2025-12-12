import './globals.css';

export const metadata = {
  title: 'المفتش - لوحة المتابعة الذكية',
  description:
    'نظام شامل لإدارة بيانات المفتشية، التقارير، المراسلات، الجداول، والمواعيد مع تنبيهات ذكية.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
