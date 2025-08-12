'use client'
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Check,
  X,
  Edit,
  Trash,
  Eye,
  Copy,
  RefreshCw,
  Settings2,
  ArrowUpDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: string
  header: string
  accessor: (item: T) => any
  sortable?: boolean
  searchable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: any, item: T) => React.ReactNode
}

export interface Action<T> {
  label: string
  icon?: any
  onClick: (item: T) => void
  show?: (item: T) => boolean
  variant?: 'default' | 'danger' | 'success'
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  actions?: Action<T>[]
  searchable?: boolean
  searchPlaceholder?: string
  filterable?: boolean
  filters?: { label: string; value: string }[]
  sortable?: boolean
  selectable?: boolean
  bulkActions?: Action<T[]>[]
  exportable?: boolean
  exportFilename?: string
  refreshable?: boolean
  onRefresh?: () => void
  loading?: boolean
  emptyMessage?: string
  emptyIcon?: any
  pageSize?: number
  className?: string
  rowClassName?: (item: T) => string
  onRowClick?: (item: T) => void
  stickyHeader?: boolean
  virtualScroll?: boolean
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  actions = [],
  searchable = true,
  searchPlaceholder = 'Search...',
  filterable = true,
  filters = [],
  sortable = true,
  selectable = false,
  bulkActions = [],
  exportable = true,
  exportFilename = 'export',
  refreshable = false,
  onRefresh,
  loading = false,
  emptyMessage = 'No data found',
  emptyIcon: EmptyIcon = Filter,
  pageSize = 20,
  className = '',
  rowClassName,
  onRowClick,
  stickyHeader = true,
  virtualScroll = false
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(new Set())
  const [showColumnSettings, setShowColumnSettings] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.map(col => col.key))
  )

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = [...data]

    // Search filter
    if (search && searchable) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(item => {
        return columns.some(col => {
          if (!col.searchable && col.searchable !== undefined) return false
          const value = col.accessor(item)
          return value?.toString().toLowerCase().includes(searchLower)
        })
      })
    }

    // Custom filter
    if (filter !== 'all' && filterable) {
      // Apply custom filter logic here based on filter value
    }

    // Sort
    if (sortKey && sortable) {
      const column = columns.find(col => col.key === sortKey)
      if (column) {
        filtered.sort((a, b) => {
          const aVal = column.accessor(a)
          const bVal = column.accessor(b)
          
          if (aVal === bVal) return 0
          
          const comparison = aVal < bVal ? -1 : 1
          return sortOrder === 'asc' ? comparison : -comparison
        })
      }
    }

    return filtered
  }, [data, search, filter, sortKey, sortOrder, columns, searchable, filterable, sortable])

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize)
  const paginatedData = virtualScroll 
    ? processedData 
    : processedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Handle sort
  const handleSort = (key: string) => {
    if (!sortable) return
    
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  // Handle selection
  const handleSelectAll = () => {
    if (selectedItems.size === paginatedData.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(paginatedData.map(item => item.id)))
    }
  }

  const handleSelectItem = (id: string | number) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  // Export functionality
  const handleExport = () => {
    const csvContent = [
      columns.filter(col => visibleColumns.has(col.key)).map(col => col.header).join(','),
      ...processedData.map(item =>
        columns
          .filter(col => visibleColumns.has(col.key))
          .map(col => {
            const value = col.accessor(item)
            return typeof value === 'string' && value.includes(',')
              ? `"${value}"`
              : value
          })
          .join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${exportFilename}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="bg-gray-950 border border-gray-900 rounded-lg p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-800 rounded" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-800 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("bg-gray-950 border border-gray-900 rounded-lg overflow-hidden", className)}>
      {/* Header Controls */}
      <div className="p-4 border-b border-gray-900">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          {searchable && (
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black border border-gray-800 rounded-lg text-white placeholder:text-gray-600 focus:border-luxury-gold focus:outline-none"
              />
            </div>
          )}

          {/* Filters */}
          {filterable && filters.length > 0 && (
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-black border border-gray-800 rounded-lg text-white focus:border-luxury-gold focus:outline-none"
            >
              <option value="all">All</option>
              {filters.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Bulk Actions */}
            {selectable && selectedItems.size > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-luxury-gold/20 rounded-lg">
                <span className="text-sm text-luxury-gold">
                  {selectedItems.size} selected
                </span>
                {bulkActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const items = processedData.filter(item => selectedItems.has(item.id))
                      action.onClick(items)
                      setSelectedItems(new Set())
                    }}
                    className="p-1.5 hover:bg-luxury-gold/30 rounded transition-colors"
                  >
                    {action.icon && <action.icon className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            )}

            {/* Column Settings */}
            <button
              onClick={() => setShowColumnSettings(!showColumnSettings)}
              className="p-2 hover:bg-gray-900 rounded-lg transition-colors relative"
            >
              <Settings2 className="w-4 h-4 text-gray-400" />
              
              {showColumnSettings && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-gray-950 border border-gray-800 rounded-lg shadow-lg z-10 p-2">
                  <p className="text-xs text-gray-500 px-2 py-1">Show Columns</p>
                  {columns.map(col => (
                    <label
                      key={col.key}
                      className="flex items-center gap-2 px-2 py-1 hover:bg-gray-900 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns.has(col.key)}
                        onChange={(e) => {
                          const newVisible = new Set(visibleColumns)
                          if (e.target.checked) {
                            newVisible.add(col.key)
                          } else {
                            newVisible.delete(col.key)
                          }
                          setVisibleColumns(newVisible)
                        }}
                        className="rounded border-gray-700"
                      />
                      <span className="text-sm">{col.header}</span>
                    </label>
                  ))}
                </div>
              )}
            </button>

            {/* Refresh */}
            {refreshable && (
              <button
                onClick={onRefresh}
                className="p-2 hover:bg-gray-900 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-gray-400" />
              </button>
            )}

            {/* Export */}
            {exportable && (
              <button
                onClick={handleExport}
                className="p-2 hover:bg-gray-900 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={cn(
            "bg-gray-900/50 border-b border-gray-900",
            stickyHeader && "sticky top-0 z-10"
          )}>
            <tr>
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-700"
                  />
                </th>
              )}
              {columns.filter(col => visibleColumns.has(col.key)).map(column => (
                <th
                  key={column.key}
                  className={cn(
                    "px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider",
                    column.align === 'center' && "text-center",
                    column.align === 'right' && "text-right",
                    column.sortable !== false && sortable && "cursor-pointer hover:text-white transition-colors"
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className={cn(
                    "flex items-center gap-2",
                    column.align === 'center' && "justify-center",
                    column.align === 'right' && "justify-end"
                  )}>
                    {column.header}
                    {column.sortable !== false && sortable && (
                      <ArrowUpDown className={cn(
                        "w-3 h-3",
                        sortKey === column.key ? "text-luxury-gold" : "text-gray-600"
                      )} />
                    )}
                  </div>
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-900">
            <AnimatePresence mode="popLayout">
              {paginatedData.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    "hover:bg-gray-900/50 transition-colors",
                    onRowClick && "cursor-pointer",
                    rowClassName?.(item)
                  )}
                >
                  {selectable && (
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-gray-700"
                      />
                    </td>
                  )}
                  {columns.filter(col => visibleColumns.has(col.key)).map(column => (
                    <td
                      key={column.key}
                      className={cn(
                        "px-6 py-4 text-sm",
                        column.align === 'center' && "text-center",
                        column.align === 'right' && "text-right"
                      )}
                    >
                      {column.render
                        ? column.render(column.accessor(item), item)
                        : column.accessor(item)}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {actions.map((action, i) => {
                          if (action.show && !action.show(item)) return null
                          
                          return (
                            <button
                              key={i}
                              onClick={(e) => {
                                e.stopPropagation()
                                action.onClick(item)
                              }}
                              className={cn(
                                "p-1.5 rounded transition-colors",
                                action.variant === 'danger'
                                  ? "hover:bg-red-500/20 text-red-400"
                                  : action.variant === 'success'
                                  ? "hover:bg-green-500/20 text-green-400"
                                  : "hover:bg-gray-800 text-gray-400"
                              )}
                              title={action.label}
                            >
                              {action.icon && <action.icon className="w-4 h-4" />}
                            </button>
                          )
                        })}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {processedData.length === 0 && (
        <div className="p-12 text-center">
          <EmptyIcon className="w-12 h-12 mx-auto mb-4 text-gray-700" />
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      )}

      {/* Pagination */}
      {!virtualScroll && totalPages > 1 && (
        <div className="px-6 py-4 bg-gray-900/30 border-t border-gray-900">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, processedData.length)} of {processedData.length} results
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const page = i + 1
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "px-3 py-1 rounded text-sm",
                        currentPage === page
                          ? "bg-luxury-gold text-black"
                          : "text-gray-400 hover:text-white hover:bg-gray-800"
                      )}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}