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
  // Beauty icons
  sparkles: Sparkles,
  sprout: Sprout,
  pill: Pill,
  scissors: Scissors,
  leaf: Leaf,
  sun: Sun,
  heart: Heart,
  droplet: Droplet,
  // Fashion icons
  shirt: Shirt,
  dress: Shirt, // Using Shirt for dress since Lucide doesn't have a dress icon
  boot: Footprints, // Using Footprints for boots
  footprints: Footprints,
  watch: Watch,
  baby: Baby,
  home: Home,
  dumbbell: Dumbbell,
  jacket: Shirt, // Using Shirt for jacket
  // Electronics icons
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
      className="group flex flex-col items-center rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-4 rounded-full bg-gray-50 p-4 text-[#7B1FA2] transition-colors group-hover:bg-[#7B1FA2] group-hover:text-white">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="mb-2 text-center text-sm font-medium text-gray-900">
        {title}
      </h3>
      <span className="text-xs text-gray-500">{count} товарів</span>
    </Link>
  )
} 