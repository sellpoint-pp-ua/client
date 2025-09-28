import fs from 'fs'
import path from 'path'
import React from 'react'
import matter from 'gray-matter'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/layout/SiteFooter'
import {
  ShoppingCart,
  ShieldCheck,
  AlertTriangle,
  Search as LucideSearch,
  Truck,
  Repeat,
  User,
  Star,
  Smartphone,
} from 'lucide-react'

type CommonFM = { title?: string; template?: 'help' | 'payment' }

type HelpFM = CommonFM & {
  hero?: { title?: string; subtitle?: string; searchPlaceholder?: string }
  popular?: { title: string; subtitle?: string; href: string; icon?: string }[]
  categories?: { title: string; href: string }[]
  articles?: { title: string; href: string }[]
}

type PaymentFM = CommonFM & {
  hero?: { title?: string; subtitle?: string; image?: string }
  claim?: string
  reasonsTitle?: string
  benefits?: { title: string; text: string; icon?: 'percent' | 'card' | 'shield' }[]
  helpLink?: { text: string; href: string }
  cta?: { text: string; href: string }
}

function Icon({ name }: { name?: 'percent' | 'card' | 'shield' }) {
  if (name === 'percent') {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6"><path fill="currentColor" d="M7.5 8a1.5 1.5 0 1 1 0-3A1.5 1.5 0 0 1 7.5 8Zm9 11a1.5 1.5 0 1 1 0-3a1.5 1.5 0 0 1 0 3ZM6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
    )
  }
  if (name === 'card') {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M3 9h18M7 15h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6"><path d="M12 3l7 4v5c0 5-3.5 7.5-7 9c-3.5-1.5-7-4-7-9V7l7-4Z" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
  )
}

