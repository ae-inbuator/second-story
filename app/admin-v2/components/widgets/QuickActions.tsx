'use client'
import { useRouter } from 'next/navigation'
import { 
  Send, 
  UserPlus, 
  Upload, 
  Download,
  Bell,
  Radio,
  Package,
  Sparkles,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

const actions = [
  {
    id: 'announcement',
    label: 'Send Announcement',
    description: 'Broadcast to all guests',
    icon: Bell,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    href: '/admin-v2/show-control#announcement'
  },
  {
    id: 'add-guest',
    label: 'Add Guest',
    description: 'Quick registration',
    icon: UserPlus,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    href: '/admin-v2/guests#add'
  },
  {
    id: 'upload-product',
    label: 'Upload Product',
    description: 'Add new product',
    icon: Upload,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    href: '/admin-v2/products#upload'
  },
  {
    id: 'export-data',
    label: 'Export Data',
    description: 'Download reports',
    icon: Download,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    href: '/admin-v2/analytics#export'
  },
  {
    id: 'show-control',
    label: 'Show Control',
    description: 'Live management',
    icon: Radio,
    color: 'text-luxury-gold',
    bg: 'bg-luxury-gold/10',
    href: '/admin-v2/show-control'
  },
  {
    id: 'manage-looks',
    label: 'Manage Looks',
    description: 'Edit runway looks',
    icon: Sparkles,
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
    href: '/admin-v2/looks'
  }
]

export function QuickActions() {
  const router = useRouter()

  return (
    <div className="bg-gray-950 border border-gray-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Quick Actions</h3>
        <span className="text-xs text-gray-500">Press ⌘K for command palette</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => router.push(action.href)}
            className="group relative flex flex-col items-start p-3 bg-gray-900 hover:bg-gray-800 rounded-lg transition-all text-left"
          >
            <div className="flex items-start justify-between w-full mb-2">
              <div className={cn("p-2 rounded", action.bg)}>
                <action.icon className={cn("w-4 h-4", action.color)} />
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-all" />
            </div>
            <p className="text-sm font-medium text-white group-hover:text-luxury-gold transition-colors">
              {action.label}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {action.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}