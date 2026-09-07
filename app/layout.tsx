import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "みんなのAIガチャ図鑑",
  description: "AIで作られたガチャガチャをみんなで楽しむ図鑑"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="header">
        <div className="header-inner">
          <div>
            <div className="brand">🎁 みんなのAIガチャ図鑑</div>
            <div className="sub">AIで作ったガチャガチャを集めました</div>
          </div>
          <a className="admin-link" href="/admin">管理</a>
        </div>
      </header>
      {children}
    </>
  );
}