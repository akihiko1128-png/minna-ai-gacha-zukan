import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "みんなのAIガチャ図鑑",
  description: "AIで作られた作品を集める図鑑",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a className="floating-admin" href="/admin">
        ⚙ 管理
      </a>

      {children}
    </>
  );
}
