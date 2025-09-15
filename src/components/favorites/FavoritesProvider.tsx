'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authService } from '@/services/authService'
import Image from 'next/image'

type FavoriteList = { id: string; userId: string; name: string; products: string[] }

type FavoritesContextValue = {
  lists: FavoriteList[]
  isLoading: boolean
  productToListId: Record<string, string | undefined>
  refresh: () => Promise<void>
  isInFavorites: (productId: string) => boolean
  toggleFavorite: (productId: string, options?: { forceListId?: string }) => Promise<void>
  openPicker: (productId: string) => void
  picker: { isOpen: boolean; productId?: string | null; close: () => void }
  ui: { toast?: { message: string } | null }
  deleteList: (id: string) => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined)

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}

export default function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [lists, setLists] = useState<FavoriteList[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerProductId, setPickerProductId] = useState<string | null>(null)
  const [pickerSelectedListId, setPickerSelectedListId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string } | null>(null)
  const [covers, setCovers] = useState<Record<string, string>>({})

  const token = authService.getToken()

  const refresh = useCallback(async () => {
    if (!token) { setLists([]); return }
    setIsLoading(true)
    try {
      const res = await fetch('https://api.sellpoint.pp.ua/Favorite/GetAllFavoriteProducts', {
        headers: { accept: '*/*', Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      const data: FavoriteList[] = res.ok ? await res.json() : []
      setLists(Array.isArray(data) ? data : [])
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => { refresh() }, [refresh])

  // Fetch list cover images (first product image of each list)
  useEffect(() => {
    let cancelled = false
    async function loadCovers() {
      const entries = await Promise.all((lists || []).map(async (l) => {
        const firstId = l.products?.[0]
        if (!firstId) return [l.id, ''] as const
        try {
          const r = await fetch(`https://api.sellpoint.pp.ua/api/ProductMedia/by-product-id/${firstId}`, { cache: 'no-store' })
          if (!r.ok) return [l.id, ''] as const
          const media = await r.json()
          const first = (Array.isArray(media) ? media : []).sort((a: any, b: any) => (a?.order || 0) - (b?.order || 0))[0]
          const url = first?.files?.compressedUrl || first?.files?.sourceUrl || ''
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
  }, [lists])

  const productToListId = useMemo(() => {
    const map: Record<string, string | undefined> = {}
    for (const l of lists) {
      for (const pid of l.products || []) {
        map[pid] = l.id
      }
    }
    return map
  }, [lists])

  const isInFavorites = useCallback((productId: string) => !!productToListId[productId], [productToListId])

  const openPicker = useCallback(async (productId: string) => {
    setPickerProductId(productId)
    setPickerSelectedListId(null)
    if (!token) { setPickerOpen(true); return }
    try {
      const res = await fetch('https://api.sellpoint.pp.ua/Favorite/GetAllFavoriteProducts', {
        headers: { accept: '*/*', Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      const data: FavoriteList[] = res.ok ? await res.json() : []
      setLists(Array.isArray(data) ? data : [])
      const customsNow = (Array.isArray(data) ? data : []).filter(l => l.name !== 'Товари')
      if (customsNow.length === 0) {
        // no customs anymore: add to default directly
        await fetch(`https://api.sellpoint.pp.ua/Favorite/AddToFavoriteProductCollectionToDefault?productId=${encodeURIComponent(productId)}`,
          { method: 'POST', headers: { accept: '*/*', Authorization: `Bearer ${token}` }, body: '' })
        await refresh()
        try { window.dispatchEvent(new CustomEvent('favorites:changed')) } catch {}
        setToast({ message: 'Додано до «Товари»' })
        setTimeout(() => setToast(null), 2500)
        return
      }
    } catch {}
    setPickerOpen(true)
  }, [token, refresh])

  const toggleFavorite = useCallback(async (productId: string, options?: { forceListId?: string }) => {
    if (!token) return
    const currentListId = productToListId[productId]
    const customs = lists.filter(l => l.name !== 'Товари')
    try {
      if (currentListId) {
        await fetch(`https://api.sellpoint.pp.ua/Favorite/RemoveFromFavoriteProductCollection?id=${encodeURIComponent(currentListId)}&productId=${encodeURIComponent(productId)}`,
          { method: 'DELETE', headers: { accept: '*/*', Authorization: `Bearer ${token}` } })
        await refresh()
        try { window.dispatchEvent(new CustomEvent('favorites:changed')) } catch {}
        setToast({ message: 'Товар видалено з обраного' })
        setTimeout(() => setToast(null), 2500)
        return
      }

      // no current list: decide destination
      let destListId = options?.forceListId
      if (!destListId) {
        if (customs.length === 0) {
          // add to default
          await fetch(`https://api.sellpoint.pp.ua/Favorite/AddToFavoriteProductCollectionToDefault?productId=${encodeURIComponent(productId)}`,
            { method: 'POST', headers: { accept: '*/*', Authorization: `Bearer ${token}` }, body: '' })
          await refresh()
          try { window.dispatchEvent(new CustomEvent('favorites:changed')) } catch {}
          setToast({ message: 'Додано до «Товари»' })
          setTimeout(() => setToast(null), 2500)
          return
        } else {
          // re-check current lists before opening picker to avoid stale data
          try {
            const res = await fetch('https://api.sellpoint.pp.ua/Favorite/GetAllFavoriteProducts', {
              headers: { accept: '*/*', Authorization: `Bearer ${token}` },
              cache: 'no-store',
            })
            const data: FavoriteList[] = res.ok ? await res.json() : []
            setLists(Array.isArray(data) ? data : [])
            const customsNow = (Array.isArray(data) ? data : []).filter(l => l.name !== 'Товари')
            if (customsNow.length === 0) {
              await fetch(`https://api.sellpoint.pp.ua/Favorite/AddToFavoriteProductCollectionToDefault?productId=${encodeURIComponent(productId)}`,
                { method: 'POST', headers: { accept: '*/*', Authorization: `Bearer ${token}` }, body: '' })
              await refresh()
              try { window.dispatchEvent(new CustomEvent('favorites:changed')) } catch {}
              setToast({ message: 'Додано до «Товари»' })
              setTimeout(() => setToast(null), 2500)
              return
            }
          } catch {}
          // open picker; user will select and press Save
          await openPicker(productId)
          return
        }
      }

      // add to specific list
      await fetch(`https://api.sellpoint.pp.ua/Favorite/AddToFavoriteProductCollection?id=${encodeURIComponent(destListId!)}&productId=${encodeURIComponent(productId)}`,
        { method: 'POST', headers: { accept: '*/*', Authorization: `Bearer ${token}` }, body: '' })
      await refresh()
      try { window.dispatchEvent(new CustomEvent('favorites:changed')) } catch {}
      const listName = lists.find(l => l.id === destListId)?.name || 'Список'
      setToast({ message: `Додано до «${listName}»` })
      setTimeout(() => setToast(null), 2500)
    } catch {}
  }, [token, productToListId, lists, refresh, openPicker])

  const picker = useMemo(() => ({
    isOpen: pickerOpen,
    productId: pickerProductId,
    close: () => { setPickerOpen(false); setPickerProductId(null); setPickerSelectedListId(null) },
  }), [pickerOpen, pickerProductId])

  const value = useMemo(() => ({
    lists,
    isLoading,
    productToListId,
    refresh,
    isInFavorites,
    toggleFavorite,
    openPicker,
    picker,
    ui: { toast },
    deleteList: async (id: string) => {
      if (!token) return
      try {
        await fetch(`https://api.sellpoint.pp.ua/Favorite/DeleteFavoriteProductCollection?id=${encodeURIComponent(id)}`,
          { method: 'DELETE', headers: { accept: '*/*', Authorization: `Bearer ${token}` } })
      } finally {
        await refresh()
        try { window.dispatchEvent(new CustomEvent('favorites:changed')) } catch {}
      }
    },
  }), [lists, isLoading, productToListId, refresh, isInFavorites, toggleFavorite, openPicker, picker, toast, token])

  return (
    <FavoritesContext.Provider value={value}>
      {children}

      {/* Global favorites picker drawer and toast */}
      {/* Overlay */}
      <div
        aria-hidden
        onClick={() => picker.close()}
        className={`fixed inset-0 z-[88] bg-gray-700/30 transition-opacity duration-300 ${picker.isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />
      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        className={`fixed right-0 top-0 z-[89] h-full w-[420px] max-w-[92vw] bg-white shadow-2xl rounded-l-2xl transition-transform duration-300 ease-out ${picker.isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="relative flex items-center justify-center border-b border-gray-200 p-4">
          <h2 className="text-[18px] font-bold text-gray-900">Додати в список</h2>
          <button aria-label="Закрити" onClick={() => picker.close()} className="absolute right-3 top-1/2 font-bold -translate-y-1/2 rounded-lg p-2 hover:bg-gray-100">✕</button>
        </div>
        <div className="p-3 space-y-2 overflow-y-auto h-[calc(100%-140px)]">
          {lists.filter(l => l.name !== 'Товари').map((l) => (
            <label key={l.id} className="flex items-center justify-between rounded-xl border border-gray-200 p-3 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100">
                  {covers[l.id] ? (
                    <Image src={covers[l.id]} alt={l.name} fill className="object-cover" />
                  ) : null}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{l.name}</div>
                  <div className="text-xs text-gray-500">{(l.products?.length || 0)} товарів</div>
                </div>
              </div>
              <input type="radio" name="fav_pick" value={l.id} checked={pickerSelectedListId === l.id} onChange={() => setPickerSelectedListId(l.id)} />
            </label>
          ))}
          {lists.filter(l => l.name === 'Товари').map((l) => (
            <label key={l.id} className="flex items-center justify-between rounded-xl border border-gray-200 p-3 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100">
                  {covers[l.id] ? (
                    <Image src={covers[l.id]} alt="Товари" fill className="object-cover" />
                  ) : null}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Товари</div>
                  <div className="text-xs text-gray-500">{(l.products?.length || 0)} товарів</div>
                </div>
              </div>
              <input type="radio" name="fav_pick" value={l.id} checked={pickerSelectedListId === l.id} onChange={() => setPickerSelectedListId(l.id)} />
            </label>
          ))}
        </div>
        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <button disabled={!pickerSelectedListId || !picker.productId} onClick={async () => { if (pickerSelectedListId && picker.productId) { await toggleFavorite(picker.productId, { forceListId: pickerSelectedListId }); picker.close() } }} className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium text-white ${pickerSelectedListId ? 'bg-[#4563d1] hover:bg-[#364ea8]' : 'bg-gray-300 cursor-not-allowed'}`}>Зберегти</button>
          </div>
        </div>
      </aside>

      {/* Toast */}
      <div className={`fixed right-4 top-[84px] z-[98] transition-all duration-300 ${toast ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 -translate-y-2'}`}>
        {toast && (
          <div className="flex items-center gap-3 rounded-xl bg-[#0b0b1a] text-white px-3 py-2 shadow-lg">
            <div className="text-sm">{toast.message}</div>
          </div>
        )}
      </div>
    </FavoritesContext.Provider>
  )
}


