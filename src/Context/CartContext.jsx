import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { API_BASE_URL } from '../config/api'

const CART_STORAGE_KEY = 'auronic_cart'

const CartContext = createContext(null)

const normalizeImageUrl = (imageUrl = '') => {
  if (!imageUrl) return ''
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl
  return `${API_BASE_URL}${imageUrl}`
}

const buildCartKey = ({ id, selectedColor, selectedWarranty }) => {
  return [id, selectedColor || 'no-color', selectedWarranty || 'no-warranty'].join('::')
}

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    try {
      const storedItems = localStorage.getItem(CART_STORAGE_KEY)
      if (storedItems) {
        const parsedItems = JSON.parse(storedItems)
        if (Array.isArray(parsedItems)) {
          setItems(parsedItems)
        }
      }
    } catch {
      setItems([])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (product, selections = {}) => {
    const cartKey = buildCartKey({
      id: product.id,
      selectedColor: selections.selectedColor,
      selectedWarranty: selections.selectedWarranty,
    })

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.cartKey === cartKey)

      if (existingItem) {
        return currentItems.map((item) =>
          item.cartKey === cartKey
            ? {
                ...item,
                quantity: item.quantity + (selections.quantity || 1),
              }
            : item,
        )
      }

      return [
        ...currentItems,
        {
          cartKey,
          productId: product.id,
          title: product.title,
          description: product.description,
          price: Number(product.price) || 0,
          originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
          coverImage: normalizeImageUrl(product.coverImage),
          selectedColor: selections.selectedColor || '',
          selectedWarranty: selections.selectedWarranty || '',
          quantity: selections.quantity || 1,
        },
      ]
    })
  }

  const removeItem = (cartKey) => {
    setItems((currentItems) => currentItems.filter((item) => item.cartKey !== cartKey))
  }

  const updateQuantity = (cartKey, quantity) => {
    const nextQuantity = Math.max(1, Number(quantity) || 1)
    setItems((currentItems) =>
      currentItems.map((item) => (item.cartKey === cartKey ? { ...item, quantity: nextQuantity } : item)),
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const cartCount = useMemo(() => items.reduce((total, item) => total + (Number(item.quantity) || 0), 0), [items])
  const cartSubtotal = useMemo(
    () => items.reduce((total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0),
    [items],
  )

  const value = {
    items,
    cartCount,
    cartSubtotal,
    isCartOpen,
    setIsCartOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
