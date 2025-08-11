'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { UploadDropzone } from '@/lib/uploadthing'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

export function ProductUpload({ eventId, onProductCreated }: { eventId?: string, onProductCreated?: () => void }) {
  const [product, setProduct] = useState({
    name: '',
    brand: '',
    price: '',
    size: '',
    condition: 'Excellent',
    description: '',
    measurements: {} as any
  })
  const [images, setImages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    
    const { error } = await supabase
      .from('products')
      .insert([{
        ...product,
        price: parseFloat(product.price),
        images: images,
        measurements: product.measurements
      }])
    
    if (error) {
      toast.error('Failed to add product', {
        style: {
          background: '#000',
          color: '#fff',
          fontSize: '14px',
          letterSpacing: '0.05em',
        },
      })
    } else {
      toast.success('Product added successfully!', {
        style: {
          background: '#D4AF37',
          color: '#000',
          fontSize: '14px',
          letterSpacing: '0.05em',
        },
      })
      setProduct({
        name: '',
        brand: '',
        price: '',
        size: '',
        condition: 'Excellent',
        description: '',
        measurements: {}
      })
      setImages([])
      
      // Trigger refresh if callback provided
      if (onProductCreated) {
        onProductCreated()
      }
    }
    setIsLoading(false)
  }
  
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }
  
  return (
    <Card variant="luxury">
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="BRAND"
            value={product.brand}
            onChange={(e) => setProduct({...product, brand: e.target.value})}
            required
            disabled={isLoading}
            className="text-center tracking-widest uppercase"
          />
          <Input
            placeholder="PRODUCT NAME"
            value={product.name}
            onChange={(e) => setProduct({...product, name: e.target.value})}
            required
            disabled={isLoading}
            className="text-center tracking-widest uppercase"
          />
          <Input
            type="number"
            placeholder="PRICE"
            value={product.price}
            onChange={(e) => setProduct({...product, price: e.target.value})}
            required
            disabled={isLoading}
            className="text-center tracking-widest"
          />
          <Input
            placeholder="SIZE (OPTIONAL)"
            value={product.size}
            onChange={(e) => setProduct({...product, size: e.target.value})}
            disabled={isLoading}
            className="text-center tracking-widest uppercase"
          />
          <select
            className="w-full px-4 py-3 border border-gray-300 text-center tracking-widest uppercase transition-all duration-300 focus:border-black outline-none"
            value={product.condition}
            onChange={(e) => setProduct({...product, condition: e.target.value})}
            disabled={isLoading}
          >
            <option value="Excellent">Excellent</option>
            <option value="Very Good">Very Good</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
          </select>
          
          {/* Measurements Section */}
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-widest text-gray-600">Measurements (optional)</p>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="LENGTH (CM)"
                type="number"
                value={product.measurements.length || ''}
                onChange={(e) => setProduct({
                  ...product, 
                  measurements: {...product.measurements, length: e.target.value}
                })}
                disabled={isLoading}
                className="text-center tracking-widest"
              />
              <Input
                placeholder="WIDTH (CM)"
                type="number"
                value={product.measurements.width || ''}
                onChange={(e) => setProduct({
                  ...product, 
                  measurements: {...product.measurements, width: e.target.value}
                })}
                disabled={isLoading}
                className="text-center tracking-widest"
              />
              <Input
                placeholder="HEIGHT (CM)"
                type="number"
                value={product.measurements.height || ''}
                onChange={(e) => setProduct({
                  ...product, 
                  measurements: {...product.measurements, height: e.target.value}
                })}
                disabled={isLoading}
                className="text-center tracking-widest"
              />
              <Input
                placeholder="STRAP DROP"
                type="number"
                value={product.measurements.strapDrop || ''}
                onChange={(e) => setProduct({
                  ...product, 
                  measurements: {...product.measurements, strapDrop: e.target.value}
                })}
                disabled={isLoading}
                className="text-center tracking-widest"
              />
            </div>
          </div>
          
          <textarea
            className="w-full px-4 py-3 border border-gray-300 tracking-wide transition-all duration-300 focus:border-black outline-none resize-none"
            placeholder="Description (optional)"
            rows={3}
            value={product.description}
            onChange={(e) => setProduct({...product, description: e.target.value})}
            disabled={isLoading}
          />
          
          {/* Image Upload Section */}
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-widest text-gray-600">Product Images</p>
            
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {images.map((url, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={url} 
                      alt={`Product ${index + 1}`}
                      className="w-full h-24 object-cover border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-black text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {images.length < 5 && (
              <UploadDropzone
                endpoint="productImage"
                onClientUploadComplete={(res) => {
                  if (res) {
                    const newUrls = res.map(file => file.url)
                    setImages([...images, ...newUrls])
                    toast.success('Images uploaded!', {
                      style: {
                        background: '#D4AF37',
                        color: '#000',
                        fontSize: '14px',
                        letterSpacing: '0.05em',
                      },
                    })
                  }
                }}
                onUploadError={(error: Error) => {
                  toast.error(`Upload failed: ${error.message}`, {
                    style: {
                      background: '#000',
                      color: '#fff',
                      fontSize: '14px',
                      letterSpacing: '0.05em',
                    },
                  })
                }}
                appearance={{
                  container: "border-2 border-dashed border-gray-300 p-4",
                  uploadIcon: "text-gray-400",
                  label: "text-sm text-gray-600 uppercase tracking-widest",
                  allowedContent: "text-xs text-gray-500"
                }}
              />
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-8 py-4 bg-black text-white font-light tracking-widest uppercase transition-all duration-300 hover:bg-luxury-gold hover:text-black disabled:opacity-50"
          >
            {isLoading ? 'ADDING...' : 'ADD PRODUCT'}
          </button>
        </form>
      </CardContent>
    </Card>
  )
}