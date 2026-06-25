import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children }: { children: string }) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                h1: ({ children }) => (
                    <h1 className="mb-4 mt-6 text-3xl font-bold first:mt-0">
                        {children}
                    </h1>
                ),

                h2: ({ children }) => (
                    <h2 className="mb-3 mt-5 text-2xl font-bold first:mt-0">
                        {children}
                    </h2>
                ),

                h3: ({ children }) => (
                    <h3 className="mb-3 mt-4 text-xl font-semibold first:mt-0">
                        {children}
                    </h3>
                ),

                h4: ({ children }) => (
                    <h4 className="mb-2 mt-4 text-lg font-semibold first:mt-0">
                        {children}
                    </h4>
                ),

                h5: ({ children }) => (
                    <h5 className="mb-2 mt-4 text-base font-semibold first:mt-0">
                        {children}
                    </h5>
                ),

                h6: ({ children }) => (
                    <h6 className="mb-2 mt-4 text-sm font-semibold text-muted-foreground first:mt-0">
                        {children}
                    </h6>
                ),

                p: ({ children }) => (
                    <p className="mb-3 whitespace-pre-wrap text-sm leading-6 last:mb-0">
                        {children}
                    </p>
                ),

                strong: ({ children }) => (
                    <strong className="font-semibold text-foreground">
                        {children}
                    </strong>
                ),

                em: ({ children }) => (
                    <em className="italic">
                        {children}
                    </em>
                ),

                del: ({ children }) => (
                    <del className="opacity-70 line-through">
                        {children}
                    </del>
                ),

                blockquote: ({ children }) => (
                    <blockquote className="my-3 border-l-4 border-primary pl-4 italic text-muted-foreground">
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
                    <li className="text-sm">
                        {children}
                    </li>
                ),

                hr: () => (
                    <hr className="my-4 border-border" />
                ),

                a: ({ href, children }) => (
                    <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary-2 hover:underline underline-offset-2"
                    >
                        {children}
                    </a>
                ),

                code: ({ className, children }) => {
                    const inline = !className;

                    if (inline) {
                        return (
                            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]">
                                {children}
                            </code>
                        );
                    }

                    return (
                        <code className={className}>
                            {children}
                        </code>
                    );
                },

                pre: ({ children }) => (
                    <pre className="my-3 overflow-x-auto rounded-md border border-border border-2 bg-card p-4 text-sm">
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

                tbody: ({ children }) => (
                    <tbody>
                        {children}
                    </tbody>
                ),

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
                    <td className="px-3 py-2 align-top">
                        {children}
                    </td>
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
            {children}
        </ReactMarkdown>
    );
}