"use client"
import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/layout/SiteFooter'
import AccountSidebar from '@/components/account/AccountSidebar'
import ApiProductCard from '@/components/features/ApiProductCard'
import WishlistCard from '@/components/favorites/WishlistCard'
import { authService } from '@/services/authService'

const favoriteProductsA = [
	{ id: '2001', name: 'Регульований столик для ноутбука ColerPad E-Table LD09', price: 438, hasDiscount: true, finalPrice: 438, discountPercentage: 36, quantityStatus: 'В наявності', quantity: 10, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-images/rukzaki.webp' },
	{ id: '2002', name: 'Скло захисне протиударне для Redmi note 11/11s', price: 90, hasDiscount: false, quantityStatus: 'В наявності', quantity: 100, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-images/smartfony.webp' },
	{ id: '2003', name: 'Підставка столик для ноутбука з кулером T8', price: 1656, hasDiscount: true, finalPrice: 828, discountPercentage: 50, quantityStatus: 'В наявності', quantity: 12, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-images/computeri.webp' },
	{ id: '2004', name: 'Power Bank Dudao wireless power', price: 550, hasDiscount: false, quantityStatus: 'В наявності', quantity: 25, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-images/zdorovia.webp' },
	{ id: '2005', name: 'Рюкзак для тренувань Nike Brasilia', price: 1790, hasDiscount: false, quantityStatus: 'В наявності', quantity: 6, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-images/rukzaki.webp' },
	{ id: '2006', name: 'Зовнішній акумулятор HOCO J102A', price: 699, hasDiscount: false, quantityStatus: 'В наявності', quantity: 20, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-images/avtozap.webp' },
	{ id: '2007', name: 'Смартфон iPhone 11 4/256GB', price: 14999, hasDiscount: false, quantityStatus: 'В наявності', quantity: 4, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-images/smartfony.webp' },
	{ id: '2008', name: 'Power Bank 10 000 mAh Carga', price: 199, hasDiscount: true, finalPrice: 199, discountPercentage: 71, quantityStatus: 'В наявності', quantity: 30, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-images/zdorovia.webp' },
	{ id: '2009', name: 'Зовнішній акумулятор Trusmi Ultra', price: 959, hasDiscount: false, quantityStatus: 'В наявності', quantity: 18, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-images/avtozap.webp' },
	{ id: '2010', name: 'MacBook Pro 16, M3', price: 159499, hasDiscount: true, finalPrice: 148348, discountPercentage: 7, quantityStatus: 'В наявності', quantity: 2, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-images/computeri.webp' },
	{ id: '2011', name: 'Кава розчинна Jacobs Monarch', price: 349, hasDiscount: true, finalPrice: 219, discountPercentage: 37, quantityStatus: 'В наявності', quantity: 40, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-images/kuhna.webp' },
	{ id: '2012', name: 'Набір глянцевих стікерів Домашні Котики', price: 155, hasDiscount: true, finalPrice: 55, discountPercentage: 64, quantityStatus: 'В наявності', quantity: 100, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-images/dim_i_sad.webp' },
]

const favoriteProductsB = [...favoriteProductsA].reverse()
const favoriteProductsC = [...favoriteProductsA].slice(4).concat(favoriteProductsA.slice(0,4))

export default function FavoritesPage() {
	const [activeTab, setActiveTab] = useState<'products' | 'wishlists'>('products')
	const products = activeTab === 'products' ? favoriteProductsA : favoriteProductsB
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
							{/* Favorites header card */}
							<div className="rounded-xl bg-white p-3 sm:p-3 shadow-sm">
								<div className="flex items-center justify-between">
									<h1 className="text-lg font-bold text-gray-900">Обране</h1>
				
								</div>
								<div className="mt-8  pt-2">
									<div className="flex justify-between">
										<div className="flex items-center gap-6">
										<button onClick={() => setActiveTab('products')} className={`hover:cursor-pointer rounded-xl px-5 py-2 text-sm ${activeTab==='products' ? 'bg-[#4563d1] text-white' : 'bg-white text-gray-700 border-2 border-gray-300'}`}>Товари</button>
										<button onClick={() => setActiveTab('wishlists')} className={`rounded-xl hover:cursor-pointer px-5 py-2 text-sm ${activeTab==='wishlists' ? 'bg-[#4563d1] text-white' : 'bg-white text-gray-700 border-2 border-gray-300'}`}>Списки бажань</button>
										</div>
										<button className="hover:cursor-pointer inline-flex items-center gap-2 rounded-xl border-2 border-[#4563d1] px-4 py-2 text-sm text-[#3046b4] hover:bg-[#4563d1]/10">
											<span className="text-lg leading-none text-black">+</span>
											<span>Створити список</span>
										</button>
									</div>
								</div>
							</div>

							{/* Content area */}
							{activeTab === 'wishlists' ? (
								<div className="mt-4 space-y-4">
									<WishlistCard title="Техніка" countLabel="15 товарів" imageUrl="https://cloud.sellpoint.pp.ua/media/products-images/smartfony.webp" />
									<WishlistCard title="Підставка" countLabel="4 товари" imageUrl="https://cloud.sellpoint.pp.ua/media/products-images/computeri.webp" />
								</div>
							) : (
								<div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
									{products.slice(0, 12).map((p) => (
										<ApiProductCard
											key={p.id}
											id={p.id}
											name={p.name}
											price={p.price}
											hasDiscount={p.hasDiscount as boolean}
											finalPrice={p.finalPrice as number}
											discountPercentage={p.discountPercentage as number}
											quantityStatus={p.quantityStatus as string}
											quantity={p.quantity as number}
											imageUrl={p.imageUrl}
										/>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</main>
			<SiteFooter />
		</div>
	)
}


