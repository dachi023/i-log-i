# Git ルール

## ブランチ戦略

- `main`: 安定版。直接プッシュ禁止
- `develop`: 開発ブランチ（必要に応じて）
- `feature/*`: 機能実装ブランチ
- `fix/*`: バグ修正ブランチ
- `claude/*`: Claude Code作業ブランチ

## コミットメッセージ

Conventional Commits形式:

```
<type>: <description>

[body]
```

### type 一覧
| type | 用途 |
|------|------|
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `refactor` | リファクタリング |
| `docs` | ドキュメント変更 |
| `chore` | ビルド・設定変更 |
| `test` | テスト追加・修正 |
| `style` | フォーマット変更（機能変更なし） |

### 例
```
feat: implement JWT authentication middleware
fix: handle null userDbName in auth context
docs: add API reference documentation
chore: add vitest configuration
```

## PR

- タイトルはコミットメッセージと同じ形式
- 変更の概要とテスト方法を本文に記載
