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

import Link from "next/link"
import Image from "next/image"

import { cn } from "@/lib/utils"

type CategoryData = {
    id: string
    imageUrl: string
    title: string
}

type CategoryListProps = {
    categories: CategoryData[]
    className?: string
}

function CategoryCard({ category }: { category: CategoryData }) {
    return (
        <Link
            href={`/shop/category/${category.id}`}
            className="group flex flex-col items-center gap-3 rounded-lg p-0 transition-colors"
        >
            <div className="relative aspect-square w-full max-w-32 overflow-hidden rounded-lg">
                <Image
                    src={category.imageUrl}
                    alt=""
                    fill
                    sizes="128px"
                    className="object-contain p-2 transition-transform group-hover:scale-105"
                />
            </div>
            <span className="text-lg font-extrabold text-primary">
                {category.title}
            </span>
        </Link>
    )
}

export function CategoryList({ categories, className }: CategoryListProps) {
    return (
        <div className={cn("grid grid-cols-2 gap-10 sm:grid-cols-5", className)}>
            {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
            ))}
        </div>
    )
}

export type { CategoryData, CategoryListProps }
