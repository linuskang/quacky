"use client";

import type { MockPost } from '../levels/types';

interface Props {
    post: MockPost;
    className?: string;
}

export default function PostMockup({ post, className = '' }: Props) {
    return (
        <div className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 ${className}`}>
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl flex-shrink-0 select-none">
                    {post.avatar}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm truncate">{post.username}</span>
                        {post.verified && (
                            <span className="text-blue-500 text-xs" title="Verified">✓</span>
                        )}
                    </div>
                    <div className="text-gray-400 text-xs">{post.handle} · {post.time}</div>
                </div>
            </div>

            {/* Content */}
            <p className="text-gray-800 text-sm leading-relaxed mb-3">{post.content}</p>

            {/* Link preview */}
            {post.link && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                    <div className="text-blue-600 text-xs font-mono truncate">{post.link}</div>
                    {post.linkPreview && (
                        <div className="text-gray-600 text-xs mt-1">{post.linkPreview}</div>
                    )}
                </div>
            )}

            {/* Comments */}
            {post.comments && post.comments.length > 0 && (
                <div className="border-t border-gray-100 pt-3 mb-3 space-y-2">
                    {post.comments.map((c, i) => (
                        <div key={i} className="flex gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs flex-shrink-0">
                                💬
                            </div>
                            <div className="bg-gray-50 rounded-xl px-3 py-1.5 flex-1">
                                <span className="font-semibold text-gray-800 text-xs">{c.username} </span>
                                <span className="text-gray-700 text-xs">{c.text}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-5 text-gray-400 text-xs border-t border-gray-100 pt-3">
                <button className="flex items-center gap-1.5 hover:text-red-400 transition-colors">
                    <span>♥</span>
                    <span>{post.likes.toLocaleString()}</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-green-500 transition-colors">
                    <span>↺</span>
                    <span>{post.reposts.toLocaleString()}</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                    <span>💬</span>
                    <span>Reply</span>
                </button>
            </div>
        </div>
    );
}
