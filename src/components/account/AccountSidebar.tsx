'use client'

import Link from 'next/link'
import { Package, Truck, Heart, MessageSquare, Wallet, BadgePercent, Store, Settings, Headphones, HelpCircle, LogOut } from 'lucide-react'

export default function AccountSidebar() {
	return (
		<aside className="rounded-xl bg-white shadow-sm">
			{/* Profile header */}
			<div className="flex items-center gap-3 border-b border-gray-200 p-4">
				<div className="flex h-10 w-10 aspect-square items-center justify-center rounded-full bg-[#4563d1] text-white font-semibold">IP</div>
				<div>
					<p className="text-sm font-medium text-gray-900">Ім&#39;я Призвище</p>
					<p className="text-xs text-gray-500">+0970000001</p>
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
					<li>
						<Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">
							<HelpCircle className="h-5 w-5" />
							<span>Довідка</span>
						</Link>
					</li>
					<li className="h-px bg-gray-200 my-1">

					</li>
					<li>
						<Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100  ">
							<LogOut className="h-5 w-5" />
							<span>Вийти</span>
						</Link>
					</li>
				</ul>
			</nav>
		</aside>
	)
}


