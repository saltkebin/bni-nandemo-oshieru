# BNI何でも教える君

BNIメンバー向けのAIチャットボット。Difyをバックエンドとした質問応答システムです。

## 機能

- **3つのカテゴリー対応**
  - BNI全般: 一般的なBNIルールや規定
  - SILVISチャプター: チャプター特有のルール
  - エデュケーション何でも教える君: 学習コンテンツ作成支援

- **リアルタイムストリーミング**
  - Dify APIからのストリーミングレスポンス
  - タイピングインジケーター表示

- **スレッド管理**
  - カテゴリー変更時に新しい会話スレッドを開始
  - 会話履歴の自動管理

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の変数を設定してください：

```env
DIFY_APP_API_BASE_URL=https://api.dify.ai/v1
DIFY_APP_API_KEY=your_dify_api_key_here
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスしてください。

## デプロイ

### Vercelでのデプロイ

1. Vercelアカウントにプッシュ
2. 環境変数を設定
3. 自動デプロイ完了

### その他のプラットフォーム

```bash
npm run build
npm start
```

## 技術スタック

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Dify API**

## ファイル構成

```
src/
├── app/
│   ├── api/dify/chat-messages/   # Dify API統合
│   ├── layout.tsx                # レイアウト
│   ├── page.tsx                  # メインページ
│   └── globals.css               # グローバルスタイル
├── components/
│   ├── ChatInterface.tsx         # チャットインターフェース
│   └── SelectForm.tsx            # カテゴリー選択フォーム
└── lib/
    └── types.ts                  # 型定義
```

## 開発ガイド

### カテゴリー追加

`src/lib/types.ts`の`BNISelectOption`型と`SelectForm.tsx`のオプション配列を更新してください。

### スタイルカスタマイズ

`tailwind.config.js`でBNIブランドカラーを調整可能です。

### API統合

Dify APIとの統合は`src/app/api/dify/chat-messages/route.ts`で管理されています。