'use client'

import { Copy, MoreVertical } from 'lucide-react'
import Image from 'next/image'

interface WishlistCardProps {
	title: string
	countLabel: string
	imageUrl: string
}

export default function WishlistCard({ title, countLabel, imageUrl }: WishlistCardProps) {
	return (
		<div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
			<div className="flex items-center gap-4">
				<div className="h-22 w-22 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
					<Image 
						src={imageUrl} 
						alt={title} 
						width={88}
						height={88}
						className="h-full w-full object-contain" 
					/>
				</div>
				<div>
					<h3 className="text-[16px] font-semibold text-gray-900">{title}</h3>
					<p className="text-sm text-gray-500">{countLabel}</p>
				</div>
			</div>
			<div className="flex items-center gap-3">
				<button className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100" aria-label="Копіювати посилання">
					<Copy className="h-5 w-5" />
				</button>
				<button className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100" aria-label="Меню">
					<MoreVertical className="h-5 w-5" />
				</button>
			</div>
		</div>
	)
}


