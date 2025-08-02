'use client'

import Image from 'next/image'
import { Heart } from 'lucide-react'
import Link from 'next/link'

interface ProductCardProps {
  id: string
  title: string
  price: number
  imageUrl: string
}

export default function ProductCard({ id, title, price, imageUrl }: ProductCardProps) {
  return (
    <div className="group relative rounded-lg bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
      <button
        className="absolute right-4 top-4 rounded-full bg-white p-1.5 text-gray-400 opacity-0 transition-opacity hover:text-[#7B1FA2] group-hover:opacity-100"
        aria-label="Add to favorites"
      >
        <Heart className="h-5 w-5" />
      </button>
      
      <Link href={`/product/${id}`}>
        <div className="relative mb-3 aspect-square overflow-hidden rounded-lg">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <h3 className="mb-2 line-clamp-2 min-h-[2.5rem] text-sm text-gray-700">
          {title}
        </h3>
        <p className="text-lg font-semibold text-[#7B1FA2]">
          {price.toLocaleString('uk-UA')} ₴
        </p>
      </Link>
    </div>
  )
} 