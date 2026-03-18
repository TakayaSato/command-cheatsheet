import { useMemo, useState } from 'react'
import './App.css'

type CommandItem = {
  id: string
  title: string
  command: string
  description: string
  category: string
  tags: string[]
  example?: string
}

const COMMANDS: CommandItem[] = [
  {
    id: 'ls-basic',
    title: '一覧を見やすく表示',
    command: 'ls -lah',
    description: '隠しファイルとサイズ、権限を人間に読みやすい形式で表示。',
    category: 'ファイル操作',
    tags: ['ls', '一覧', '権限'],
    example: 'ls -lah ~/projects',
  },
  {
    id: 'ls-sort-time',
    title: '更新日時でソート',
    command: 'ls -lt',
    description: '更新が新しい順に並べる。',
    category: 'ファイル操作',
    tags: ['ls', '一覧', '日時'],
    example: 'ls -lt /var/log',
  },
  {
    id: 'ls-only-dir',
    title: 'ディレクトリだけ表示',
    command: 'ls -d */',
    description: 'カレント直下のディレクトリのみ。',
    category: 'ファイル操作',
    tags: ['ls', '一覧', 'ディレクトリ'],
  },
  {
    id: 'cd-back',
    title: '直前のディレクトリに戻る',
    command: 'cd -',
    description: '直前にいたディレクトリへ即座に移動。',
    category: 'ファイル操作',
    tags: ['cd', '移動'],
    example: 'cd -',
  },
  {
    id: 'cp-recursive',
    title: 'ディレクトリをコピー',
    command: 'cp -R src backup-src',
    description: 'フォルダごと再帰的にコピー。',
    category: 'ファイル操作',
    tags: ['cp', 'コピー'],
  },
  {
    id: 'mv-force',
    title: '上書き確認なしで移動',
    command: 'mv -f file.txt backup.txt',
    description: '同名ファイルを強制上書き。',
    category: 'ファイル操作',
    tags: ['mv', '移動'],
  },
  {
    id: 'mkdir-tree',
    title: '親ディレクトリごと作成',
    command: 'mkdir -p path/to/dir',
    description: '途中の階層もまとめて作成。',
    category: 'ファイル操作',
    tags: ['mkdir', '作成'],
  },
  {
    id: 'touch-multi',
    title: '空ファイルを複数作成',
    command: 'touch a.txt b.txt c.txt',
    description: '複数ファイルをまとめて作成。',
    category: 'ファイル操作',
    tags: ['touch', '作成'],
  },
  {
    id: 'find-name',
    title: 'ファイル名で検索',
    command: 'find . -name "*.log"',
    description: 'カレント以下から拡張子で検索。',
    category: '検索',
    tags: ['find', '検索'],
  },
  {
    id: 'find-type',
    title: 'ディレクトリだけ検索',
    command: 'find . -type d -name "src"',
    description: '指定名のディレクトリを探す。',
    category: '検索',
    tags: ['find', '検索', 'ディレクトリ'],
  },
  {
    id: 'find-mtime',
    title: '更新日で検索',
    command: 'find . -mtime -7',
    description: '7日以内に更新されたファイル。',
    category: '検索',
    tags: ['find', '更新日'],
  },
  {
    id: 'rg-fast',
    title: '高速全文検索',
    command: 'rg "TODO" src',
    description: 'Ripgrepで指定ディレクトリを高速検索。',
    category: '検索',
    tags: ['rg', '検索', 'テキスト'],
    example: 'rg "useMemo" src',
  },
  {
    id: 'rg-filetype',
    title: '拡張子限定で検索',
    command: 'rg "API" -g "*.ts"',
    description: '特定の拡張子だけを対象に検索。',
    category: '検索',
    tags: ['rg', '拡張子'],
  },
  {
    id: 'rg-hidden',
    title: '隠しファイルも検索',
    command: 'rg "token" -uu',
    description: '隠しファイルや無視対象も含めて検索。',
    category: '検索',
    tags: ['rg', '隠し'],
  },
  {
    id: 'grep-context',
    title: '前後行付き検索',
    command: 'grep -n -C 2 "ERROR" app.log',
    description: '一致行の前後を含めて表示。',
    category: '検索',
    tags: ['grep', 'ログ'],
  },
  {
    id: 'grep-ignore-case',
    title: '大文字小文字を無視',
    command: 'grep -in "warning" app.log',
    description: '大文字小文字を区別せず検索。',
    category: '検索',
    tags: ['grep', 'ログ', '大文字小文字'],
  },
  {
    id: 'sed-replace',
    title: '文字列の一括置換',
    command: "sed -i '' 's/foo/bar/g' file.txt",
    description: 'macOS向けのインプレース置換。',
    category: 'テキスト',
    tags: ['sed', '置換'],
  },
  {
    id: 'sed-range',
    title: '行範囲だけ出力',
    command: "sed -n '10,20p' file.txt",
    description: '指定した行範囲だけ表示。',
    category: 'テキスト',
    tags: ['sed', '抽出'],
  },
  {
    id: 'awk-col',
    title: '特定列を抽出',
    command: "awk '{print $1, $3}' file.txt",
    description: 'スペース区切りの列を抽出。',
    category: 'テキスト',
    tags: ['awk', '抽出'],
  },
  {
    id: 'awk-filter',
    title: '条件に合う行だけ抽出',
    command: "awk '$3 > 100 {print $0}' data.txt",
    description: '3列目が100を超える行を出力。',
    category: 'テキスト',
    tags: ['awk', 'フィルタ'],
  },
  {
    id: 'tail-follow',
    title: 'ログを追従表示',
    command: 'tail -f /var/log/system.log',
    description: 'ログの末尾をリアルタイムに確認。',
    category: 'ログ',
    tags: ['tail', 'ログ'],
  },
  {
    id: 'tail-lines',
    title: '末尾100行だけ表示',
    command: 'tail -n 100 app.log',
    description: '最新の100行だけを確認。',
    category: 'ログ',
    tags: ['tail', 'ログ'],
  },
  {
    id: 'head-lines',
    title: '先頭20行だけ表示',
    command: 'head -n 20 app.log',
    description: 'ログの先頭だけを確認。',
    category: 'ログ',
    tags: ['head', 'ログ'],
  },
  {
    id: 'less-search',
    title: 'ページャで検索',
    command: 'less +/ERROR app.log',
    description: 'lessで開いて検索語へジャンプ。',
    category: 'ログ',
    tags: ['less', 'ログ'],
  },
  {
    id: 'du-size',
    title: '容量を確認',
    command: 'du -sh * | sort -h',
    description: 'ディレクトリごとのサイズを並べて表示。',
    category: 'ファイル操作',
    tags: ['du', '容量'],
  },
  {
    id: 'df-human',
    title: 'ディスク使用量',
    command: 'df -h',
    description: 'ディスクの空き容量を人間向け表示。',
    category: 'ファイル操作',
    tags: ['df', '容量'],
  },
  {
    id: 'ps-port',
    title: 'ポート使用状況',
    command: 'lsof -i :3000',
    description: '指定ポートを使っているプロセスを確認。',
    category: 'プロセス',
    tags: ['lsof', 'ポート'],
  },
  {
    id: 'ps-list',
    title: 'プロセスを絞り込み',
    command: 'ps aux | grep node',
    description: 'プロセス一覧から対象を検索。',
    category: 'プロセス',
    tags: ['ps', 'grep'],
  },
  {
    id: 'top-live',
    title: 'リソース監視',
    command: 'top',
    description: 'CPU・メモリ使用率をリアルタイム表示。',
    category: 'プロセス',
    tags: ['top', '監視'],
  },
  {
    id: 'kill-port',
    title: 'ポート開放',
    command: 'kill -9 $(lsof -ti :3000)',
    description: 'ポートを使用しているプロセスを強制終了。',
    category: 'プロセス',
    tags: ['kill', 'lsof'],
  },
  {
    id: 'kill-by-name',
    title: '名前でプロセス終了',
    command: 'pkill -f node',
    description: 'プロセス名でまとめて終了。',
    category: 'プロセス',
    tags: ['pkill', 'プロセス'],
  },
  {
    id: 'curl-json',
    title: 'APIを叩いて整形',
    command: 'curl -s https://api.example.com | jq',
    description: 'JSONを整形して見やすく表示。',
    category: 'ネットワーク',
    tags: ['curl', 'jq', 'API'],
  },
  {
    id: 'curl-headers',
    title: 'レスポンスヘッダ確認',
    command: 'curl -I https://example.com',
    description: 'HTTPヘッダだけ取得。',
    category: 'ネットワーク',
    tags: ['curl', 'HTTP'],
  },
  {
    id: 'curl-post',
    title: 'JSONをPOST',
    command: "curl -X POST -H 'Content-Type: application/json' -d '{\"name\":\"demo\"}' https://api.example.com",
    description: 'APIへJSONを送信。',
    category: 'ネットワーク',
    tags: ['curl', 'POST', 'API'],
  },
  {
    id: 'ping-host',
    title: '疎通確認',
    command: 'ping -c 5 example.com',
    description: '指定回数だけ疎通を確認。',
    category: 'ネットワーク',
    tags: ['ping', '疎通'],
  },
  {
    id: 'dig-dns',
    title: 'DNS確認',
    command: 'dig example.com',
    description: 'DNSの応答を確認。',
    category: 'ネットワーク',
    tags: ['dig', 'DNS'],
  },
  {
    id: 'traceroute',
    title: '経路を調べる',
    command: 'traceroute example.com',
    description: '通信経路のホップを確認。',
    category: 'ネットワーク',
    tags: ['traceroute', 'ネットワーク'],
  },
  {
    id: 'ssh-key',
    title: 'SSH鍵の作成',
    command: 'ssh-keygen -t ed25519 -C "you@example.com"',
    description: 'ed25519で鍵を作成。',
    category: 'ネットワーク',
    tags: ['ssh', '鍵'],
  },
  {
    id: 'ssh-connect',
    title: 'SSH接続',
    command: 'ssh user@host',
    description: 'リモートサーバーへ接続。',
    category: 'ネットワーク',
    tags: ['ssh', '接続'],
  },
  {
    id: 'git-status',
    title: '差分と状態',
    command: 'git status -sb',
    description: 'ブランチと変更点を簡潔に表示。',
    category: 'Git',
    tags: ['git', 'status'],
  },
  {
    id: 'git-log',
    title: 'ログを見やすく',
    command: 'git log --oneline --graph --decorate -n 10',
    description: 'グラフ付きで直近の履歴を表示。',
    category: 'Git',
    tags: ['git', 'log'],
  },
  {
    id: 'git-diff',
    title: '差分だけ確認',
    command: 'git diff',
    description: '未コミット差分を表示。',
    category: 'Git',
    tags: ['git', 'diff'],
  },
  {
    id: 'git-stash',
    title: '変更を一時退避',
    command: 'git stash -u',
    description: '未追跡ファイルも含めて退避。',
    category: 'Git',
    tags: ['git', 'stash'],
  },
  {
    id: 'git-rebase',
    title: '直前を修正コミット',
    command: 'git commit --amend',
    description: '直前のコミットを編集。',
    category: 'Git',
    tags: ['git', 'commit'],
  },
  {
    id: 'git-reset',
    title: '直前のコミットへ戻す',
    command: 'git reset --soft HEAD~1',
    description: 'コミットを取り消し、変更は保持。',
    category: 'Git',
    tags: ['git', 'reset'],
  },
  {
    id: 'git-checkout',
    title: 'ブランチ作成と移動',
    command: 'git switch -c feature/login',
    description: '新規ブランチを作成して移動。',
    category: 'Git',
    tags: ['git', 'branch'],
  },
  {
    id: 'git-clean',
    title: '不要ファイルの削除',
    command: 'git clean -fd',
    description: '未追跡ファイルを削除。',
    category: 'Git',
    tags: ['git', 'clean'],
  },
  {
    id: 'npm-list',
    title: '依存関係の重さ確認',
    command: 'npm ls --depth=0',
    description: 'トップレベルの依存だけを表示。',
    category: 'パッケージ',
    tags: ['npm', '依存'],
  },
  {
    id: 'npm-run',
    title: 'スクリプト一覧',
    command: 'npm run',
    description: 'package.jsonのscriptsを一覧表示。',
    category: 'パッケージ',
    tags: ['npm', 'scripts'],
  },
  {
    id: 'npm-outdated',
    title: '更新可能パッケージ',
    command: 'npm outdated',
    description: '古い依存を確認。',
    category: 'パッケージ',
    tags: ['npm', '更新'],
  },
  {
    id: 'npm-install-save',
    title: '依存を追加',
    command: 'npm i axios',
    description: '依存を追加してpackage.jsonへ保存。',
    category: 'パッケージ',
    tags: ['npm', 'install'],
  },
  {
    id: 'npm-audit',
    title: '脆弱性チェック',
    command: 'npm audit',
    description: '依存パッケージの脆弱性をチェック。',
    category: 'パッケージ',
    tags: ['npm', 'セキュリティ'],
  },
  {
    id: 'npx-run',
    title: 'npxでツール実行',
    command: 'npx eslint .',
    description: 'ローカルのeslintを起動。',
    category: 'パッケージ',
    tags: ['npx', 'lint'],
  },
  {
    id: 'docker-ps',
    title: 'コンテナ一覧',
    command: 'docker ps -a',
    description: '停止中を含む全コンテナを表示。',
    category: 'Docker',
    tags: ['docker', '一覧'],
  },
  {
    id: 'docker-images',
    title: 'イメージ一覧',
    command: 'docker images',
    description: 'ローカルのDockerイメージを表示。',
    category: 'Docker',
    tags: ['docker', 'イメージ'],
  },
  {
    id: 'docker-logs',
    title: 'コンテナログ確認',
    command: 'docker logs -f container_name',
    description: 'ログを追従表示。',
    category: 'Docker',
    tags: ['docker', 'ログ'],
  },
  {
    id: 'docker-exec',
    title: 'コンテナ内に入る',
    command: 'docker exec -it container_name /bin/bash',
    description: 'シェルでコンテナ内部に入る。',
    category: 'Docker',
    tags: ['docker', 'exec'],
  },
  {
    id: 'docker-clean',
    title: '不要なDockerデータ削除',
    command: 'docker system prune',
    description: '未使用のコンテナやイメージを削除。',
    category: 'Docker',
    tags: ['docker', '掃除'],
  },
  {
    id: 'tar-zip',
    title: 'ディレクトリを圧縮',
    command: 'tar -czf archive.tar.gz ./dist',
    description: 'distをgzip圧縮。',
    category: '圧縮',
    tags: ['tar', '圧縮'],
  },
  {
    id: 'tar-list',
    title: 'tarの中身を確認',
    command: 'tar -tf archive.tar.gz',
    description: '解凍せずに中身を一覧。',
    category: '圧縮',
    tags: ['tar', '一覧'],
  },
  {
    id: 'unzip',
    title: 'zipを展開',
    command: 'unzip archive.zip -d ./output',
    description: '出力先を指定して展開。',
    category: '圧縮',
    tags: ['unzip', '展開'],
  },
]

