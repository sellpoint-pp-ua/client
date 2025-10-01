"use client"
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'

type CurrentUser = {
  id: string
  username: string | null
  firstName: string | null
  lastName: string | null
  middleName: string | null
  gender: string | null
  dateOfBirth: string | null
  email: string | null
  phoneNumber?: string | null
  phoneNumberConfirmed?: boolean | null
  avatar?: { sourceUrl?: string; compressedUrl?: string } | null
}

export default function SettingsForm() {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const [username, setUsername] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [gender, setGender] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (!token) {
      setLoading(false)
      return
    }
    let cancelled = false
    async function loadUser() {
      try {
        setLoading(true)
        setError(null)
        let res = await fetch('https://api.sellpoint.pp.ua/api/User/GetUserByMyId', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        }).catch(() => null as any)
        if (!res || !res.ok) {
          res = await fetch('/api/users/current', {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
          })
        }
        if (!res.ok) throw new Error('Не вдалося отримати дані користувача')
        const u = await res.json()
        if (cancelled) return
        const sanitizeStr = (v: unknown): string => {
          if (typeof v !== 'string') return ''
          const trimmed = v.trim()
          if (!trimmed || trimmed.toLowerCase() === 'string') return ''
          return trimmed
        }
        const normalizeGender = (v: unknown): string => {
          const val = typeof v === 'string' ? v.toLowerCase() : ''
          return ['male', 'female', 'other'].includes(val) ? val : ''
        }
        const normalizeDate = (v: unknown): string => {
          if (typeof v !== 'string' || v.trim() === '' || v.toLowerCase() === 'string') return ''
          const d = new Date(v)
          if (isNaN(d.getTime())) return ''
          const yyyy = d.getFullYear()
          const mm = String(d.getMonth() + 1).padStart(2, '0')
          const dd = String(d.getDate()).padStart(2, '0')
          return `${yyyy}-${mm}-${dd}`
        }
        const current: CurrentUser = {
          id: sanitizeStr(u?.id) || '',
          username: sanitizeStr(u?.username),
          firstName: sanitizeStr(u?.firstName),
          lastName: sanitizeStr(u?.lastName),
          middleName: sanitizeStr(u?.middleName),
          gender: normalizeGender(u?.gender),
          dateOfBirth: normalizeDate(u?.dateOfBirth),
          email: sanitizeStr(u?.email),
          phoneNumber: sanitizeStr(u?.phoneNumber),
          phoneNumberConfirmed: Boolean(u?.phoneNumberConfirmed),
          avatar: u?.avatar || null,
        }
        setUser(current)
        setUsername(current.username || '')
        setFirstName(current.firstName || '')
        setLastName(current.lastName || '')
        setMiddleName(current.middleName || '')
        setGender(current.gender || '')
        setDateOfBirth(current.dateOfBirth || '')
        setPhone(current.phoneNumber || '')
      } catch (e: any) {
        setError(e?.message || 'Помилка завантаження')
      } finally {
        setLoading(false)
      }
    }
    loadUser()
    return () => { cancelled = true }
  }, [])

  const avatarUrl = useMemo(() => {
    if (avatarPreviewUrl) return avatarPreviewUrl
    if (!user) return null
    return user.avatar?.compressedUrl || user.avatar?.sourceUrl || null
  }, [user, avatarPreviewUrl])

  useEffect(() => {
    if (avatarFile) {
      const objectUrl = URL.createObjectURL(avatarFile)
      setAvatarPreviewUrl(objectUrl)
      return () => {
        try { URL.revokeObjectURL(objectUrl) } catch {}
      }
    } else {
      setAvatarPreviewUrl(null)
    }
  }, [avatarFile])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (!token) { setError('Ви не авторизовані'); return }
    try {
      setSaving(true)
      setError(null)
      const form = new FormData()
      if (username) form.append('Username', username)
      if (firstName) form.append('FirstName', firstName)
      if (lastName) form.append('LastName', lastName)
      if (middleName) form.append('MiddleName', middleName)
      if (gender) form.append('Gender', gender)
      if (dateOfBirth) form.append('DateOfBirth', new Date(dateOfBirth).toISOString())
      if (avatarFile) form.append('Avatar', avatarFile)
      if (phone) form.append('PhoneNumber', phone)

      const res = await fetch('https://api.sellpoint.pp.ua/api/User/UpdateUser', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        let msg = 'Не вдалося зберегти зміни'
        try { const j = JSON.parse(text); msg = (j?.message || j?.error || msg) } catch { msg = text || msg }
        throw new Error(msg)
      }
      setToast('Профіль збережено успішно')
      try {
        const avatarAfter = avatarPreviewUrl || (user?.avatar?.compressedUrl || user?.avatar?.sourceUrl || null)
        const displayFullName = [firstName, middleName, lastName].filter(Boolean).join(' ').trim()
        window.dispatchEvent(new CustomEvent('user:profile-updated', { detail: { fullName: displayFullName, avatarUrl: avatarAfter } }))
      } catch {}
      setTimeout(() => { setToast(null); try { window.location.reload() } catch {} }, 900)
    } catch (e: any) {
      setError(e?.message || 'Помилка збереження')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-6 rounded-xl bg-white shadow-sm p-6">
      {/* Toast */}
      <div className={`fixed right-4 top-[84px] z-[98] transition-all duration-300 ${toast ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 -translate-y-2'}`}>
        {toast && (
          <div className="flex items-center gap-3 rounded-xl bg-[#0b0b1a] text-white px-3 py-2 shadow-lg">
            <div className="text-sm">{toast}</div>
          </div>
        )}
      </div>
      {loading ? (
        <div className="text-gray-500">Завантаження...</div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-gray-900">Твій профіль на Sell Point</h2>
            <p className="text-sm text-gray-500">Налаштовуй та оновлюй інформацію.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Фото профілю</label>
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full bg-gray-200">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-500">🙂</div>
                )}
              </div>
              {/* Hidden native input */}
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              />
              {/* Custom button */}
              <label
                htmlFor="avatar-input"
                className="hover:cursor-pointer rounded-xl bg-[#3A63F1] px-4 py-2 text-sm text-white hover:bg-[#3358d8] transition-colors"
              >
                {avatarFile ? 'Обрано файл' : (avatarUrl ? 'Змінити фото' : 'Завантажити фото')}
              </label>
              {avatarFile && (
                <span className="text-xs text-gray-600 truncate max-w-[160px]">{avatarFile.name}</span>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">Підтримуються зображення (JPG/PNG/WebP). Рекомендовано до 5 МБ.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Логін (username)</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1]" placeholder="Ваш логін" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Ім'я</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1]" placeholder="Ім'я" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Прізвище</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1]" placeholder="Прізвище" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">По батькові</label>
              <input value={middleName} onChange={(e) => setMiddleName(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1]" placeholder="По батькові" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Стать</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1]">
                <option value="">Не вказано</option>
                <option value="male">Чоловік</option>
                <option value="female">Жінка</option>
                <option value="other">Інше</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Дата народження</label>
              <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1]" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Телефон</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1]" placeholder="+380..." />
            {user?.phoneNumberConfirmed !== undefined && (
              <p className="mt-1 text-xs text-gray-500">{user?.phoneNumberConfirmed ? 'Номер підтверджено' : 'Номер не підтверджено'}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button disabled={saving} type="submit" className="rounded-xl bg-[#3A63F1] hover:cursor-pointer text-sm px-5 py-2 text-white hover:bg-[#3358d8] transition-colors disabled:opacity-60">
              {saving ? 'Збереження...' : 'Зберегти профіль'}
            </button>
            <button type="button" onClick={() => window.location.reload()} className="rounded-xl border-2 text-sm border-gray-300 font-semibold hover:cursor-pointer px-5 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
              Скинути зміни
            </button>
          </div>
        </form>
      )}
    </div>
  )
}


