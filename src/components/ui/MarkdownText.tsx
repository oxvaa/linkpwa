import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'

type Props = {
  text: string
  className?: string
}

const inlineToken = /(\[[^\]]+\]\(https?:\/\/[^)]+\)|\|\|[^|]+\|\||\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|`[^`]+`|\*[^*]+\*)/g

export function MarkdownText({ text, className = '' }: Props) {
  const blocks = useMemo(() => parseBlocks(text), [text])
  return <div className={`markdown-text ${className}`}>{blocks.map((block, index) => <Block key={index} block={block} />)}</div>
}

type BlockData =
  | { type: 'text'; value: string }
  | { type: 'heading'; level: number; value: string }
  | { type: 'quote'; value: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'code'; value: string }
  | { type: 'space' }

function parseBlocks(input: string): BlockData[] {
  const lines = input.replace(/\r\n?/g, '\n').split('\n')
  const out: BlockData[] = []
  let inCode = false
  let code: string[] = []
  let list: { ordered: boolean; items: string[] } | null = null

  const flushList = () => {
    if (!list) return
    out.push({ type: 'list', ordered: list.ordered, items: list.items })
    list = null
  }
  const flushCode = () => {
    if (!code.length) return
    out.push({ type: 'code', value: code.join('\n') })
    code = []
  }

  lines.forEach(line => {
    if (line.trim().startsWith('```')) {
      flushList()
      if (inCode) flushCode()
      inCode = !inCode
      return
    }
    if (inCode) {
      code.push(line)
      return
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/)
    const quote = line.match(/^>\s?(.*)$/)
    const bullet = line.match(/^[-*]\s+(.+)$/)
    const numbered = line.match(/^\d+[.)]\s+(.+)$/)

    if (bullet || numbered) {
      const ordered = Boolean(numbered)
      if (!list || list.ordered !== ordered) {
        flushList()
        list = { ordered, items: [] }
      }
      list.items.push((bullet || numbered)![1])
      return
    }

    flushList()
    if (heading) out.push({ type: 'heading', level: heading[1].length, value: heading[2] })
    else if (quote) out.push({ type: 'quote', value: quote[1] })
    else if (!line.trim()) out.push({ type: 'space' })
    else out.push({ type: 'text', value: line })
  })
  flushList()
  if (inCode || code.length) flushCode()
  return out
}

function Block({ block }: { block: BlockData }) {
  if (block.type === 'space') return <div className="h-2" />
  if (block.type === 'code') return <pre className="my-2 overflow-x-auto rounded-[14px] bg-[var(--surface-soft)] px-3 py-2.5 font-mono text-[12px] leading-[1.5]"><code>{block.value}</code></pre>
  if (block.type === 'quote') return <div className="my-1.5 border-l-[3px] border-[var(--link-accent)] bg-[var(--surface-soft)] px-3 py-2 text-[0.95em] text-[var(--muted)]"><Inline text={block.value} /></div>
  if (block.type === 'heading') {
    const cls = block.level === 1 ? 'text-[1.18em] font-black' : block.level === 2 ? 'text-[1.08em] font-black' : 'text-[1em] font-extrabold'
    return <div className={`my-1 ${cls}`}><Inline text={block.value} /></div>
  }
  if (block.type === 'list') {
    const Tag = block.ordered ? 'ol' : 'ul'
    return <Tag className={`my-1 space-y-1 pl-5 ${block.ordered ? 'list-decimal' : 'list-disc'}`}>{block.items.map((item, index) => <li key={index}><Inline text={item} /></li>)}</Tag>
  }
  return <div><Inline text={block.value} /></div>
}

function Inline({ text }: { text: string }) {
  const parts = text.split(inlineToken).filter(Boolean)
  return <>{parts.map((token, index) => renderInline(token, index))}</>
}

function renderInline(token: string, key: number): ReactNode {
  const link = token.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/)
  if (link) return <a key={key} href={link[2]} target="_blank" rel="noreferrer" className="font-bold text-[#0a84ff] underline decoration-[#0a84ff]/40 underline-offset-2">{link[1]}</a>
  if (token.startsWith('||') && token.endsWith('||')) return <Spoiler key={key} text={token.slice(2, -2)} />
  if (token.startsWith('***') && token.endsWith('***')) return <strong key={key} className="font-black italic">{token.slice(3, -3)}</strong>
  if (token.startsWith('**') && token.endsWith('**')) return <strong key={key} className="font-black">{token.slice(2, -2)}</strong>
  if (token.startsWith('__') && token.endsWith('__')) return <span key={key} className="underline underline-offset-2">{token.slice(2, -2)}</span>
  if (token.startsWith('~~') && token.endsWith('~~')) return <span key={key} className="line-through">{token.slice(2, -2)}</span>
  if (token.startsWith('`') && token.endsWith('`')) return <code key={key} className="rounded-md bg-[var(--surface-soft)] px-1 py-0.5 font-mono text-[.9em]">{token.slice(1, -1)}</code>
  if (token.startsWith('*') && token.endsWith('*')) return <em key={key}>{token.slice(1, -1)}</em>
  return token
}

function Spoiler({ text }: { text: string }) {
  const [shown, setShown] = useState(false)
  const hiddenStyle: CSSProperties = { color: 'transparent', textShadow: '0 0 8px var(--text)' }
  return <button type="button" onClick={event => { event.stopPropagation(); setShown(value => !value) }} className="mx-0.5 inline rounded-md bg-[var(--surface-soft)] px-1 py-0.5 text-left" style={shown ? undefined : hiddenStyle}>{text}</button>
}

export function Markdown101() {
  return <div className="space-y-1 text-[12px] leading-[1.45] text-[var(--muted)]">
    <div><b className="text-[var(--text)]">Markdown 101</b> · Admin / CEO posts</div>
    <div>**bold** · *italic* · ***bold italic*** · __underline__ · ~~strike~~</div>
    <div>`code` · ```code block``` · &gt; quote · # heading · - list · ||spoiler|| · [text](https://link.com)</div>
  </div>
}
