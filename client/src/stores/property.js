import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API = 'http://localhost:3000/api'

export const usePropertyStore = defineStore('property', () => {
  const properties = ref([])
  const adminProperties = ref([])
  const current = ref(null)
  const loading = ref(false)

  // 일반 사용자용 (노출 중인 것만)
  async function fetchAll(params = {}) {
    loading.value = true
    try {
      const res = await axios.get(`${API}/properties`, { params })
      properties.value = res.data
    } finally {
      loading.value = false
    }
  }

  // 관리자용 (숨김 포함 전체)
  async function fetchAllAdmin(token) {
    loading.value = true
    try {
      const res = await axios.get(`${API}/properties/admin/all`, {
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
      const res = await axios.get(`${API}/properties/${id}`)
      current.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function create(data, token) {
    const res = await axios.post(`${API}/properties`, data, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data
  }

  async function update(id, data, token) {
    const res = await axios.put(`${API}/properties/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data
  }

  async function remove(id, token) {
    await axios.delete(`${API}/properties/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    adminProperties.value = adminProperties.value.filter(p => p.id !== id)
  }

  return { properties, adminProperties, current, loading, fetchAll, fetchAllAdmin, fetchOne, create, update, remove }
})
