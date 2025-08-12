'use client'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface ChartProps {
  type: 'line' | 'bar' | 'donut' | 'area'
  data: any[]
  labels?: string[]
  colors?: string[]
  height?: number
  className?: string
  animate?: boolean
}

export function Chart({ 
  type, 
  data, 
  labels = [], 
  colors = ['#D4AF37', '#60A5FA', '#34D399', '#F87171', '#A78BFA'],
  height = 300,
  className = '',
  animate = true 
}: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth * 2
    canvas.height = height * 2
    ctx.scale(2, 2)

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const width = canvas.offsetWidth
    const padding = 40
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    if (type === 'line' || type === 'area') {
      drawLineChart(ctx, data, labels, chartWidth, chartHeight, padding, colors[0], type === 'area')
    } else if (type === 'bar') {
      drawBarChart(ctx, data, labels, chartWidth, chartHeight, padding, colors)
    } else if (type === 'donut') {
      drawDonutChart(ctx, data, labels, chartWidth, chartHeight, padding, colors)
    }
  }, [type, data, labels, colors, height])

  return (
    <canvas
      ref={canvasRef}
      className={cn("w-full", className)}
      style={{ height: `${height}px` }}
    />
  )
}

function drawLineChart(
  ctx: CanvasRenderingContext2D,
  data: number[],
  labels: string[],
  width: number,
  height: number,
  padding: number,
  color: string,
  fillArea: boolean
) {
  if (data.length === 0) return

  const maxValue = Math.max(...data)
  const minValue = Math.min(...data)
  const range = maxValue - minValue || 1
  const stepX = width / (data.length - 1)

  // Draw grid lines
  ctx.strokeStyle = '#374151'
  ctx.lineWidth = 0.5
  for (let i = 0; i <= 5; i++) {
    const y = padding + (height * i) / 5
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(padding + width, y)
    ctx.stroke()
  }

  // Draw line
  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.lineWidth = 2

  const points: [number, number][] = []
  data.forEach((value, i) => {
    const x = padding + i * stepX
    const y = padding + height - ((value - minValue) / range) * height
    points.push([x, y])
    
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })

  ctx.stroke()

  // Fill area if requested
  if (fillArea && points.length > 0) {
    ctx.lineTo(points[points.length - 1][0], padding + height)
    ctx.lineTo(points[0][0], padding + height)
    ctx.closePath()
    ctx.fillStyle = color + '20'
    ctx.fill()
  }

  // Draw points
  ctx.fillStyle = color
  points.forEach(([x, y]) => {
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fill()
  })

  // Draw labels
  ctx.fillStyle = '#9CA3AF'
  ctx.font = '10px sans-serif'
  ctx.textAlign = 'center'
  labels.forEach((label, i) => {
    const x = padding + i * stepX
    ctx.fillText(label, x, padding + height + 15)
  })
}

function drawBarChart(
  ctx: CanvasRenderingContext2D,
  data: number[],
  labels: string[],
  width: number,
  height: number,
  padding: number,
  colors: string[]
) {
  if (data.length === 0) return

  const maxValue = Math.max(...data)
  const barWidth = width / data.length * 0.6
  const barSpacing = width / data.length * 0.4
  const stepX = width / data.length

  // Draw grid lines
  ctx.strokeStyle = '#374151'
  ctx.lineWidth = 0.5
  for (let i = 0; i <= 5; i++) {
    const y = padding + (height * i) / 5
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(padding + width, y)
    ctx.stroke()
  }

  // Draw bars
  data.forEach((value, i) => {
    const x = padding + i * stepX + barSpacing / 2
    const barHeight = (value / maxValue) * height
    const y = padding + height - barHeight

    // Bar gradient effect
    const gradient = ctx.createLinearGradient(x, y, x, y + barHeight)
    gradient.addColorStop(0, colors[i % colors.length])
    gradient.addColorStop(1, colors[i % colors.length] + '80')
    
    ctx.fillStyle = gradient
    ctx.fillRect(x, y, barWidth, barHeight)

    // Value label
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(value.toString(), x + barWidth / 2, y - 5)
  })

  // Draw labels
  ctx.fillStyle = '#9CA3AF'
  ctx.font = '10px sans-serif'
  ctx.textAlign = 'center'
  labels.forEach((label, i) => {
    const x = padding + i * stepX + stepX / 2
    ctx.fillText(label, x, padding + height + 15)
  })
}

function drawDonutChart(
  ctx: CanvasRenderingContext2D,
  data: number[],
  labels: string[],
  width: number,
  height: number,
  padding: number,
  colors: string[]
) {
  if (data.length === 0) return

  const centerX = padding + width / 2
  const centerY = padding + height / 2
  const radius = Math.min(width, height) / 2 - 20
  const innerRadius = radius * 0.6
  const total = data.reduce((sum, val) => sum + val, 0)

  let currentAngle = -Math.PI / 2

  // Draw segments
  data.forEach((value, i) => {
    const sliceAngle = (value / total) * Math.PI * 2
    
    // Draw outer arc
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
    ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true)
    ctx.closePath()
    ctx.fillStyle = colors[i % colors.length]
    ctx.fill()

    // Draw label
    const labelAngle = currentAngle + sliceAngle / 2
    const labelX = centerX + Math.cos(labelAngle) * (radius + 20)
    const labelY = centerY + Math.sin(labelAngle) * (radius + 20)
    
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${labels[i] || ''}`, labelX, labelY)
    ctx.fillText(`${Math.round((value / total) * 100)}%`, labelX, labelY + 12)

    currentAngle += sliceAngle
  })

  // Draw center text
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 24px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(total.toString(), centerX, centerY - 10)
  ctx.font = '12px sans-serif'
  ctx.fillStyle = '#9CA3AF'
  ctx.fillText('Total', centerX, centerY + 10)
}