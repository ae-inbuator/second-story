'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, FileSpreadsheet, FileText, Users, ShoppingBag, BarChart3, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

export function ExportPanel({ eventId = '1' }: { eventId?: string }) {
  const [isExporting, setIsExporting] = useState<string | null>(null)

  const handleExport = async (type: string, format: string) => {
    setIsExporting(`${type}-${format}`)
    
    try {
      const response = await fetch(`/api/admin/export/${type}?format=${format}&eventId=${eventId}`)
      
      if (!response.ok) {
        throw new Error('Export failed')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      const date = new Date().toISOString().split('T')[0]
      const extension = format === 'csv' ? 'csv' : 'xlsx'
      a.download = `second-story-${type}-${date}.${extension}`
      
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast.success(`${type} exported successfully!`, {
        icon: '📊',
        duration: 3000
      })
    } catch (error) {
      console.error('Export error:', error)
      toast.error(`Failed to export ${type}`, {
        icon: '❌',
        duration: 4000
      })
    } finally {
      setIsExporting(null)
    }
  }

  const exportOptions = [
    {
      id: 'guests',
      title: 'Guest List',
      description: 'Export all registered guests with their wishlist summary',
      icon: Users,
      data: 'Names, emails, registration dates, wishlists',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      id: 'wishlists',
      title: 'Wishlist Queue',
      description: 'Export complete wishlist with queue positions',
      icon: ShoppingBag,
      data: 'Products, queue positions, guest details',
      color: 'text-luxury-gold',
      bgColor: 'bg-luxury-gold/10',
      borderColor: 'border-luxury-gold/20'
    },
    {
      id: 'analytics',
      title: 'Analytics Report',
      description: 'Export detailed analytics and behavior data',
      icon: BarChart3,
      data: 'Views, conversions, guest engagement',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-luxury-gold/10 rounded-lg">
          <Download className="w-6 h-6 text-luxury-gold" />
        </div>
        <div>
          <h2 className="text-xl font-playfair text-white">Export Data</h2>
          <p className="text-sm text-gray-400">Download event data in multiple formats</p>
        </div>
      </div>

      <div className="space-y-4">
        {exportOptions.map((option, index) => {
          const Icon = option.icon
          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "bg-gray-950 border rounded-lg p-6 transition-all duration-300 hover:border-luxury-gold/30",
                option.borderColor
              )}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={cn("p-3 rounded-lg", option.bgColor)}>
                  <Icon className={cn("w-6 h-6", option.color)} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg text-white mb-2">
                    {option.title}
                  </h3>
                  <p className="text-gray-400 mb-3">
                    {option.description}
                  </p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    Includes: {option.data}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleExport(option.id, 'csv')}
                  disabled={isExporting === `${option.id}-csv`}
                  className={cn(
                    "btn-luxury-ghost px-4 py-2 flex items-center justify-center gap-2",
                    "text-white border-gray-700 hover:border-luxury-gold hover:text-luxury-gold",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {isExporting === `${option.id}-csv` ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  <span className="text-sm">
                    {isExporting === `${option.id}-csv` ? 'Exporting...' : 'Export CSV'}
                  </span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleExport(option.id, 'excel')}
                  disabled={isExporting === `${option.id}-excel`}
                  className={cn(
                    "btn-luxury px-4 py-2 flex items-center justify-center gap-2",
                    "bg-luxury-gold text-black hover:bg-white",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {isExporting === `${option.id}-excel` ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-4 h-4" />
                  )}
                  <span className="text-sm">
                    {isExporting === `${option.id}-excel` ? 'Exporting...' : 'Export Excel'}
                  </span>
                </motion.button>
              </div>
            </motion.div>
          )
        })}
      </div>
        
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-950 border border-gray-900 rounded-lg p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-luxury-gold rounded-full" />
          <h3 className="text-sm font-medium text-white uppercase tracking-wider">Export Guidelines</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-400">
          <div>
            <p className="font-medium text-gray-300 mb-2">File Formats:</p>
            <ul className="space-y-1">
              <li>• CSV: Universal spreadsheet format</li>
              <li>• Excel: Multi-sheet with summaries</li>
              <li>• Data reflects real-time state</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-gray-300 mb-2">Best Practices:</p>
            <ul className="space-y-1">
              <li>• Export after events for analysis</li>
              <li>• Guest list for follow-up campaigns</li>
              <li>• Wishlist queue for fulfillment</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}