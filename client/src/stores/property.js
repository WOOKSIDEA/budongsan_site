import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

export const usePropertyStore = defineStore('property', () => {
  const properties = ref([])
  const adminProperties = ref([])
  const current = ref(null)
  const loading = ref(false)

  async function fetchAll(params = {}) {
    loading.value = true
    try {
      const res = await axios.get(`${API}/api/properties`, { params })
      properties.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function fetchAllAdmin(token) {
    loading.value = true
    try {
      const res = await axios.get(`${API}/api/properties/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      adminProperties.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id) {
    loading.value = true
    try {
      const res = await axios.get(`${API}/api/properties/${id}`)
      current.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function create(data, token) {
    const res = await axios.post(`${API}/api/properties`, data, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data
  }

  async function update(id, data, token) {
    const res = await axios.put(`${API}/api/properties/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data
  }

  async function remove(id, token) {
    await axios.delete(`${API}/api/properties/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    adminProperties.value = adminProperties.value.filter(p => p.id !== id)
  }

  return { properties, adminProperties, current, loading, fetchAll, fetchAllAdmin, fetchOne, create, update, remove }
})
