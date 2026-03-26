<template>
  <div class="card">
    <div class="card-img" :class="imgBg">
      <span v-if="!mainImage" class="card-emoji">{{ typeEmoji }}</span>
      <img v-else :src="mainImage" alt="매물 사진">
      <div class="card-badges">
        <span class="badge badge-type">{{ property.property_type }}</span>
        <span class="badge" :class="dealBadgeClass">{{ property.price_type }}</span>
      </div>
    </div>
    <div class="card-body">
      <div class="card-addr">📍 {{ property.address }}</div>
      <div class="card-name">{{ property.title }}</div>
      <div class="card-price">{{ formattedPrice }}</div>
      <div class="card-details">
        <div class="detail-item"><strong>{{ property.area }}㎡</strong>면적</div>
        <div class="detail-item"><strong>{{ property.rooms }}룸</strong>구조</div>
        <div class="detail-item"><strong>{{ createdDate }}</strong>등록일</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ property: Object })

const mainImage = computed(() => props.property.images?.[0] || null)

const typeEmoji = computed(() => {
  const map = { '아파트': '🏢', '오피스텔': '🏬', '상가': '🏪', '기타': '🌿' }
  return map[props.property.property_type] || '🏠'
})

const imgBg = computed(() => {
  const map = { '아파트': 'bg1', '오피스텔': 'bg2', '상가': 'bg3', '기타': 'bg4' }
  return map[props.property.property_type] || 'bg1'
})

const dealBadgeClass = computed(() => {
  const map = { '매매': 'badge-sell', '전세': 'badge-jeonse', '월세': 'badge-monthly' }
  return map[props.property.price_type] || ''
})

const formattedPrice = computed(() => {
  const price = props.property.price
  const type = props.property.price_type
  if (!price) return '가격 문의'
  const eok = Math.floor(price / 100000000)
  const man = Math.floor((price % 100000000) / 10000)
  let str = ''
  if (eok > 0) str += `${eok}억 `
  if (man > 0) str += `${man.toLocaleString()}만`
  str += '원'
  if (type === '월세') return `보증 ${str} / 월세 별도`
  return str
})

const createdDate = computed(() => {
  if (!props.property.created_at) return '-'
  return new Date(props.property.created_at).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
})
</script>

<style scoped>
.card {
  background: var(--white); border-radius: 12px; border: 1px solid var(--border);
  overflow: hidden; cursor: pointer; transition: box-shadow 0.2s, transform 0.2s;
}
.card:hover { box-shadow: 0 6px 28px rgba(27,45,79,0.1); transform: translateY(-3px); }

.card-img {
  height: 155px; display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden;
}
.card-img img { width: 100%; height: 100%; object-fit: cover; }
.card-emoji { font-size: 36px; }
.bg1 { background: linear-gradient(135deg, #dde8f8 0%, #c5d8f0 100%); }
.bg2 { background: linear-gradient(135deg, #f5ede0 0%, #ecd8c0 100%); }
.bg3 { background: linear-gradient(135deg, #ddf0e8 0%, #b8e0ce 100%); }
.bg4 { background: linear-gradient(135deg, #f0f0dd 0%, #d8d8a8 100%); }

.card-badges { position: absolute; top: 10px; left: 10px; display: flex; gap: 4px; }
.badge { font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: 5px; }
.badge-type { background: rgba(27,45,79,0.82); color: #fff; }
.badge-sell { background: #e4f4e4; color: #1e7a1e; }
.badge-jeonse { background: #fff4e0; color: #a06000; }
.badge-monthly { background: #fde8e8; color: #a02020; }

.card-body { padding: 15px 16px 17px; }
.card-addr { font-size: 11px; color: var(--muted); margin-bottom: 5px; }
.card-name { font-size: 13px; font-weight: 600; color: var(--navy); margin-bottom: 8px; line-height: 1.45; letter-spacing: -0.2px; }
.card-price { font-size: 17px; font-weight: 800; color: var(--text); margin-bottom: 12px; letter-spacing: -0.5px; }
.card-details { display: flex; border-top: 1px solid var(--border); padding-top: 10px; }
.detail-item { flex: 1; text-align: center; font-size: 11px; color: var(--muted); border-right: 1px solid var(--border); padding: 0 4px; }
.detail-item:last-child { border-right: none; }
.detail-item strong { display: block; font-size: 12px; font-weight: 700; color: var(--navy); margin-bottom: 2px; }
</style>
