'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

type MenuItem = {
  id: string;
  name: string;
  children?: MenuItem[];
}

export default function Sidebar() {
  const COLLAPSED_MAX_HEIGHT = 380
  const SHADOW_HEIGHT_PX = 28
  const HOVER_SWITCH_DELAY_MS = 500
  const EXPANDED_MAX_HEIGHT_VH = 60 // Controls expanded (hovered) sidebar max height
  const [categories, setCategories] = useState<MenuItem[]>([])
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const expandedPanelRef = useRef<HTMLDivElement | null>(null)
  const [expandedPos, setExpandedPos] = useState<{ left: number; top: number }>({ left: 0, top: 0 })
  const [expandedHeightPx, setExpandedHeightPx] = useState<number>(0)
  const [isHoveringSidebar, setIsHoveringSidebar] = useState(false)
  const [isHoveringSubpanel, setIsHoveringSubpanel] = useState(false)
  const isHoveringSidebarRef = useRef(false)
  const isHoveringSubpanelRef = useRef(false)
  const closeTimeoutRef = useRef<number | null>(null)
  const hoverSwitchTimeoutRef = useRef<number | null>(null)
  const prevBodyOverflowRef = useRef<string>('')
  const prevHtmlOverflowRef = useRef<string>('')
  const prevBodyPaddingRightRef = useRef<string>('')
  const prevHtmlPaddingRightRef = useRef<string>('')

  const setSidebarHover = (v: boolean) => {
    isHoveringSidebarRef.current = v
    setIsHoveringSidebar(v)
  }
  const setSubpanelHover = (v: boolean) => {
    isHoveringSubpanelRef.current = v
    setIsHoveringSubpanel(v)
  }
  const scheduleClose = (delay: number = 100) => {
    if (closeTimeoutRef.current !== null) {
      clearTimeout(closeTimeoutRef.current)
    }
    closeTimeoutRef.current = window.setTimeout(() => {
      if (!isHoveringSidebarRef.current && !isHoveringSubpanelRef.current) {
        setIsExpanded(false)
        setHoveredCategory(null)
      }
    }, delay)
  }

  const openExpanded = () => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      setExpandedPos({ left: rect.left, top: rect.top })
    }
    setIsExpanded(true)
  }

  const scheduleHoverCategory = (categoryId: string, hasChildren: boolean) => {
    if (hoverSwitchTimeoutRef.current !== null) {
      clearTimeout(hoverSwitchTimeoutRef.current)
      hoverSwitchTimeoutRef.current = null
    }
    // For categories without children, switch immediately
    if (!hasChildren) {
      setHoveredCategory(categoryId)
      return
    }
    hoverSwitchTimeoutRef.current = window.setTimeout(() => {
      setHoveredCategory(categoryId)
    }, HOVER_SWITCH_DELAY_MS)
  }

  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch('/api/categories/full-tree', { cache: 'no-store' })
        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }
        const data = await response.json()
  const mapNode = (node: { id?: string; name?: string; children?: unknown[] }): MenuItem => {
    const rawChildren = Array.isArray(node?.children) ? (node.children as Array<any>) : []
    return {
      id: node?.id || '',
      name: typeof node?.name === 'string' ? node.name : '',
      children: rawChildren.map(mapNode)
    }
  }
  const menuItems = Array.isArray(data) ? data.map(mapNode).filter(n => n.id && n.name) : []
        setCategories(menuItems)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Measure expanded sidebar height when shown and on resize
  useEffect(() => {
    function measure() {
      const el = expandedPanelRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      setExpandedHeightPx(Math.max(0, Math.floor(rect.height)))
    }
    if (isExpanded) {
      // next tick to ensure layout
      requestAnimationFrame(measure)
      window.addEventListener('resize', measure)
      return () => window.removeEventListener('resize', measure)
    }
  }, [isExpanded, categories.length])

  // Freeze background scroll when overlay is active
  useEffect(() => {
    if (typeof window === 'undefined') return
    const htmlEl = document.documentElement
    const bodyEl = document.body
    if (isExpanded) {
      // Save previous styles
      prevBodyOverflowRef.current = bodyEl.style.overflow
      prevHtmlOverflowRef.current = htmlEl.style.overflow
      prevBodyPaddingRightRef.current = bodyEl.style.paddingRight
      prevHtmlPaddingRightRef.current = htmlEl.style.paddingRight

      const scrollbarWidth = window.innerWidth - htmlEl.clientWidth
      if (scrollbarWidth > 0) {
        // Apply compensation only to body to avoid double gap
        bodyEl.style.paddingRight = `${scrollbarWidth}px`
      }
      bodyEl.style.overflow = 'hidden'
      htmlEl.style.overflow = 'hidden'
    } else {
      // Restore
      bodyEl.style.overflow = prevBodyOverflowRef.current
      htmlEl.style.overflow = prevHtmlOverflowRef.current
      bodyEl.style.paddingRight = prevBodyPaddingRightRef.current
      // html paddingRight was not changed; ensure it's cleared to previous
      htmlEl.style.paddingRight = prevHtmlPaddingRightRef.current
    }
    return () => {
      // Safety restore on unmount
      bodyEl.style.overflow = prevBodyOverflowRef.current
      htmlEl.style.overflow = prevHtmlOverflowRef.current
      bodyEl.style.paddingRight = prevBodyPaddingRightRef.current
      htmlEl.style.paddingRight = prevHtmlPaddingRightRef.current
    }
  }, [isExpanded])

  if (isLoading) {
    return (
      <aside className="relative w-[250px] bg-white p-4 rounded-lg">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </aside>
    )
  }

  if (error || !categories.length) {
    return (
      <aside className="relative w-[250px] bg-white p-4 rounded-lg">
        <p className="text-gray-500 text-sm">Categories not found</p>
      </aside>
    )
  }

  return (
    <div
      className="relative w-[320px]"
      ref={containerRef}
      onMouseEnter={() => { setSidebarHover(true); openExpanded() }}
      onMouseLeave={() => {
        setSidebarHover(false)
        scheduleClose(100)
      }}
    >
      {/* Collapsed sidebar (layout placeholder, fixed height, shadowed overflow) */}
      <aside className="relative -mt-2 bg-white pl-4 pt-4  mr-0 overflow-hidden" style={{ maxHeight: COLLAPSED_MAX_HEIGHT }}>
        <nav className="space-y-1">
          {categories.map((category) => (
            <div
              key={category.id}
              className="relative"
              onMouseEnter={() => { openExpanded(); scheduleHoverCategory(category.id, Boolean(category.children && category.children.length > 0)) }}
            >
              <Link
                href={`/category/${category.id}`}
                className="text-sm flex items-center justify-between rounded-lg px-4 py-2 text-gray-800 hover:bg-gray-50 hover:text-[#4563d1]"
              >
                <span>{category.name}</span>
                {category.children && category.children.length > 0 && (
                  <ChevronRight className="h-5 w-5" />
                )}
              </Link>
              {/* Flyout is disabled in collapsed mode to avoid clipping */}
            </div>
          ))}
        </nav>
        {/* Bottom gradient shadow to indicate more content */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-white to-transparent" style={{ height: SHADOW_HEIGHT_PX }} />
      </aside>

      {/* Floating expanded sidebar with dim overlay (overlay sits below the panels) */}
      {isExpanded && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-gray-700/30"
            onMouseEnter={() => { setSidebarHover(false); setSubpanelHover(false); scheduleClose(60) }}
            onClick={() => { setIsExpanded(false); setHoveredCategory(null) }}
          />
          {/* Expanded main sidebar showing full list */}
          <aside
            className="fixed z-[70] w-[320px] bg-white pl-4 mr-0 rounded-lg  overflow-auto"
            style={{ left: expandedPos.left, top: expandedPos.top, maxHeight: `${EXPANDED_MAX_HEIGHT_VH}vh` }}
            onMouseEnter={() => setSidebarHover(true)}
            onMouseLeave={() => {
              setSidebarHover(false)
              scheduleClose(120)
            }}
            ref={expandedPanelRef}
          >
            <nav className="space-y-1 pt-4 pb-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="relative"
                  onMouseEnter={() => { scheduleHoverCategory(category.id, Boolean(category.children && category.children.length > 0)) }}
                >
                  <Link
                    href={`/category/${category.id}`}
                    className="text-sm flex items-center justify-between rounded-lg px-4 py-2 text-gray-800 hover:bg-gray-50 hover:text-[#4563d1]"
                  >
                    <span>{category.name}</span>
                    {category.children && category.children.length > 0 && (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </Link>
                </div>
              ))}
            </nav>
          </aside>
          {/* Fixed-position subcategory panel glued to the right of the sidebar */}
          {hoveredCategory && (() => {
            const cat = categories.find(c => c.id === hoveredCategory);
            const items = cat?.children || [];
            if (!items.length) return null;
            
            const left = expandedPos.left + (containerRef.current?.getBoundingClientRect().width || 320) - 6;
            const top = expandedPos.top;
            
            const containerHeight = expandedHeightPx || Math.floor(window.innerHeight * (EXPANDED_MAX_HEIGHT_VH / 100));
            const approxItemHeight = 72; // базовая оценка высоты одного блока
            
            // 🔧 Крутилки для "чаще создавать колонки"
            const bias = 1.2;              // 1.1–1.5: чем больше, тем меньше itemsPerColumn
            const verticalPadding = 48;    // "съедаем" часть высоты под заголовки/отступы
            const hardCap = 4;             // максимум пунктов на одну колонку
            
            // Рассчитываем "эффективную" высоту и лимит на элементы в колонке
            const usableHeight = Math.max(0, containerHeight - verticalPadding);
            const itemsPerColumnRaw = Math.floor(usableHeight / (approxItemHeight * bias));
            const itemsPerColumn = Math.min(hardCap, Math.max(1, itemsPerColumnRaw));
            
            // Колонки и размеры
            const columns = Math.max(1, Math.ceil(items.length / itemsPerColumn));
            const columnWidth = 380; // px
            const panelWidth = Math.min(columns, 5) * columnWidth + 32; // кап 5 колонок + паддинг
            
            return (
              <aside
                className="fixed z-[80] bg-white rounded-r-lg  overflow-hidden ml-1"
                style={{ left, top, height: containerHeight, width: panelWidth }}
                onMouseEnter={() => setSubpanelHover(true)}
                onMouseLeave={() => {
                  setSubpanelHover(false)
                  scheduleClose(100)
                }}
              >
                <div className="h-full p-6 overflow-y-auto" style={{ scrollbarGutter: 'stable' as unknown as undefined }}>
                  <div
                    className="space-y-6"
                    style={{ columnCount: Math.min(columns, 5), columnGap: '16px' }}
                  >
                    {items.map((subcategory) => (
                      <div key={subcategory.id} style={{ breakInside: 'avoid' }}>
                        <h3 className="mb-2 font-bold text-sm text-gray-900">
                          <Link href={`/category/${subcategory.id}`} className="hover:text-[#4563d1]">
                            {subcategory.name}
                          </Link>
                        </h3>
                        {subcategory.children && subcategory.children.length > 0 && (
                          <ul className="space-y-2">
                            {subcategory.children.map((item: any) => (
                              <li key={item.id}>
                                <Link href={`/category/${item.id}`} className="text-sm text-gray-600 hover:text-[#4563d1]">
                                  {item.name}
                                </Link>
                                {Array.isArray(item.children) && item.children.length > 0 && (
                                  <ul className="ml-3 mt-1 space-y-1">
                                    {item.children.map((g: any) => (
                                      <li key={g.id}>
                                        <Link href={`/category/${g.id}`} className="text-[13px] text-gray-600 hover:text-[#4563d1]">
                                          {g.name}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            )
          })()}
        </>
      )}
    </div>
  )
}