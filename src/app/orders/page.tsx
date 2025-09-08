"use client"
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/layout/SiteFooter'
import AccountSidebar from '@/components/account/AccountSidebar'
import Image from 'next/image'
import { useState } from 'react'

type OrderItem = {
	productName: string
	price: number
	quantity: number
	imageUrl: string
}

type Order = {
	id: string
	date: string
	status: 'Очікує оплату' | 'У дорозі' | 'Доставлено' | 'Скасовано'
	items: OrderItem[]
	total: number
	sellerName: string
	sellerPhone: string
}

const sampleOrders: Order[] = [
	{
		id: 'SP-2024-001239',
		date: '12.08.2024',
		status: 'У дорозі',
		items: [
			{ productName: 'Бездротові навушники SoundPro X2', price: 1299, quantity: 1, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-images/smartfony.webp' },
			{ productName: 'Силіконовий чохол для смартфона', price: 199, quantity: 2, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-images/avtozap.webp' },
		],
		total: 1697,
		sellerName: 'StyleCloth',
		sellerPhone: '+380 (93) 123-45-67',
	},
	{
		id: 'SP-2024-001102',
		date: '03.08.2024',
		status: 'Доставлено',
		items: [
			{ productName: 'Рюкзак міський NordTrail 25L', price: 1099, quantity: 1, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-images/rukzaki.webp' },
			{ productName: 'Пляшка для води 1L', price: 249, quantity: 1, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-images/zdorovia.webp' },
		],
		total: 1348,
		sellerName: 'WheelStore',
		sellerPhone: '+380 (67) 555-12-12',
	},
	{
		id: 'SP-2024-000987',
		date: '28.07.2024',
		status: 'Очікує оплату',
		items: [
			{ productName: 'Підставка-стіл для ноутбука T8', price: 1656, quantity: 1, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-images/computeri.webp' },
		],
		total: 1656,
		sellerName: 'Style House',
		sellerPhone: '+380 (50) 111-22-33',
	},
]

export default function OrdersPage() {
	const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'shipping' | 'delivered' | 'cancelled'>('all')

	const filtered = sampleOrders.filter((o) => {
		if (activeTab === 'all') return true
		if (activeTab === 'pending') return o.status === 'Очікує оплату'
		if (activeTab === 'shipping') return o.status === 'У дорозі'
		if (activeTab === 'delivered') return o.status === 'Доставлено'
		if (activeTab === 'cancelled') return o.status === 'Скасовано'
		return true
	})

	return (
		<div className="flex min-h-screen flex-col">
			<Header />
			<main className="flex-1 bg-gray-100">
				<div className="mx-auto w-full max-w-[1510px] px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
					<div className="flex flex-col lg:flex-row gap-6">
						<div className="w-full lg:w-[270px] lg:flex-shrink-0">
							<AccountSidebar />
						</div>
						<div className="flex-1 -ml-2">
							{/* Orders header card */}
							<div className="rounded-xl bg-white p-3 sm:p-3 shadow-sm">
								<div className="flex items-center justify-between">
									<h1 className="text-lg font-bold text-gray-900">Мої замовлення</h1>
								</div>
								<div className="mt-8 pt-2">
									<div className="flex flex-wrap gap-3 items-center justify-between">
										<div className="flex items-center gap-2 sm:gap-3">
											<button onClick={() => setActiveTab('all')} className={`hover:cursor-pointer rounded-xl px-4 py-2 text-sm ${activeTab==='all' ? 'bg-[#4563d1] text-white' : 'bg-white text-gray-700 border-2 border-gray-300'}`}>Усі</button>
											<button onClick={() => setActiveTab('pending')} className={`hover:cursor-pointer rounded-xl px-4 py-2 text-sm ${activeTab==='pending' ? 'bg-[#4563d1] text-white' : 'bg-white text-gray-700 border-2 border-gray-300'}`}>Очікує оплату</button>
											<button onClick={() => setActiveTab('shipping')} className={`hover:cursor-pointer rounded-xl px-4 py-2 text-sm ${activeTab==='shipping' ? 'bg-[#4563d1] text-white' : 'bg-white text-gray-700 border-2 border-gray-300'}`}>У дорозі</button>
											<button onClick={() => setActiveTab('delivered')} className={`hover:cursor-pointer rounded-xl px-4 py-2 text-sm ${activeTab==='delivered' ? 'bg-[#4563d1] text-white' : 'bg-white text-gray-700 border-2 border-gray-300'}`}>Доставлено</button>
											<button onClick={() => setActiveTab('cancelled')} className={`hover:cursor-pointer rounded-xl px-4 py-2 text-sm ${activeTab==='cancelled' ? 'bg-[#4563d1] text-white' : 'bg-white text-gray-700 border-2 border-gray-300'}`}>Скасовано</button>
										</div>
										<div className="flex items-center gap-3 ml-auto">
											<input placeholder="Пошук за номером або товаром" className="w-64 bg-white appearance-none rounded-lg border border-gray-300 placeholder-gray-500 text-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1]" />
											
										</div>
									</div>
								</div>
							</div>
							{/* Orders list */}
						<div className="mt-4 rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
							<div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-gray-500">
								<div className="col-span-12 md:col-span-4">Замовлення</div>
								<div className="hidden md:block md:col-span-2">Статус</div>
								<div className="hidden md:block md:col-span-2">Ціна</div>
								<div className="hidden md:block md:col-span-2">Продавець</div>
								<div className="hidden md:block md:col-span-1"></div>
							</div>
							{filtered.map((order, index) => {
								const firstItem = order.items[0]
								const itemsQty = order.items.reduce((s, it) => s + (it.quantity || 0), 0)
								const primaryStatus = 'Нове'
								const secondaryStatus = order.status === 'Доставлено' ? 'Виконано' : order.status === 'У дорозі' ? 'Готове до відправки' : order.status === 'Очікує оплату' ? 'В дорозі' : 'Скасовано'
								const isPaid = order.status !== 'Очікує оплату' && order.status !== 'Скасовано'
								return (
									<div key={order.id} className={`grid grid-cols-12 gap-4 px-4 py-4 items-center ${index !== 0 ? 'border-t border-gray-200' : ''}`}>
										<div className="col-span-12 md:col-span-4">
											<div className="flex items-start gap-4">
												<div className="relative h-28 w-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
													<Image src={firstItem.imageUrl} alt={firstItem.productName} fill className="object-cover" />
												</div>
												<div className="min-w-0">
													<p className="text-xs text-gray-500">Замовлення</p>
													<p className="text-sm font-medium text-gray-900">№{order.id.replace('SP-','')}</p>
													<p className="mt-1 text-xs text-gray-500">{order.date}</p>
													<p className="mt-3 text-xs text-gray-500">{itemsQty} шт.</p>
													<p className="mt-1 text-sm text-[#3046b4] hover:underline cursor-pointer truncate">{firstItem.productName}</p>
												</div>
											</div>
										</div>
										<div className="col-span-6 md:col-span-2 flex md:flex-col md:justify-start gap-2">
											<p className="text-sm text-gray-800">{primaryStatus}</p>
											<p className={`text-sm ${secondaryStatus==='Виконано' ? 'text-green-600' : (secondaryStatus==='Готове до відправки' || secondaryStatus==='В дорозі') ? 'text-blue-600' : 'text-gray-600'}`}>{secondaryStatus}</p>
										</div>
										<div className="col-span-6 md:col-span-2">
											<p className="text-sm font-semibold text-gray-900">{order.total.toLocaleString('uk-UA')} грн</p>
											<p className={`text-sm ${isPaid ? 'text-green-600' : 'text-red-500'}`}>{isPaid ? 'Оплачено' : 'Не оплачено'}</p>
										</div>
										<div className="col-span-8 md:col-span-2">
											<p className="text-sm font-medium text-gray-900">{order.sellerName}</p>
											<p className="text-sm text-gray-700">{order.sellerPhone}</p>
										</div>
										<div className="col-span-4 md:col-span-2 flex md:flex-col md:items-end md:justify-end gap-2">
											<button className="hover:cursor-pointer rounded-lg bg-[#4563d1] px-4 py-2 text-sm text-white hover:bg-[#364ea8] whitespace-nowrap">Додати відгук</button>
											<p className="text-xs text-green-600 md:text-right">Відгук можна додати протягом 11 днів</p>
										</div>
									</div>
								)
							})}
							{filtered.length === 0 && (
								<div className="px-4 py-8 text-center text-gray-500 border-t border-gray-200">Немає замовлень за вибраним фільтром</div>
							)}
						</div>
					</div>
				</div>
			</div>
			</main>
			<SiteFooter />
		</div>
	)
}


