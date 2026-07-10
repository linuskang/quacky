//   ______                                 __
//  /      \                               /  |
// /$$$$$$  | __    __   ______    _______ $$ |   __  __    __
// $$ |  $$ |/  |  /  | /      \  /       |$$ |  /  |/  |  /  |
// $$ |  $$ |$$ |  $$ | $$$$$$  |/$$$$$$$/ $$ |_/$$/ $$ |  $$ |
// $$ |_ $$ |$$ |  $$ | /    $$ |$$ |      $$   $$<  $$ |  $$ |
// $$ / \$$ |$$ \__$$ |/$$$$$$$ |$$ \_____ $$$$$$  \ $$ \__$$ |
// $$ $$ $$< $$    $$/ $$    $$ |$$       |$$ | $$  |$$    $$ |
//  $$$$$$  | $$$$$$/   $$$$$$$/  $$$$$$$/ $$/   $$/  $$$$$$$ |
//      $$$/                                         /  \__$$ |
//                                                   $$    $$/
//                                                    $$$$$$/
//
// Linus Kang, 2026
// Work is licensed under the CC BY-NC 4.0 license.

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { MentionHoverCard } from "@/components/mention-hover-card"

const MENTION_REGEX = /(^|[^\w])@([a-zA-Z0-9_]+)/g
const HASHTAG_REGEX = /(^|[^\w])#([a-zA-Z0-9_]+)/g

function linkMentions(content: string) {
    return content.replace(
        MENTION_REGEX,
        (_match, prefix: string, username: string) => {
            return `${prefix}[@${username}](/@${username})`
        }
    )
}

function linkHashtags(content: string) {
    return content.replace(
        HASHTAG_REGEX,
        (_match, prefix: string, tag: string) => {
            return `${prefix}[#${tag}](/trending/${tag.toLowerCase()})`
        }
    )
}

export function Markdown({ children }: { children: string }) {
    return (
        <div className="max-w-full min-w-0 [overflow-wrap:anywhere] break-words">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ children }) => (
                        <h1 className="mt-6 mb-4 text-3xl font-bold first:mt-0">
                            {children}
                        </h1>
                    ),

                    h2: ({ children }) => (
                        <h2 className="mt-5 mb-3 text-2xl font-bold first:mt-0">
                            {children}
                        </h2>
                    ),

                    h3: ({ children }) => (
                        <h3 className="mt-4 mb-3 text-xl font-semibold first:mt-0">
                            {children}
                        </h3>
                    ),

                    h4: ({ children }) => (
                        <h4 className="mt-4 mb-2 text-lg font-semibold first:mt-0">
                            {children}
                        </h4>
                    ),

                    h5: ({ children }) => (
                        <h5 className="mt-4 mb-2 text-base font-semibold first:mt-0">
                            {children}
                        </h5>
                    ),

                    h6: ({ children }) => (
                        <h6 className="mt-4 mb-2 text-sm font-semibold text-muted-foreground first:mt-0">
                            {children}
                        </h6>
                    ),

                    p: ({ children }) => (
                        <p className="mb-3 text-sm leading-6 [overflow-wrap:anywhere] break-words whitespace-pre-wrap last:mb-0">
                            {children}
                        </p>
                    ),

                    strong: ({ children }) => (
                        <strong className="font-semibold text-foreground">
                            {children}
                        </strong>
                    ),

                    em: ({ children }) => (
                        <em className="italic">{children}</em>
                    ),

                    del: ({ children }) => (
                        <del className="line-through opacity-70">
                            {children}
                        </del>
                    ),

                    blockquote: ({ children }) => (
                        <blockquote className="my-3 border-l-4 border-primary pl-4 text-muted-foreground italic">
                            {children}
                        </blockquote>
                    ),

                    ul: ({ children }) => (
                        <ul className="mb-3 list-disc space-y-1 pl-6">
                            {children}
                        </ul>
                    ),

                    ol: ({ children }) => (
                        <ol className="mb-3 list-decimal space-y-1 pl-6">
                            {children}
                        </ol>
                    ),

                    li: ({ children }) => (
                        <li className="text-sm">{children}</li>
                    ),

                    hr: () => <hr className="my-4 border-border" />,

                    a: ({ href, children }) => {
                        const internal = href?.startsWith("/")
                        const mention = href?.match(/^\/@([a-zA-Z0-9_]+)$/)

                        if (mention) {
                            return <MentionHoverCard username={mention[1]} />
                        }

                        return (
                            <a
                                href={href}
                                target={internal ? undefined : "_blank"}
                                rel={
                                    internal ? undefined : "noopener noreferrer"
                                }
                                className="font-medium [overflow-wrap:anywhere] break-words text-primary-2 underline-offset-2 hover:underline"
                            >
                                {children}
                            </a>
                        )
                    },

                    code: ({ className, children }) => {
                        const inline = !className

                        if (inline) {
                            return (
                                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] [overflow-wrap:anywhere] break-words">
                                    {children}
                                </code>
                            )
                        }

                        return <code className={className}>{children}</code>
                    },

                    pre: ({ children }) => (
                        <pre className="my-3 overflow-x-auto rounded-md border border-2 border-border bg-card p-4 text-sm">
                            {children}
                        </pre>
                    ),

                    table: ({ children }) => (
                        <div className="my-3 overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                {children}
                            </table>
                        </div>
                    ),

                    thead: ({ children }) => (
                        <thead className="border-b border-border bg-muted">
                            {children}
                        </thead>
                    ),

                    tbody: ({ children }) => <tbody>{children}</tbody>,

                    tr: ({ children }) => (
                        <tr className="border-b border-border last:border-0">
                            {children}
                        </tr>
                    ),

                    th: ({ children }) => (
                        <th className="px-3 py-2 text-left font-semibold">
                            {children}
                        </th>
                    ),

                    td: ({ children }) => (
                        <td className="px-3 py-2 align-top">{children}</td>
                    ),

                    /* eslint-disable @next/next/no-img-element */
                    img: ({ src, alt }) => (
                        <img
                            src={src ?? ""}
                            alt={alt ?? ""}
                            className="my-3 max-h-[400px] w-full rounded-md border border-border object-cover"
                            loading="lazy"
                        />
                    ),
                    /* eslint-enable @next/next/no-img-element */
                }}
            >
                {linkHashtags(linkMentions(children))}
            </ReactMarkdown>
        </div>
    )
}
