# みんなのAIガチャ図鑑・完成版

AIで作ったガチャガチャ画像を集めて、誰でもログインなしで「見る→ガチャを回す→GET」まで遊べるWebアプリです。

## できること

### 公開ユーザー
- ログイン不要
- ガチャ一覧を見る
- ガチャ画像をタップ
- ガチャマシンのハンドルを回す
- マシンが揺れる
- カプセルが出る
- GET画面を見る

### 管理者
- `/admin` にアクセス
- ユーザー登録・アカウントログインは不要
- 管理キーだけで入室
- 画像を複数枚まとめて追加
- 番号は自動採番
- タイトル・作者名を登録
- タイトル・作者名を編集
- 画像を差し替え
- 削除
- 画像はSupabase Storage、データはSupabase Databaseに保存

## 本番構成

Vercel + Supabase

管理キーはサーバー側だけで検証し、Supabase Secret Keyもブラウザには公開しません。

## 公開する手順

### 1. Supabaseを用意
Supabaseで新しいプロジェクトを作ります。

SQL Editorを開き、`supabase/schema.sql` の内容を全部貼り付けて実行します。

### 2. 環境変数を設定
Vercelのプロジェクト設定 → Environment Variables に以下を登録します。

`SUPABASE_URL`
- SupabaseプロジェクトURL

`SUPABASE_SECRET_KEY`
- SupabaseのSecret Key
- ブラウザ側には絶対に書かない

`ADMIN_KEY`
- 自分だけが知っている長いランダム文字列
- 例：`gacha-admin-` にランダムな文字列を十分長く追加

### 3. Vercelへ配置
このフォルダをGitHubリポジトリにアップロードし、そのリポジトリをVercelからImportします。

Androidでも、
GitHub → New repository → Upload files
でこのフォルダ内のファイルをアップロードできます。

### 4. 公開後
公開ページ：
`https://あなたのドメイン.vercel.app/`

管理ページ：
`https://あなたのドメイン.vercel.app/admin`

公開ページは誰でも見られます。
管理ページだけ管理キーが必要です。

## 重要

- `SUPABASE_SECRET_KEY` をGitHubへアップロードしないでください。
- `.env.local` はGitHubへアップロードしないでください。
- `.env.example` は見本なので公開して問題ありません。
- 実際の画像はSupabase Storageに保存されるため、Vercelの再デプロイで消えません。
- 150枚程度の画像でも、Storage容量・転送量のプラン上限には注意してください。

## ローカル確認

Node.jsを入れたPCで、

```bash
npm install
npm run dev
```

を実行し、`http://localhost:3000` を開きます。

このアプリは「公開ユーザーはログイン不要」「管理者だけ管理キー」という構成です。
