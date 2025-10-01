"use client"
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/layout/SiteFooter'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'

type ApiOrder = {
	id: string
	orderNumber: string
	sellerId: string
	createdAt: string
	pcs: number
	totalPrice: number
	miniProductsInfo?: { productId?: string; productName?: string; price?: number; image?: { sourceUrl?: string; compressedUrl?: string } }
	payed?: boolean | null
	status?: number
	deliveryToInfo?: { address?: string; settlement?: string; region?: string }
}

type ApiGroup = { orderNumber: string; orders: ApiOrder[] }

type SellerInfo = { name?: string; avatarUrl?: string | null }

const statusToUi = (s?: number): { primary: string; secondary: string; color: string } => {
	switch (s) {
		case 0: return { primary: 'Очікує підтвердження', secondary: 'Нове', color: 'text-yellow-600' }
		case 1: return { primary: 'Очікує відправки', secondary: 'Готується до відправки', color: 'text-blue-600' }
		case 2: return { primary: 'У дорозі', secondary: 'В дорозі', color: 'text-blue-600' }
		case 3: return { primary: 'Доставлено', secondary: 'Доставлено', color: 'text-green-600' }
		case 4: return { primary: 'Отримано', secondary: 'Виконано', color: 'text-green-600' }
		case 5: return { primary: 'Відхилено', secondary: 'Скасовано', color: 'text-red-600' }
		case 6: return { primary: 'Скасовано', secondary: 'Скасовано', color: 'text-red-600' }
		default: return { primary: 'Статус невідомий', secondary: '—', color: 'text-gray-600' }
	}
}

