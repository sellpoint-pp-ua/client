"use client"
import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/layout/SiteFooter'
import AccountSidebar from '@/components/account/AccountSidebar'
import ApiProductCard from '@/components/features/ApiProductCard'
import WishlistCard from '@/components/favorites/WishlistCard'
import { authService } from '@/services/authService'
import { Search } from 'lucide-react'
import { useFavorites } from '@/components/favorites/FavoritesProvider'

export default function FavoritesPage() {
	const fav = useFavorites()
	const { picker, lists: favLists, toggleFavorite, ui } = fav
	const [activeTab, setActiveTab] = useState<'products' | 'wishlists'>('products')
	const [userLists, setUserLists] = useState<Array<{ id: string; userId: string; name: string; products: string[] }> | null>(null)
	const [defaultProducts, setDefaultProducts] = useState<Array<{
		id: string
		name: string
		price: number
		discountPrice?: number
		hasDiscount?: boolean
		finalPrice?: number
		discountPercentage?: number
		quantityStatus?: number | string
		quantity?: number
	}>>([])
	const [covers, setCovers] = useState<Record<string, string>>({})
	const [loading, setLoading] = useState<boolean>(false)
	const [searchQuery, setSearchQuery] = useState<string>('')
	const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest')
	const [selectedListId, setSelectedListId] = useState<string | null>(null)
	const [selectedListProducts, setSelectedListProducts] = useState<typeof defaultProducts>([])
	const [drawerOpen, setDrawerOpen] = useState(false)
	const [drawerMode, setDrawerMode] = useState<'create' | 'rename'>('create')
	const [drawerValue, setDrawerValue] = useState('')
	const [renameListId, setRenameListId] = useState<string | null>(null)
	const token = authService.getToken()

	const openCreateDrawer = () => { setDrawerMode('create'); setDrawerValue(''); setRenameListId(null); setDrawerOpen(true) }
	const openRenameDrawer = (id: string, currentName: string) => { setDrawerMode('rename'); setDrawerValue(currentName); setRenameListId(id); setDrawerOpen(true) }
	const closeDrawer = () => setDrawerOpen(false)

	const refreshUserLists = useCallback(async () => {
		if (!token) { setUserLists([]); return }
		setLoading(true)
		try {
			const res = await fetch('https://api.sellpoint.pp.ua/Favorite/GetAllFavoriteProducts', {
				headers: { accept: '*/*', Authorization: `Bearer ${token}` },
				cache: 'no-store',
			})
			const data = res.ok ? await res.json() : []
			setUserLists(Array.isArray(data) ? data : [])
		} finally {
			setLoading(false)
		}
	}, [token])

	useEffect(() => { refreshUserLists() }, [refreshUserLists])

	useEffect(() => {
		const onFavChanged = () => { refreshUserLists() }
		window.addEventListener('favorites:changed', onFavChanged)
		return () => window.removeEventListener('favorites:changed', onFavChanged)
	}, [refreshUserLists])

	async function handleSaveDrawer() {
		const name = drawerValue.trim()
		if (!name) return
		try {
			if (!token) return
			if (drawerMode === 'create') {
				await fetch(`https://api.sellpoint.pp.ua/Favorite/CreateEmptyFavoriteProductCollection?name=${encodeURIComponent(name)}` , { method: 'POST', headers: { accept: '*/*', Authorization: `Bearer ${token}` }, body: '' })
			} else if (drawerMode === 'rename' && renameListId) {
				await fetch(`https://api.sellpoint.pp.ua/Favorite/UpdateFavoriteProductCollectionName?id=${encodeURIComponent(renameListId)}&name=${encodeURIComponent(name)}` , { method: 'PUT', headers: { accept: '*/*', Authorization: `Bearer ${token}` } })
			}
			await refreshUserLists()
			setDrawerOpen(false)
		} catch {}
	}

	async function handleDeleteList(id: string) {
		try {
			if (!token) return
			await fetch(`https://api.sellpoint.pp.ua/Favorite/DeleteFavoriteProductCollection?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers: { accept: '*/*', Authorization: `Bearer ${token}` } })
			await refreshUserLists()
			if (selectedListId === id) setSelectedListId(null)
		} catch {}
	}

	useEffect(() => {
		let cancelled = false
		async function loadDefaultProducts() {
			if (!userLists) return
			const def = userLists.find(l => l.name === 'Товари')
			const ids = def?.products || []
			if (ids.length === 0) { setDefaultProducts([]); return }
			try {
				const results = await Promise.all(ids.map(async (pid) => {
					try {
						const r = await fetch(`/api/products/${pid}`)
						if (!r.ok) return null
						const p = await r.json()
						return {
							id: p?.id || pid,
							name: p?.name || 'Товар',
							price: typeof p?.price === 'number' ? p.price : 0,
							discountPrice: p?.discountPrice,
							hasDiscount: p?.hasDiscount,
							finalPrice: p?.finalPrice,
							discountPercentage: p?.discountPercentage,
							quantityStatus: p?.quantityStatus,
							quantity: p?.quantity,
						}
					} catch { return null }
				}))
				if (!cancelled) setDefaultProducts(results.filter(Boolean) as any)
			} catch {
				if (!cancelled) setDefaultProducts([])
			}
		}
		loadDefaultProducts()
		return () => { cancelled = true }
	}, [userLists])

	useEffect(() => {
		let cancelled = false
		async function loadCovers() {
			if (!userLists) return
			const customs = userLists.filter(l => l.name !== 'Товари')
			const entries = await Promise.all(customs.map(async (l) => {
				const firstId = l.products?.[0]
				if (!firstId) return [l.id, ''] as const
				try {
					const r = await fetch(`/api/products/media/${firstId}`)
					if (!r.ok) return [l.id, ''] as const
					const media = await r.json()
					const first = (Array.isArray(media) ? media : []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0))[0]
					const url = first?.url || first?.secondaryUrl || ''
					return [l.id, url] as const
				} catch { return [l.id, ''] as const }
			}))
			if (!cancelled) {
				const map: Record<string, string> = {}
				for (const [id, url] of entries) map[id] = url
				setCovers(map)
			}
		}
		loadCovers()
		return () => { cancelled = true }
	}, [userLists])

	useEffect(() => {
		let cancelled = false
		async function loadSelected() {
			if (!selectedListId || !userLists) return
			const list = userLists.find(l => l.id === selectedListId)
			const ids = list?.products || []
			if (ids.length === 0) { setSelectedListProducts([]); return }
			try {
				const results = await Promise.all(ids.map(async (pid) => {
					try {
						const r = await fetch(`/api/products/${pid}`)
						if (!r.ok) return null
						const p = await r.json()
						return {
							id: p?.id || pid,
							name: p?.name || 'Товар',
							price: typeof p?.price === 'number' ? p.price : 0,
							discountPrice: p?.discountPrice,
							hasDiscount: p?.hasDiscount,
							finalPrice: p?.finalPrice,
							discountPercentage: p?.discountPercentage,
							quantityStatus: p?.quantityStatus,
							quantity: p?.quantity,
						}
					} catch { return null }
				}))
				if (!cancelled) setSelectedListProducts(results.filter(Boolean) as any)
			} catch {
				if (!cancelled) setSelectedListProducts([])
			}
		}
		loadSelected()
		return () => { cancelled = true }
	}, [selectedListId, userLists])

	const defListEmpty = (userLists?.find(l => l.name === 'Товари')?.products?.length || 0) === 0
	const customLists = (userLists || []).filter(l => l.name !== 'Товари')
	const selectedListEmpty = Boolean(selectedListId && (userLists?.find(l => l.id === selectedListId)?.products?.length || 0) === 0)

	const filteredDefaultProducts = (() => {
		let result = [...defaultProducts]
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase()
			result = result.filter(p => (p.name || '').toLowerCase().includes(q))
		}
		switch (sortBy) {
			case 'price-low':
				result.sort((a, b) => ((a.finalPrice ?? a.price) - (b.finalPrice ?? b.price)))
				break
			case 'price-high':
				result.sort((a, b) => ((b.finalPrice ?? b.price) - (a.finalPrice ?? a.price)))
				break
			case 'newest':
			default:
				break
		}
		return result
	})()

	const filteredSelectedProducts = (() => {
		let result = [...selectedListProducts]
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase()
			result = result.filter(p => (p.name || '').toLowerCase().includes(q))
		}
		switch (sortBy) {
			case 'price-low':
				result.sort((a, b) => ((a.finalPrice ?? a.price) - (b.finalPrice ?? b.price)))
				break
			case 'price-high':
				result.sort((a, b) => ((b.finalPrice ?? b.price) - (a.finalPrice ?? a.price)))
				break
			case 'newest':
			default:
				break
		}
		return result
	})()

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
										<button onClick={() => { setActiveTab('wishlists'); setSelectedListId(null); }} className={`rounded-xl hover:cursor-pointer px-5 py-2 text-sm ${activeTab==='wishlists' ? 'bg-[#4563d1] text-white' : 'bg-white text-gray-700 border-2 border-gray-300'}`}>Списки бажань</button>
										</div>
										<button className="hover:cursor-pointer inline-flex items-center gap-2 rounded-xl border-2 border-[#4563d1] px-4 py-2 text-sm text-[#3046b4] hover:bg-[#4563d1]/10" onClick={openCreateDrawer}>
											<span className="text-lg leading-none text-black">+</span>
											<span>Створити список</span>
										</button>
									</div>
								</div>
							</div>

							{/* Drawer overlay and panel */}
							{/* Overlay */}
							<div
								aria-hidden
								onClick={closeDrawer}
								className={`fixed inset-0 z-[90] bg-gray-700/30 transition-opacity duration-300 ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
							/>
							{/* Panel */}
							<aside
								role="dialog"
								aria-modal="true"
								className={`fixed right-0 top-0 z-[95] h-full w-[420px] max-w-[92vw] bg-white shadow-2xl rounded-l-2xl transition-transform duration-300 ease-out ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
							>
								<div className="relative flex items-center justify-center border-b border-gray-200 p-4">
									<h2 className="text-[18px] font-bold text-gray-900">{drawerMode === 'create' ? 'Створити список' : 'Перейменувати список'}</h2>
									<button aria-label="Закрити" onClick={closeDrawer} className="absolute right-3 top-1/2 font-bold -translate-y-1/2 rounded-lg p-2 hover:bg-gray-100">✕</button>
								</div>
								<div className="p-4">
									<label className="block text-sm text-gray-700 mb-2">Введіть назву списку бажань</label>
									<input value={drawerValue} onChange={(e) => setDrawerValue(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1]" />
									<button onClick={handleSaveDrawer} className="mt-4 w-full rounded-xl bg-[#4563d1] hover:cursor-pointer px-4 py-2 text-sm font-medium text-white hover:bg-[#364ea8]">Зберегти</button>
								</div>
							</aside>

							{/* Favorites picker overlay/drawer */}
							<div
								aria-hidden
								onClick={() => fav.picker.close()}
								className={`fixed inset-0 z-[88] bg-gray-700/30 transition-opacity duration-300 ${picker.isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
							/>
							<aside
								role="dialog"
								aria-modal="true"
								className={`fixed right-0 top-0 z-[89] h-full w-[420px] max-w-[92vw] bg-white shadow-2xl rounded-l-2xl transition-transform duration-300 ease-out ${picker.isOpen ? 'translate-x-0' : 'translate-x-full'}`}
							>
								<div className="relative flex items-center justify-center border-b border-gray-200 p-4">
									<h2 className="text-[18px] font-bold text-gray-900">Додати в список</h2>
									<button aria-label="Закрити" onClick={() => fav.picker.close()} className="absolute right-3 top-1/2 font-bold -translate-y-1/2 rounded-lg p-2 hover:bg-gray-100">✕</button>
								</div>
								<div className="p-3 space-y-2 overflow-y-auto h-[calc(100%-120px)]">
									{(userLists || []).filter(l => l.name !== 'Товари').map((l) => (
										<label key={l.id} className="flex items-center justify-between rounded-xl border border-gray-200 p-3 hover:bg-gray-50">
											<div className="flex items-center gap-3">
												<div className="h-12 w-12 rounded-lg bg-gray-100" />
												<div>
													<div className="text-sm font-semibold text-gray-900">{l.name}</div>
													<div className="text-xs text-gray-500">{(l.products?.length || 0)} товарів</div>
												</div>
											</div>
											<input type="radio" name="fav_pick" value={l.id} onChange={() => toggleFavorite(picker.productId!, { forceListId: l.id })} />
										</label>
									))}
									{(userLists || []).filter(l => l.name === 'Товари').map((l) => (
										<label key={l.id} className="flex items-center justify-between rounded-xl border border-gray-200 p-3 hover:bg-gray-50">
											<div className="flex items-center gap-3">
												<div className="h-12 w-12 rounded-lg bg-gray-100" />
												<div>
													<div className="text-sm font-semibold text-gray-900">Товари</div>
													<div className="text-xs text-gray-500">{(l.products?.length || 0)} товарів</div>
												</div>
											</div>
											<input type="radio" name="fav_pick" value={l.id} onChange={() => toggleFavorite(picker.productId!, { forceListId: l.id })} />
										</label>
									))}
								</div>
								<div className="p-3 border-t border-gray-200">
									<button onClick={openCreateDrawer} className="w-full rounded-xl border-2 border-[#4563d1] px-4 py-2 text-sm text-[#3046b4] hover:bg-[#4563d1]/10">+ Створити список</button>
								</div>
							</aside>

							{/* Toast */}
							<div className={`fixed right-4 top-[84px] z-[98] transition-all duration-300 ${ui.toast ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 -translate-y-2'}`}>
								{ui.toast && (
									<div className="flex items-center gap-3 rounded-xl bg-[#0b0b1a] text-white px-3 py-2 shadow-lg">
										<div className="text-sm">{ui.toast.message}</div>
									</div>
								)}
							</div>

							{/* Content area */}
							{activeTab === 'wishlists' ? (
								<div className="mt-4 space-y-4">
									{selectedListId ? (
										<>
											<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-white shadow-sm p-2">
												<h2 className="text-lg font-semibold text-gray-900 ml-3">{userLists?.find(l => l.id === selectedListId)?.name || 'Список'}</h2>
												<div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end ">
													<div className="inline-flex items-stretch overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm divide-x divide-gray-200 self-start mt-0.5">
														<button type="button" onClick={() => setSortBy('newest')} className={`px-3 py-1.5 text-sm ${sortBy==='newest' ? 'bg-[#4563d1] text-white' : 'text-gray-700 hover:bg-gray-50'}`}>Новинки</button>
														<button type="button" onClick={() => setSortBy('price-low')} className={`px-3 py-1.5 text-sm ${sortBy==='price-low' ? 'bg-[#4563d1] text-white' : 'text-gray-700 hover:bg-gray-50'}`}>Дешевше</button>
														<button type="button" onClick={() => setSortBy('price-high')} className={`px-3 py-1.5 text-sm ${sortBy==='price-high' ? 'bg-[#4563d1] text-white' : 'text-gray-700 hover:bg-gray-50'}`}>Дорожче</button>
													</div>
													<form onSubmit={(e) => e.preventDefault()} className="sm:ml-3">
														<div className="relative">
															<input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} type="text" placeholder="Пошук товарів у списку..." className="w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1]" />
															<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
														</div>
													</form>
												</div>
											</div>

											{selectedListEmpty ? (
												<div className="flex items-center justify-center py-16 text-sm text-gray-600">У цьому списку поки немає обраних товарів.</div>
											) : (
												<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
													{filteredSelectedProducts.map((p) => (
														<ApiProductCard
															key={p.id}
															id={p.id}
															name={p.name}
															price={p.price}
															discountPrice={p.discountPrice}
															hasDiscount={p.hasDiscount}
															finalPrice={p.finalPrice}
															discountPercentage={p.discountPercentage}
															quantityStatus={p.quantityStatus}
															quantity={p.quantity}
														/>
													))}
												</div>
											)}
										</>
									) : (
										customLists.length === 0 ? (
											<div className="flex items-center justify-center py-16 text-sm text-gray-600">Списків поки немає — створіть перший.</div>
										) : (
											customLists.map((l) => (
												<WishlistCard key={l.id} id={l.id} title={l.name} countLabel={`${l.products?.length || 0} товарів`} imageUrl={covers[l.id] || undefined} onClick={() => setSelectedListId(l.id)} onRename={(id, name) => openRenameDrawer(id, name)} onDelete={(id) => handleDeleteList(id)} />
											))
										)
									)}
								</div>
							) : (
								<div className="mt-4">
									{loading && !userLists ? (
										<div className="h-20 rounded bg-gray-100 animate-pulse" />
									) : defListEmpty ? (
										<div className="flex items-center justify-center py-16 text-sm text-gray-600">У цьому списку поки немає обраних товарів.</div>
									) : (
										<>
											<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-white shadow-sm p-2">
												<h2 className="text-lg font-semibold text-gray-900 ml-3">Товари</h2>
												<div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
													<div className="inline-flex items-stretch overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm divide-x divide-gray-200 self-start mt-0.5">
														<button type="button" onClick={() => setSortBy('newest')} className={`px-3 py-1.5 text-sm ${sortBy==='newest' ? 'bg-[#4563d1] text-white' : 'text-gray-700 hover:bg-gray-50'}`}>Новинки</button>
														<button type="button" onClick={() => setSortBy('price-low')} className={`px-3 py-1.5 text-sm ${sortBy==='price-low' ? 'bg-[#4563d1] text-white' : 'text-gray-700 hover:bg-gray-50'}`}>Дешевше</button>
														<button type="button" onClick={() => setSortBy('price-high')} className={`px-3 py-1.5 text-sm ${sortBy==='price-high' ? 'bg-[#4563d1] text-white' : 'text-gray-700 hover:bg-gray-50'}`}>Дорожче</button>
													</div>
													<form onSubmit={(e) => e.preventDefault()} className="sm:ml-3">
														<div className="relative">
															<input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} type="text" placeholder="Пошук товарів у списку..." className="w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1]" />
															<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
														</div>
													</form>
												</div>
											</div>

											<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
												{filteredDefaultProducts.map((p) => (
										<ApiProductCard
											key={p.id}
											id={p.id}
											name={p.name}
											price={p.price}
														discountPrice={p.discountPrice}
														hasDiscount={p.hasDiscount}
														finalPrice={p.finalPrice}
														discountPercentage={p.discountPercentage}
														quantityStatus={p.quantityStatus}
														quantity={p.quantity}
										/>
									))}
											</div>
										</>
									)}
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