export default async function InfoPage(props: any) {
  const awaitedProps = await props
  const maybeParams = awaitedProps?.params
  const resolvedParams = maybeParams && typeof (maybeParams as any)?.then === 'function' ? await maybeParams : maybeParams
  const rawSlug = resolvedParams?.slug
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug || ''
  const locale = 'uk'

  try {
    const filePath = path.join(process.cwd(), 'public', 'content', locale, `${slug}.md`)
    const raw = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(raw)
    const fm = (data || {}) as HelpFM | PaymentFM
    const template = (fm.template as any) || 'help'

    const ReactMarkdown: any = (await import('react-markdown')).default

    return (
      <div className="flex min-h-screen flex-col">
        <Header />

        {template === 'payment' ? (
          <>
            {/* Hero */}
            <section className="bg-gradient-to-b from-[#4563d1] to-[#3A63F1] text-white">
              <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1 text-sm">
                      <span className="font-semibold">SellPoint-оплата</span>
                    </div>
                    <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold">
                      {fm.hero?.title || 'Безпечна оплата карткою на SellPoint'}
                    </h1>
                    {fm.hero?.subtitle && (
                      <p className="mt-2 text-white/85">{fm.hero.subtitle}</p>
                    )}
                  </div>
                    <div className="hidden sm:block">
                    {((fm as PaymentFM).hero as any)?.image ? (
                      <img
                        src={(fm as PaymentFM).hero?.image}
                        alt="SellPoint Pay"
                        className="h-28 w-28 rounded-2xl object-cover ring-2 ring-white/40"
                      />
                    ) : (
                      <div className="h-28 w-28 rounded-2xl bg-white/20" />
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Claim bubble */}
            {(fm as PaymentFM).claim && (
              <div className="bg-[#f2edff]">
                <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-3">
                  <div className="rounded-xl bg-white text-[#5a39d1] px-4 py-3 shadow-sm ring-1 ring-[#e6e0ff]">
                    {(fm as PaymentFM).claim}
                  </div>
                </div>
              </div>
            )}

            {/* Why */}
            <section className="bg-gray-50">
              <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-8">
                <h2 className="text-center text-xl font-extrabold text-gray-900">
                  {('reasonsTitle' in fm && fm.reasonsTitle) || 'Чому варто користуватися SellPoint-оплатою?'}
                </h2>

                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  {(fm as PaymentFM).benefits?.map((b, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f2edff] text-[#6a58ff]">
                        <Icon name={b.icon} />
                      </div>
                      <div>
                        <div className="font-semibold">{b.title}</div>
                        <div className="mt-1 text-gray-600 text-[15px] leading-relaxed">{b.text}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {(fm as PaymentFM).helpLink && (
                  <div className="mt-6 text-center">
                    <Link
                      href={(fm as PaymentFM).helpLink!.href}
                      className="text-[#6a58ff] underline underline-offset-2 hover:opacity-90"
                    >
                      {(fm as PaymentFM).helpLink!.text}
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* CTA */}
            {(fm as PaymentFM).cta && (
              <section className="bg-white">
                <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-6">
                  <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#4563d1] to-[#3A63F1] p-6 text-white sm:flex-row">
                    <div className="text-lg font-semibold">
                      {(fm as PaymentFM).cta!.text || 'Купуй вже зараз з SellPoint-оплатою'}
                    </div>
                    <Link
                      href={(fm as PaymentFM).cta!.href}
                      className="rounded-xl bg-white/15 px-4 py-2 font-medium hover:bg-white/25 transition"
                    >
                      Перейти
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {/* Дополнительный markdown-низ */}
            <section className="bg-gray-50">
              {(content?.trim()?.length ?? 0) > 0 && (
                <div className="mx-auto max-w-[900px] px-4 sm:px-6 lg:px-8 py-8">
                  <div className="rounded-2xl bg-white p-6 shadow-sm">
                    {React.createElement((await import('react-markdown')).default, null, content)}
                  </div>
                </div>
              )}
            </section>
          </>
        ) : (
          <>
            <section className="bg-gradient-to-b from-[#4563d1] to-[#3A63F1] text-white">
              <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
                <h1 className="text-2xl sm:text-3xl font-extrabold">
                  {(fm as HelpFM).hero?.title || 'Привіт! Чим ми можемо допомогти?'}
                </h1>
                <form action="/search" className="mt-4 flex items-center gap-2 rounded-full bg-white/10 p-2">
                  <input
                    name="q"
                    type="search"
                    placeholder={(fm as HelpFM).hero?.searchPlaceholder || 'Пошук: повернення, оплата, доставка…'}
                    className="w-full rounded-full bg-white py-3 px-4 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none"
                  />
                  <button className="rounded-full bg-[#FFD24D] px-5 py-2.5 text-sm font-semibold text-black hover:opacity-95 transition">Знайти</button>
                </form>
                {(fm as HelpFM).hero?.subtitle && (
                  <p className="mt-2 text-sm text-white/70">{(fm as HelpFM).hero!.subtitle}</p>
                )}
              </div>
            </section>

            {(fm as HelpFM).popular?.length ? (
              <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-6">
                <div className="rounded-2xl bg-gray-50 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm">🔥</span>
                      Популярні питання
                    </h2>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2 items-stretch auto-rows-fr">
                    {(fm as HelpFM).popular!.map((item, idx) => (
                      <Link key={idx} href={item.href} className="group flex items-center gap-4 rounded-xl bg-white p-5 sm:p-6 border border-gray-200 hover:shadow-md transition min-h-[110px] h-full">
                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-white text-3xl border border-gray-100">
                          {item.icon || '❓'}
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <div className="font-medium group-hover:text-[#4563d1] text-sm leading-tight line-clamp-2">{item.title}</div>
                          {item.subtitle && (<div className="text-sm text-gray-500 mt-1 line-clamp-2">{item.subtitle}</div>)}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {(fm as HelpFM).categories?.length ? (
              <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 mt-6">
                <div className="rounded-2xl bg-gray-50 p-6 shadow-sm">
                  <h3 className="mb-3 text-base font-semibold text-gray-900">Категорії</h3>
                  <div className="grid gap-5 sm:grid-cols-3 items-stretch auto-rows-fr">
                    {(fm as HelpFM).categories!.map((cat, idx) => (
                      <Link key={idx} href={cat.href} className="group flex items-center gap-4 rounded-xl bg-white p-5 sm:p-6 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 hover:ring-gray-300 transition min-h-[110px] h-full">
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-2xl text-gray-800">
                          {idx % 9 === 0 ? <ShoppingCart size={22} /> : idx % 9 === 1 ? <ShieldCheck size={22} /> : idx % 9 === 2 ? <AlertTriangle size={22} /> : idx % 9 === 3 ? <LucideSearch size={22} /> : idx % 9 === 4 ? <Truck size={22} /> : idx % 9 === 5 ? <Repeat size={22} /> : idx % 9 === 6 ? <User size={22} /> : idx % 9 === 7 ? <Star size={22} /> : <Smartphone size={22} />}
                        </div>
                        <div className="flex-1 text-left flex flex-col justify-center">
                          <div className="text-[15px] font-medium leading-tight line-clamp-2">{cat.title}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {(fm as HelpFM).articles?.length ? (
              <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-6">
                <div className="rounded-2xl bg-gray-50 p-6 shadow-sm">
                  <h3 className="mb-3 text-base font-semibold text-gray-900">Рекомендовані статті</h3>
                  <div className="grid gap-5 sm:grid-cols-3 items-stretch auto-rows-fr">
                    {(fm as HelpFM).articles!.map((a, idx) => (
                      <Link key={idx} href={a.href} className="group flex items-center gap-4 rounded-xl bg-white p-5 sm:p-6 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 transition min-h-[110px] h-full">
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-2xl text-gray-800">
                          {idx % 3 === 0 ? <Star size={22} /> : idx % 3 === 1 ? <ShoppingCart size={22} /> : <LucideSearch size={22} />}
                        </div>
                        <div className="flex-1 text-left flex flex-col justify-center">
                          <div className="text-[15px] leading-tight line-clamp-2">{a.title}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {content?.trim()?.length ? (
              <div className="mx-auto max-w-[900px] p-4 sm:p-6 lg:p-8">
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  {React.createElement((await import('react-markdown')).default, null, content)}
                </div>
              </div>
            ) : null}
          </>
        )}

        <SiteFooter />
      </div>
    )
  } catch (error) {
    console.error(error)
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 p-8">
          <div className="mx-auto max-w-[900px]">
            <div className="rounded-xl bg-white p-8 shadow-sm text-center">
              <h2 className="text-xl font-semibold">Сторінка не знайдена</h2>
              <p className="mt-2 text-gray-600">Ця сторінка ще не підготовлена.</p>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }
}
