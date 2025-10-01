'use client'

import Link from 'next/link'
import { 
  Sparkles, 
  Sprout, 
  Pill, 
  Scissors, 
  Leaf, 
  Sun, 
  Heart, 
  Droplet,
  Shirt,
  Footprints,
  Watch,
  Baby,
  Home,
  Dumbbell,
  Smartphone,
  Laptop,
  Tv,
  Camera,
  Gamepad,
  Plug,
  LucideIcon 
} from 'lucide-react'

interface CategoryCardProps {
  title: string
  iconType: string
  count: number
  href: string
}

const iconMap: Record<string, LucideIcon> = {

  sparkles: Sparkles,
  sprout: Sprout,
  pill: Pill,
  scissors: Scissors,
  leaf: Leaf,
  sun: Sun,
  heart: Heart,
  droplet: Droplet,

  shirt: Shirt,
  dress: Shirt, 
  boot: Footprints, 
  footprints: Footprints,
  watch: Watch,
  baby: Baby,
  home: Home,
  dumbbell: Dumbbell,
  jacket: Shirt,
  smartphone: Smartphone,
  laptop: Laptop,
  tv: Tv,
  camera: Camera,
  gamepad: Gamepad,
  plug: Plug
}

export default function CategoryCard({ title, iconType, count, href }: CategoryCardProps) {
  const Icon = iconMap[iconType] || Sparkles

  return (
    <Link
      href={href}
      className="group flex h-50 w-full flex-col items-center justify-between rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-0 rounded-full bg-gray-50 p-4 text-[#4563d1] transition-colors group-hover:bg-[#4563d1] group-hover:text-white">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="mb-0 h-20 w-full overflow-hidden text-center text-sm font-medium text-gray-900">
        {title}
      </h3>
      <span className="text-xs text-gray-500">{count} товарів</span>
    </Link>
  )
} 