// Social Algorithm Version 1.0
//
//
// Sources:
// https://doi.org/10.1145/3757327

import { fetchPosts } from "@/server/posts";

export default class Algorithms {
    // this function takes in all posts and sorts them
    // by how popular they performed relative to views counts.
    // it does not take into account user personalisation.
    // for that, use the forYou() function.
    static async popular(userId: string) {
        const posts = await fetchPosts({ userId })

        const scored = posts.map(post => {
            // calculate hours since created
            const timeSince = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60)

            // overall engagement of the post tailored to the user
            const engagement = (
                // for every like, add 1 point
                post.likes * 1 +
                // for every repost, 2 points
                post.reposts * 2 +
                // for every comment, 1.5
                post.comments * 1.5
            )

            const viewScore =
                // this is a logarithmic scale to prevent posts
                // with higher view counts from scoring extremely
                // high on rankings. so basically diminishing returns.
                // we need this because i.e.
                // a post with 1,000,000 views and 100 engagements
                // would score higher than a post with 10,000 views
                // and 500 engagements.
                // Quacky favours higher engagement percentages, so this is a
                // way to balance it out.
                Math.log10(post.views + 1) * 3

            // percentile of users who actually engage with the post
            // for every 10 views, we calculate the percentage of engagements from the sample
            const engagementRate = engagement / Math.max(post.views, 10)
            // favour recent posts over older ones. 1 week is sweet spot.
            const freshness = Math.exp(-timeSince / (24 * 7));

            // this weighting determines how heavily engagement rates
            // affect the scoring. higher weightings steer towards posts that
            // recieve high engagements relative to their views (meaning
            // that posts with high engagement rates will score higher)
            // smaller weighting steers towards total engagement.
            const engagementWeighting = 25

            // final score is a combination of engagement,
            // view points, engagement rates * weighting,
            // multiplied by the freshness of the post.
            const score = (
                engagement +
                viewScore +
                engagementRate * engagementWeighting
            ) * freshness;

            // return the post
            // with score.
            return {
                ...post,
                score
            }
        })

        // sort posts by highest popularity to lowest
        // in decending order.
        return scored.sort((a, b) => b.score - a.score)
    }
}