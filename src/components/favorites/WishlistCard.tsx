'use client'

import { Copy, MoreVertical } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

interface WishlistCardProps {
	id: string
	title: string
	countLabel: string
	imageUrl?: string
	onClick?: () => void
	onRename?: (id: string, currentName: string) => void
	onDelete?: (id: string) => void
}

export default function WishlistCard({ id, title, countLabel, imageUrl, onClick, onRename, onDelete }: WishlistCardProps) {
	const [menuOpen, setMenuOpen] = useState(false)
	return (
		<div
			role="button"
			tabIndex={0}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault()
					onClick?.()
				}
			}}
			className="w-full text-left transition-shadow hover:shadow-md rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4563d1]/40"
		>
			<div className="relative flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
				<div className="flex items-center gap-4">
					<div className="h-22 w-22 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
						{imageUrl ? (
							<Image 
								src={imageUrl} 
								alt={title} 
								width={88}
								height={88}
								className="h-full w-full object-contain" 
							/>
						) : (
							<div className="flex h-[88px] w-[88px] items-center justify-center text-xs text-gray-400">Немає фото</div>
						)}
					</div>
					<div>
						<h3 className="text-[16px] font-semibold text-gray-900">{title}</h3>
						<p className="text-sm text-gray-500">{countLabel}</p>
					</div>
				</div>
				<div className="flex items-center gap-3">
					<button className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100" aria-label="Меню" onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v) }}>
						<MoreVertical className="h-5 w-5" />
					</button>
					{menuOpen && (
						<div className="absolute right-2 top-12 z-10 w-44 rounded-lg border border-gray-200 bg-white p-2 shadow-lg" onClick={(e) => e.stopPropagation()}>
							<button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-gray-900 hover:bg-gray-50" onClick={() => { setMenuOpen(false); onRename?.(id, title) }}>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-0.92L14.06 7.52l0.92 0.92L5.92 19.58zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/></svg>
								Перейменувати
							</button>
							<button className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-red-600 hover:bg-red-50" onClick={() => { setMenuOpen(false); onDelete?.(id) }}>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-3l-1 1H6v2h13V4z"/></svg>
								Видалити
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}


