/**
 * Skeleton Loading Components
 * Elegant loading states for luxury experience
 */

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  animate?: boolean
}

export function Skeleton({ className, animate = true }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-gray-200',
        animate && 'shimmer',
        className
      )}
    />
  )
}

// Product Card Skeleton
export function ProductSkeleton() {
  return (
    <div className="border border-gray-200 p-6 space-y-4">
      <Skeleton className="h-64 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// Look Card Skeleton
export function LookSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero Image */}
      <Skeleton className="h-[70vh] w-full" />
      
      {/* Look Info */}
      <div className="px-6 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-3/4" />
        </div>
        
        {/* Action Button */}
        <Skeleton className="h-14 w-full" />
        
        {/* Products */}
        <div className="space-y-2 pt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 p-4">
              <div className="flex justify-between items-center">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Guest List Skeleton
export function GuestListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-between p-4 border border-gray-100">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  )
}

// Stats Card Skeleton
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-1 w-full mt-2" />
        </div>
      ))}
    </div>
  )
}

// Text Line Skeleton
export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === 0 && "w-full", i === 1 && "w-4/5", i === 2 && "w-3/5")}
        />
      ))}
    </div>
  )
}

// Button Skeleton
export function ButtonSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn('h-12 w-32', className)} />
}

// Avatar Skeleton
export function AvatarSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  }
  
  return <Skeleton className={cn('rounded-full', sizes[size])} />
}

// Form Skeleton
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-12 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-12 w-full" />
      </div>
      <Skeleton className="h-12 w-full" />
    </div>
  )
}

export default Skeleton