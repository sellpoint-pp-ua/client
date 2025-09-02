'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Package, Truck, Heart, MessageSquare, Wallet, BadgePercent, Store, Settings, Headphones, HelpCircle, LogOut } from 'lucide-react'
import { authService } from '@/services/authService'

export default function AccountSidebar() {
	const [userName, setUserName] = useState<string>('')
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
	const router = useRouter()

	useEffect(() => {
		const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
		if (!token) {
			setUserName('')
			setAvatarUrl(null)
			return
		}
		let cancelled = false
		async function loadCurrentUser() {
			try {
				const res = await fetch('/api/users/current', {
					headers: { 'Authorization': `Bearer ${token}` },
					cache: 'no-store',
				})
				if (!res.ok) return
				const u = await res.json()
				if (cancelled) return
				const name: string = typeof u?.username === 'string' ? u.username : (localStorage.getItem('user_display_name') || '')
				const avatar: string | null = typeof u?.avatarUrl === 'string' ? u.avatarUrl : null
				setUserName(name)
				setAvatarUrl(avatar)
			} catch {}
		}
		loadCurrentUser()
		return () => { cancelled = true }
	}, [])

	const initials = useMemo(() => {
		if (!userName) return '—'
		const parts = userName.trim().split(/\s+/)
		const first = parts[0]?.[0] || ''
		const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
		return (first + last).toUpperCase() || first.toUpperCase() || '—'
	}, [userName])

	const handleLogout = useCallback(async () => {
		try {
			await authService.serverLogout()
		} finally {
			router.push('/')
		}
	}, [router])

	return (
		<aside className="rounded-xl bg-white shadow-sm">
			{/* Profile header */}
			<div className="flex items-center gap-3 border-b border-gray-200 p-4">
				<div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-200 flex-shrink-0">
					{avatarUrl ? (
						<Image src={avatarUrl} alt={userName || 'User'} fill className="object-cover" />
					) : (
						<div className="flex h-full w-full items-center justify-center bg-[#4563d1] text-white font-semibold">{initials}</div>
					)}
				</div>
				<div>
					<p className="text-sm font-medium text-gray-900">{userName || 'Кабінет'}</p>
					<p className="text-xs text-gray-500">&nbsp;</p>
				</div>
			</div>

			{/* Menu */}
			<nav className="p-2 text-sm">
				<ul className="space-y-1">
					<li>
						<Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">
							<Package className="h-5 w-5" />
							<span>Мої замовлення</span>
						</Link>
					</li>
					<li>
						<Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">
							<Truck className="h-5 w-5" />
							<span>Відстеження замовлення</span>
						</Link>
					</li>
					<li>
						<Link href="/favorites" className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#4563d1] bg-[#4563d1]/10">
							<Heart className="h-5 w-5" />
							<span>Обране</span>
						</Link>
					</li>
					<li>
						<Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">
							<MessageSquare className="h-5 w-5" />
							<span>Відгуки</span>
						</Link>
					</li>
					<li>
						<Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">
							<Wallet className="h-5 w-5" />
							<span>Мій гаманець</span>
						</Link>
					</li>
					<li>
						<Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">
							<BadgePercent className="h-5 w-5" />
							<span>Знижки та бонуси</span>
						</Link>
					</li>
					<li>
						<Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">
							<Store className="h-5 w-5" />
							<span>Створити магазин на sell point</span>
						</Link>
					</li>
					<li>
						<Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">
							<Settings className="h-5 w-5" />
							<span>Налаштування</span>
						</Link>
					</li>
					<li>
						<Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">
							<Headphones className="h-5 w-5" />
							<span>Sell point-підтримка</span>
						</Link>
					</li>
					<li className="h-px bg-gray-200 my-1">

					</li>
					<li>
						<button onClick={handleLogout} className="w-full hover:cursor-pointer text-left flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">
							<LogOut className="h-5 w-5" />
							<span>Вийти</span>
						</button>
					</li>
				</ul>
			</nav>
		</aside>
	)
}


