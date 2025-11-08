"use client"

import { useEffect, useState } from "react"

export function useFoodItems(restaurantId?: string, category?: string, collection?: string) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams()
        if (restaurantId) params.append("restaurantId", restaurantId)
        if (category) params.append("category", category)
        if (collection) params.append("collection", collection)

        const response = await fetch(`/api/food-items?${params}`)
        if (!response.ok) throw new Error("Failed to fetch")

        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [restaurantId, category, collection])

  return { data, loading, error }
}

export function useRestaurants() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/restaurants")
        if (!response.ok) throw new Error("Failed to fetch")

        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}
