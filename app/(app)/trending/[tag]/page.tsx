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

// Libaries
import { fetchPosts } from "@/server/posts"
import { requireSession } from "@/server/auth"

// Components
import { PageCenter, PageLayout, PageRight } from "@/components/page-layout"
import { PostList } from "@/components/post"
import { SearchBar } from "@/components/search-bar"
import { Title } from "@/components/text"

// Types
type Props = {
  params: {
    tag: string
  }
}

export default async function TrendingTagPage({ params }: Props) {
  const { tag } = await params

  const session = await requireSession()
  const posts = await fetchPosts({
    userId: session.user.id,
    hashtag: tag,
  })

  return (
    <PageLayout>
      <PageCenter>
        <Title className="text-primary-2">#{tag}</Title>
        <PostList posts={posts} />
      </PageCenter>
      <PageRight>
        <SearchBar />
      </PageRight>
    </PageLayout>
  )
}
