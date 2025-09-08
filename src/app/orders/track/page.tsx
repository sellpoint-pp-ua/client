"use client"
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/layout/SiteFooter'
import Image from 'next/image'
import { useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'

export default function TrackOrderPage() {
	const [phoneDigits, setPhoneDigits] = useState<string>('')
	const inputRef = useRef<HTMLInputElement | null>(null)
	const router = useRouter()

	const TEMPLATE = '+380 (__) ___-__-__'
	const slotPositions = useMemo(() => {
		const arr: number[] = []
		for (let i = 0; i < TEMPLATE.length; i++) if (TEMPLATE[i] === '_') arr.push(i)
		return arr
	}, [])

	function applyMask(d: string): string {
		const digits = (d || '').replace(/\D/g, '').slice(0, 9)
		let idx = 0
		return TEMPLATE.replace(/_/g, () => digits[idx++] ?? '_')
	}

	const formattedPhone = applyMask(phoneDigits)

	const setCaretToDigitIndex = (digitIndex: number) => {
		const el = inputRef.current
		if (!el) return
		const maxDigits = slotPositions.length
		const pos = digitIndex >= maxDigits ? TEMPLATE.length : slotPositions[digitIndex]
		el.setSelectionRange(pos, pos)
	}

	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const rawDigits = e.target.value.replace(/\D/g, '')
		const nine = (rawDigits.startsWith('380') ? rawDigits.slice(3) : rawDigits).slice(0, 9)
		setPhoneDigits(nine)
		queueMicrotask(() => setCaretToDigitIndex(nine.length))
	}

	const clampCaret = () => {
		const el = inputRef.current
		if (!el) return
		const first = slotPositions[0]
		const cur = el.selectionStart ?? 0
		if (cur < first) el.setSelectionRange(first, first)
	}

	const focusToNextSlot = () => setCaretToDigitIndex(phoneDigits.length)

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Backspace') {
			e.preventDefault()
			if (phoneDigits.length > 0) {
				setPhoneDigits((prev) => {
					const next = prev.slice(0, Math.max(prev.length - 1, 0))
					queueMicrotask(() => setCaretToDigitIndex(next.length))
					return next
				})
			} else {
				queueMicrotask(() => setCaretToDigitIndex(0))
			}
			return
		}
		if (e.key === 'Delete' || e.key.startsWith('Arrow') || e.key === 'Home' || e.key === 'End' || e.key === 'PageUp' || e.key === 'PageDown') {
			e.preventDefault()
			queueMicrotask(() => setCaretToDigitIndex(phoneDigits.length))
		}
	}

	const handleBeforeInput = (e: React.FormEvent<HTMLInputElement>) => {
		const ne: any = (e as any).nativeEvent
		const data: string = (ne && ne.data) || ''
		if (data && !/^\d+$/.test(data)) {
			e.preventDefault()
			return
		}
		if (phoneDigits.length >= 9 && data) {
			e.preventDefault()
			return
		}
	}

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault()
		const paste = (e.clipboardData || (window as any).clipboardData).getData('text') || ''
		const digits = paste.replace(/\D/g, '')
		if (!digits) return
		const next = (phoneDigits + digits).slice(0, 9)
		setPhoneDigits(next)
		queueMicrotask(() => setCaretToDigitIndex(next.length))
	}

	const blockMouseSetCaret = (e: React.MouseEvent<HTMLInputElement>) => {
		e.preventDefault()
		const el = inputRef.current
		if (el && document.activeElement !== el) el.focus()
		queueMicrotask(() => setCaretToDigitIndex(phoneDigits.length))
	}

	const handleSelect = () => {
		queueMicrotask(() => setCaretToDigitIndex(phoneDigits.length))
	}
	return (
		<div className="flex min-h-screen flex-col">
			<Header />
			<main className="flex-1 bg-gray-100">
				<div className="mx-auto w-full max-w-[1510px] px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
					{/* Search container */}
					<div className="rounded-xl bg-white shadow-sm border border-gray-200 p-5 sm:p-6">
						<h1 className="text-2xl font-bold text-gray-900 mb-4">Введіть номер телефону для відстеження</h1>
						<div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
							<input
								type="tel"
								value={formattedPhone}
								onChange={handlePhoneChange}
								onFocus={focusToNextSlot}
								onClick={clampCaret}
								inputMode="numeric"
								autoComplete="off"
								ref={inputRef}
								onKeyDown={handleKeyDown}
								onBeforeInput={handleBeforeInput}
								onPaste={handlePaste}
								onMouseDown={blockMouseSetCaret}
								onSelect={handleSelect}
								className="md:col-span-8 lg:col-span-9 w-full bg-white appearance-none rounded-lg border border-gray-300 placeholder-gray-500 text-gray-900 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1]"
							/>
							<button onClick={() => router.push(`/orders/track/results${phoneDigits ? `?phone=${encodeURIComponent(phoneDigits)}` : ''}`)} className="md:col-span-4 lg:col-span-3 hover:cursor-pointer rounded-lg bg-[#4563d1] px-6 py-3 text-white text-base font-medium hover:bg-[#364ea8] transition-colors">Шукати</button>
						</div>
					</div>

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