const UNIQUE_TAGS = Array.from(
  new Set(COMMANDS.flatMap((item) => item.tags))
).sort()

function App() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('すべて')
  const [tag, setTag] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const categories = useMemo(() => {
    const items = Array.from(new Set(COMMANDS.map((item) => item.category)))
    return ['すべて', ...items]
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return COMMANDS.filter((item) => {
      const matchesCategory = category === 'すべて' || item.category === category
      const matchesTag = !tag || item.tags.includes(tag)
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.command.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      return matchesCategory && matchesTag && matchesQuery
    })
  }, [query, category, tag])

  const handleCopy = async (command: string, id: string) => {
    try {
      await navigator.clipboard.writeText(command)
      setCopiedId(id)
      window.setTimeout(() => setCopiedId(null), 1200)
    } catch {
      setCopiedId('error')
      window.setTimeout(() => setCopiedId(null), 1200)
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Command Search for Web Dev</p>
          <h1>Linuxコマンド早見＆検索</h1>
          <p className="lead">
            よく使うコマンドをカード形式で整理。検索・タグで絞り込んで
            すぐにコピーできます。
          </p>
        </div>
        <div className="hero-panel">
          <div className="search-box">
            <label className="search-label" htmlFor="search">
              コマンドを検索
            </label>
            <div className="search-row">
              <input
                id="search"
                type="search"
                placeholder="例: grep, docker, ポート, JSON"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <button
                className="ghost"
                type="button"
                onClick={() => {
                  setQuery('')
                  setTag('')
                  setCategory('すべて')
                }}
              >
                クリア
              </button>
            </div>
            <div className="stats">
              <span>{filtered.length} 件</span>
              <span className="dot" aria-hidden="true"></span>
              <span>全 {COMMANDS.length} 件</span>
              {tag ? (
                <span className="chip active">#{tag}</span>
              ) : (
                <span className="chip">タグ未選択</span>
              )}
            </div>
          </div>
          <div className="tag-select">
            <label className="tag-title" htmlFor="tag-select">
              人気タグ
            </label>
            <div className="select-wrap">
              <select
                id="tag-select"
                value={tag}
                onChange={(event) => setTag(event.target.value)}
              >
                <option value="">タグを選択</option>
                {UNIQUE_TAGS.map((item) => (
                  <option key={item} value={item}>
                    #{item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <section className="toolbar">
        <div className="category">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={`pill ${item === category ? 'active' : ''}`}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="note">
          GitHub Pages向けに、データはコードに内包しています。
        </div>
      </section>

      <section className="grid">
        {filtered.map((item) => (
          <article key={item.id} className="card">
            <div className="card-head">
              <div>
                <p className="card-title">{item.title}</p>
                <p className="card-desc">{item.description}</p>
              </div>
              <button
                className="copy"
                type="button"
                onClick={() => handleCopy(item.command, item.id)}
              >
                {copiedId === item.id ? 'コピー済み' : 'コピー'}
              </button>
            </div>
            <div className="command">
              <code>{item.command}</code>
            </div>
            {item.example ? (
              <div className="example">
                <span>例</span>
                <code>{item.example}</code>
              </div>
            ) : null}
            <div className="meta">
              <span className="badge">{item.category}</span>
              <div className="meta-tags">
                {item.tags.map((tagItem) => (
                  <button
                    key={tagItem}
                    type="button"
                    className="mini"
                    onClick={() => setTag(tagItem)}
                  >
                    #{tagItem}
                  </button>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>

      {filtered.length === 0 ? (
        <section className="empty">
          <h2>一致するコマンドがありません</h2>
          <p>キーワードを変えるか、タグ・カテゴリを外してみてください。</p>
        </section>
      ) : null}

      <footer className="footer">
        <div>
          <h2>提案</h2>
          <p>
            追加したいコマンドは <code>src/App.tsx</code> の{' '}
            <code>COMMANDS</code> に追記するだけ。
          </p>
        </div>
        <div className="footer-kbd">
          <span>検索のヒント</span>
          <div className="kbd-row">
            <kbd>grep</kbd>
            <kbd>docker</kbd>
            <kbd>ログ</kbd>
            <kbd>ポート</kbd>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