export default function TrackOrderPage() {
	const [step, setStep] = useState<'email'|'code'|'done'>('email')
	const [email, setEmail] = useState<string>('')
	const [code, setCode] = useState<string>('')
	const [sending, setSending] = useState<boolean>(false)
	const [verifying, setVerifying] = useState<boolean>(false)
	const [error, setError] = useState<string>('')
	const [info, setInfo] = useState<string>('')
	const [groups, setGroups] = useState<ApiGroup[]>([])
	const [sellers, setSellers] = useState<Record<string, SellerInfo>>({})
	const [statusFilter, setStatusFilter] = useState<'all' | 0 | 1 | 2 | 3 | 4 | 5 | 6>('all')
	const [search, setSearch] = useState<string>('')
	const [busyCancelId, setBusyCancelId] = useState<string | null>(null)

	const flattened = useMemo(() => {
		const list: ApiOrder[] = []
		for (const g of groups) for (const o of (g.orders || [])) list.push(o)
		return list
	}, [groups])

	const filtered = useMemo(() => {
		const q = (search || '').trim().toLowerCase()
		return flattened.filter(o => {
			const st = o.status as number | undefined
			if (statusFilter !== 'all' && st !== statusFilter) return false
			if (!q) return true
			const name = (o.miniProductsInfo?.productName || '').toLowerCase()
			const ord = (o.orderNumber || '').toLowerCase()
			const id = (o.id || '').toLowerCase()
			return name.includes(q) || ord.includes(q) || id.includes(q)
		})
	}, [flattened, statusFilter, search])

	useEffect(() => {
		const ids = new Set<string>()
		for (const g of groups) for (const o of (g.orders || [])) if (o?.sellerId) ids.add(o.sellerId)
		const need = Array.from(ids).filter(id => !sellers[id])
		if (need.length === 0) return
		let cancelled = false
		;(async () => {
			const results = await Promise.all(need.map(async sid => {
				try {
					const r = await fetch(`https://api.sellpoint.pp.ua/api/Store/GetStoreById?storeId=${encodeURIComponent(sid)}`)
					if (!r.ok) return [sid, {}] as const
					const s = await r.json()
					return [sid, { name: s?.name, avatarUrl: s?.avatar?.sourceUrl || s?.avatar?.compressedUrl || null }] as const
				} catch { return [sid, {}] as const }
			}))
			if (cancelled) return
			setSellers(prev => { const next = { ...prev }; for (const [sid, info] of results) next[sid] = { ...(next[sid]||{}), ...info }; return next })
		})()
		return () => { cancelled = true }
	}, [groups])

	const handleSendCode = async () => {
		setError(''); setInfo('')
		const e = (email || '').trim()
		if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { setError('Введіть коректну пошту'); return }
		setSending(true)
		try {
			const res = await fetch(`https://api.sellpoint.pp.ua/api/Order/SendOrderActionCode?email=${encodeURIComponent(e)}`, { method: 'POST', headers: { 'accept': '*/*' }, body: '' })
			if (!res.ok) { setError('Не вдалося надіслати код. Спробуйте ще раз.'); return }
			setStep('code')
			setInfo('Код відправлено. Перевірте пошту (дійсний 15 хв).')
		} catch { setError('Помилка надсилання коду') } finally { setSending(false) }
	}

	const handleVerifyCode = async () => {
		setError(''); setInfo('')
		const e = (email || '').trim()
		const c = (code || '').trim().toUpperCase()
		if (!e || !c) { setError('Заповніть пошту і код'); return }
		setVerifying(true)
		try {
			const url = `https://api.sellpoint.pp.ua/api/Order/GetByEmailCode?email=${encodeURIComponent(e)}&inputCode=${encodeURIComponent(c)}`
			const res = await fetch(url, { headers: { 'accept': '*/*' }, cache: 'no-store' })
			if (!res.ok) { setError('Невірний код або пошта.'); return }
			const data: ApiGroup[] = await res.json()
			setGroups(Array.isArray(data) ? data : [])
			setStep('done')
		} catch { setError('Помилка перевірки коду') } finally { setVerifying(false) }
	}

	const handleCancel = async (orderId: string) => {
		const e = (email || '').trim()
		const c = (code || '').trim().toUpperCase()
		if (!e || !c) { setStep('email'); setGroups([]); setCode(''); setInfo('Будь ласка, введіть пошту для отримання нового коду.'); return }
		setError(''); setInfo(''); setBusyCancelId(orderId)
		try {
			const url = `https://api.sellpoint.pp.ua/api/Order/CancelOrderByEmail?email=${encodeURIComponent(e)}&inputCode=${encodeURIComponent(c)}&orderId=${encodeURIComponent(orderId)}`
			const res = await fetch(url, { method: 'POST', headers: { 'accept': '*/*' }, body: '' })
			if (!res.ok) {
				if (res.status === 400 || res.status === 401 || res.status === 403) {
					setStep('email'); setGroups([]); setCode(''); setInfo('Код недійсний або прострочений. Надішліть новий код.'); return
				}
				setError('Не вдалося скасувати замовлення'); return
			}
			const ref = await fetch(`https://api.sellpoint.pp.ua/api/Order/GetByEmailCode?email=${encodeURIComponent(e)}&inputCode=${encodeURIComponent(c)}`, { headers: { 'accept': '*/*' }, cache: 'no-store' })
			if (!ref.ok) { setStep('email'); setGroups([]); setCode(''); setInfo('Код недійсний або прострочений. Надішліть новий код.'); return }
			const data: ApiGroup[] = await ref.json()
			setGroups(Array.isArray(data) ? data : [])
			setInfo('Замовлення скасовано')
		} catch {
			setError('Помилка скасування')
		} finally {
			setBusyCancelId(null)
		}
	}

	return (
		<div className="flex min-h-screen flex-col">
			<Header />
			<main className="flex-1 bg-gray-100">
				<div className="mx-auto w-full max-w-[1510px] px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
					{/* Search/verification container */}
					<div className="rounded-xl bg-white shadow-sm border border-gray-200 p-5 sm:p-6">
						<h1 className="text-2xl font-bold text-gray-900 mb-4">
							{step === 'email' ? 'Введіть електронну пошту, за яку було здійснено замовлення' : 'Введіть отриманий код перевірки'}
						</h1>
						<div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
							{step === 'email' ? (
								<>
									<input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="Ваша пошта.."
										className="md:col-span-8 lg:col-span-9 w-full bg-white appearance-none rounded-lg border border-gray-300 placeholder-gray-500 text-gray-900 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1]"
									/>
									<button onClick={handleSendCode} disabled={sending} className="md:col-span-4 lg:col-span-3 hover:cursor-pointer rounded-lg bg-[#4563d1] px-6 py-3 text-white text-base font-medium hover:bg-[#364ea8] transition-colors disabled:opacity-60">Відправити код перевірки</button>
								</>
							) : (
								<>
									<input
										type="text"
										value={code}
										onChange={(e) => setCode(e.target.value.toUpperCase())}
										placeholder="UEYPLZ"
										className="md:col-span-8 lg:col-span-9 w-full bg-white appearance-none rounded-lg border border-gray-300 placeholder-gray-500 text-gray-900 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1]"
									/>
									<button onClick={handleVerifyCode} disabled={verifying} className="md:col-span-4 lg:col-span-3 hover:cursor-pointer rounded-lg bg-[#4563d1] px-6 py-3 text-white text-base font-medium hover:bg-[#364ea8] transition-colors disabled:opacity-60">Перевірити код</button>
								</>
							)}
						</div>
						{error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
						{info ? <p className="mt-3 text-sm text-green-600">{info}</p> : null}
					</div>

					{/* Filters and search (visible after verification) */}
					{step === 'done' && (
						<div className="mt-4 rounded-xl bg-white p-3 sm:p-3 shadow-sm">
							<div className="flex items-center justify-between">
								<h2 className="text-lg font-bold text-gray-900">Замовлення</h2>
							</div>
							<div className="mt-0 pt-2">
								<div className="flex flex-wrap gap-3 items-center justify-between">
									<div className="flex items-center gap-3 mr-auto">
										<input
											value={search}
											onChange={(e) => setSearch(e.target.value)}
											placeholder="Пошук: номер або товар"
											className="w-64 bg-white appearance-none rounded-lg border border-gray-300 placeholder-gray-500 text-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1]"
										/>
									</div>
									<div className="flex items-center gap-2 sm:gap-3">
										<button onClick={() => setStatusFilter('all')} className={`hover:cursor-pointer rounded-xl px-3 py-2 text-sm ${statusFilter==='all' ? 'bg-[#4563d1] text-white' : 'bg-white text-gray-700 border-2 border-gray-300'}`}>Усі</button>
										<button onClick={() => setStatusFilter(0)} className={`hover:cursor-pointer rounded-xl px-3 py-2 text-sm ${statusFilter===0 ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700 border-2 border-gray-300'}`}>Очікує підтвердження</button>
										<button onClick={() => setStatusFilter(1)} className={`hover:cursor-pointer rounded-xl px-3 py-2 text-sm ${statusFilter===1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border-2 border-gray-300'}`}>Очікує відправки</button>
										<button onClick={() => setStatusFilter(2)} className={`hover:cursor-pointer rounded-xl px-3 py-2 text-sm ${statusFilter===2 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border-2 border-gray-300'}`}>У дорозі</button>
										<button onClick={() => setStatusFilter(3)} className={`hover:cursor-pointer rounded-xl px-3 py-2 text-sm ${statusFilter===3 ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border-2 border-gray-300'}`}>Доставлено</button>
										<button onClick={() => setStatusFilter(4)} className={`hover:cursor-pointer rounded-xl px-3 py-2 text-sm ${statusFilter===4 ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border-2 border-gray-300'}`}>Отримано</button>
										<button onClick={() => setStatusFilter(5)} className={`hover:cursor-pointer rounded-xl px-3 py-2 text-sm ${statusFilter===5 ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border-2 border-gray-300'}`}>Відхилено</button>
										<button onClick={() => setStatusFilter(6)} className={`hover:cursor-pointer rounded-xl px-3 py-2 text-sm ${statusFilter===6 ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border-2 border-gray-300'}`}>Скасовано</button>
									</div>
								</div>
							</div>
						</div>
						)}

					{/* Orders results */}
					{flattened.length > 0 && (
						<div className="mt-4 rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
							<div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-gray-500">
								<div className="col-span-12 md:col-span-4">Замовлення</div>
								<div className="hidden md:block md:col-span-2">Статус</div>
								<div className="hidden md:block md:col-span-2">Ціна</div>
								<div className="hidden md:block md:col-span-2">Продавець</div>
								<div className="hidden md:block md:col-span-1"></div>
							</div>
							{filtered.map((o, index) => {
								const first = o.miniProductsInfo
								const img = first?.image?.compressedUrl || first?.image?.sourceUrl || ''
								const itemsQty = o.pcs || 1
								const st = statusToUi(o.status)
								const isPaid = Boolean(o.payed)
								const seller = sellers[o.sellerId] || {}
								const dateStr = (() => { try { const d = new Date(o.createdAt); const dd = String(d.getDate()).padStart(2,'0'); const mm = String(d.getMonth()+1).padStart(2,'0'); const yy = d.getFullYear(); return `${dd}.${mm}.${yy}` } catch { return '' } })()
								return (
									<div key={o.id} className={`grid grid-cols-12 gap-4 px-4 py-4 items-center ${index !== 0 ? 'border-t border-gray-200' : ''}`}>
										<div className="col-span-12 md:col-span-4">
											<div className="flex items-start gap-4">
												<div className="relative h-28 w-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
													{img ? <Image src={img} alt={first?.productName || 'Товар'} fill className="object-cover" /> : null}
												</div>
												<div className="min-w-0">
													<p className="text-xs text-gray-500">Замовлення</p>
													<p className="text-sm font-medium text-gray-900">№{String(o.orderNumber || '').slice(0,16)}</p>
													<p className="mt-1 text-xs text-gray-500">{dateStr}</p>
													<p className="mt-3 text-xs text-gray-500">{itemsQty} шт. • ID: {o.id}</p>
													<p className="mt-1 text-sm text-[#3046b4] hover:underline cursor-pointer truncate">{first?.productName || 'Товар'}</p>
												</div>
											</div>
										</div>
										<div className="col-span-6 md:col-span-2 flex md:flex-col md:justify-start gap-1">
											<p className={`text-sm font-medium ${st.color}`}>{st.primary}</p>
											<p className="text-xs text-gray-600">
												{(() => {
													const a = o.deliveryToInfo?.address || ''
													const s = o.deliveryToInfo?.settlement || ''
													const r = o.deliveryToInfo?.region || ''
													const cityPart = s ? s : ''
													const regionPart = r ? (cityPart ? `, ${r}` : r) : ''
													const addrPart = a ? (cityPart || regionPart ? `, ${a}` : a) : ''
													const txt = `${cityPart}${regionPart}${addrPart}`.trim()
													return txt ? `Доставка: ${txt}` : ''
												})()}
											</p>
										</div>
										<div className="col-span-6 md:col-span-2 flex  flex-col">
											<p className="text-sm font-semibold text-gray-900">{(o.totalPrice || 0).toLocaleString('uk-UA')} грн</p>
											<p className={`text-sm ${isPaid ? 'text-green-600' : 'text-red-500'}`}>{isPaid ? 'Оплачено' : 'Післяплата'}</p>
										</div>
										<div className="col-span-8 md:col-span-2 flex flex-col">
											{seller?.avatarUrl ? <img src={seller.avatarUrl} alt={seller?.name || 'store'} className="mt-0 h-8 w-8 rounded-full items-center  object-cover" /> : null}
											<p className="mt-2 text-sm font-medium text-gray-900">{seller?.name || o.sellerId}</p>
										</div>
										<div className="col-span-4 md:col-span-2 ">
											{(() => { const canCancel = o.status !== 4 && o.status !== 6; return (
												<button onClick={() => handleCancel(o.id)} disabled={!canCancel || busyCancelId===o.id} className="hover:cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 whitespace-nowrap disabled:opacity-50">Скасувати замовлення</button>
											) })()}
										</div>
									</div>
								)
							})}
							{filtered.length === 0 && (
								<div className="px-4 py-8 text-center text-gray-500 border-t border-gray-200">Немає замовлень</div>
							)}
						</div>
					)}
					{/* Blue banner with text and centered image */}
					<div className="mt-6 rounded-xl px-6 py-0 sm:px-8 sm:py-0 text-white"
						style={{
							background: 'linear-gradient(90deg, #3A63F1 0%, #2237B2 100%)',
						}}>
						<div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-6">
							<div className="lg:col-span-6 ml-18">
								<h2 className="text-2xl sm:text-[26px] font-semibold">Sell Point знає, де ваше замовлення</h2>
								<p className="mt-2 text-sm sm:text-base text-white/90">Скануй QR-код і відстежуй зміни у реальному часі</p>
							</div>
							<div className="lg:col-span-2 -ml-30">
								<div className="flex items-center justify-center">
									<Image
										src="/photo-banner-1/banner4.png"
										alt="QR для відстеження"
										width={220}
										height={220}
										className="h-48 sm:h-28 w-auto object-contain"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
			<SiteFooter />
		</div>
	)
}


