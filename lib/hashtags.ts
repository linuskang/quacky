const HASHTAG_REGEX = /(^|[^\w])#([a-zA-Z0-9_]{1,50})/g;

export function extractHashtags(content: string) {
    const hashtags = new Set<string>();

    for (const match of content.matchAll(HASHTAG_REGEX)) {
        hashtags.add(match[2].toLowerCase());
    }

    return [...hashtags];
}
