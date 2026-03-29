<template>
  <div class="admin-wrap">
    <div class="sidebar">
      <div class="sidebar-logo">구래부동산</div>
      <div class="sidebar-sub">관리자 페이지</div>
      <nav class="sidebar-nav">
        <div class="nav-item" :class="{ active: tab === 'list' }" @click="tab = 'list'">📋 매물 목록</div>
        <div class="nav-item" :class="{ active: tab === 'add' }" @click="openAdd">➕ 매물 등록</div>
        <div class="nav-item" :class="{ active: tab === 'inquiry' }" @click="tab = 'inquiry'">📩 문의 내역</div>
      </nav>
      <button class="logout-btn" @click="doLogout">로그아웃</button>
    </div>
    <!-- 모바일 탭 -->
    <div class="mobile-tabs">
      <div class="mobile-tab" :class="{ active: tab === 'list' }" @click="tab = 'list'">📋 목록</div>
      <div class="mobile-tab" :class="{ active: tab === 'add' }" @click="openAdd">➕ 등록</div>
      <div class="mobile-tab" :class="{ active: tab === 'inquiry' }" @click="tab = 'inquiry'">📩 문의</div>
      <div class="mobile-tab logout" @click="doLogout">로그아웃</div>
    </div>
    <div class="main-content">
      <div v-if="tab === 'list'">
        <div class="content-header">
          <div class="content-title">매물 목록</div>
          <button class="add-btn" @click="openAdd">+ 새 매물 등록</button>
        </div>
        <div v-if="store.loading" class="empty">불러오는 중...</div>
        <div v-else-if="store.adminProperties.length === 0" class="empty">등록된 매물이 없습니다.</div>
        <div v-else class="property-table">
          <div class="table-header">
            <span>종류</span><span>제목</span><span>거래</span><span>가격</span><span>노출</span><span>관리</span>
          </div>
          <div v-for="p in store.adminProperties" :key="p.id" class="table-row">
            <span><span class="badge badge-type">{{ p.property_type }}</span></span>
            <span class="row-title">{{ p.title }}</span>
            <span><span class="badge" :class="dealClass(p.price_type)">{{ p.price_type }}</span></span>
            <span class="row-price">{{ formatPrice(p.price) }}</span>
            <span>
              <button class="toggle-status" :class="p.is_active ? 'on' : 'off'" @click="toggleActive(p)" :disabled="togglingId === p.id">
                {{ togglingId === p.id ? '...' : p.is_active ? '노출 중' : '숨김' }}
              </button>
            </span>
            <span class="row-actions">
              <button class="edit-btn" @click="openEdit(p)">수정</button>
              <button class="delete-btn" @click="deleteProperty(p.id)">삭제</button>
            </span>
          </div>
        </div>
      </div>
      <div v-if="tab === 'add' || tab === 'edit'">
        <div class="content-header">
          <div class="content-title">{{ tab === 'add' ? '매물 등록' : '매물 수정' }}</div>
          <button class="cancel-btn" @click="tab = 'list'">취소</button>
        </div>
        <div class="form-grid">
          <div class="form-group full">
            <label>매물명 *</label>
            <input v-model="form.title" type="text" placeholder="예: 래미안 구래 아파트 고층 전망 좋은 집">
          </div>
          <div class="form-group">
            <label>물건 종류 *</label>
            <select v-model="form.property_type">
              <option>아파트</option><option>오피스텔</option><option>상가</option><option>기타</option>
            </select>
          </div>
          <div class="form-group">
            <label>거래 유형 *</label>
            <select v-model="form.price_type">
              <option v-for="d in availableDeals" :key="d">{{ d }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>가격 (원) *</label>
            <input v-model="form.price" type="number" placeholder="예: 520000000">
          </div>
          <div class="form-group">
            <label>면적 (㎡)</label>
            <input v-model="form.area" type="number" placeholder="예: 84.5">
          </div>
          <div class="form-group">
            <label>방 개수</label>
            <input v-model="form.rooms" type="number" placeholder="예: 3">
          </div>
          <div class="form-group full">
            <label>주소 *</label>
            <div class="addr-wrap">
              <input v-model="form.address" type="text" placeholder="아래 버튼으로 주소를 검색하세요" readonly>
              <button type="button" class="addr-btn" @click="searchAddress">🔍 주소 검색</button>
            </div>
            <input v-model="form.address_detail" type="text" placeholder="상세주소 입력 (동/호수 등)" style="margin-top:8px">
          </div>
          <div class="form-group full">
            <label>매물 설명</label>
            <textarea v-model="form.description" rows="5" placeholder="매물에 대한 상세 설명을 입력하세요."></textarea>
          </div>
          <div class="form-group full" v-if="tab === 'edit'">
            <label>노출 상태</label>
            <div class="toggle-wrap">
              <label class="toggle">
                <input type="checkbox" v-model="form.is_active">
                <span class="slider"></span>
              </label>
              <span class="toggle-label">{{ form.is_active ? '노출 중' : '숨김' }}</span>
            </div>
          </div>
          <div class="form-group full">
            <label>매물 사진 (최대 10장)</label>
            <div class="upload-area" @click="triggerUpload" @dragover.prevent @drop.prevent="onDrop">
              <div class="upload-icon">📷</div>
              <div class="upload-text">클릭하거나 사진을 여기에 드래그하세요</div>
              <div class="upload-sub">JPG, PNG, WEBP · 최대 10MB</div>
              <input ref="fileInput" type="file" multiple accept="image/*" style="display:none" @change="onFileChange">
            </div>
            <div v-if="previewImages.length > 0" class="preview-grid">
              <div v-for="(img, i) in previewImages" :key="i" class="preview-item">
                <img :src="img.url" alt="">
                <button class="remove-img" @click="removeImage(i, img)">✕</button>
                <div v-if="img.uploading" class="uploading-overlay">업로드 중...</div>
              </div>
            </div>
          </div>
        </div>
        <div class="form-actions">
          <button class="save-btn" @click="saveProperty" :disabled="saving || isUploading">
            {{ saving ? '저장 중...' : isUploading ? '사진 업로드 중...' : (tab === 'add' ? '등록하기' : '수정 저장') }}
          </button>
        </div>
      </div>
      <div v-if="tab === 'inquiry'">
        <div class="content-header">
          <div class="content-title">문의 내역</div>
        </div>
        <div v-if="inquiries.length === 0" class="empty">문의 내역이 없습니다.</div>
        <div v-else class="inquiry-table">
          <div class="table-header">
            <span>매물명</span><span>이름</span><span>연락처</span><span>문의 내용</span><span>일시</span>
          </div>
          <div v-for="q in inquiries" :key="q.id" class="table-row">
            <span class="row-title">{{ q.property_title || '-' }}</span>
            <span>{{ q.name }}</span>
            <span>{{ q.phone }}</span>
            <span class="row-msg">{{ q.message }}</span>
            <span class="row-date">{{ formatDate(q.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePropertyStore } from '../stores/property'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const router = useRouter()
const store = usePropertyStore()
const auth = useAuthStore()
const tab = ref('list')
const saving = ref(false)
const inquiries = ref([])
const editId = ref(null)
const fileInput = ref(null)
const previewImages = ref([])
const togglingId = ref(null)

const dealMap = {
  '아파트':   ['매매','전세','월세'],
  '오피스텔': ['매매','전세','월세'],
  '상가':     ['매매','월세'],
  '기타':     ['매매','월세'],
}
const emptyForm = () => ({
  title: '', property_type: '아파트', price_type: '매매',
  price: '', area: '', rooms: '', address: '', description: '', is_active: true
})
const form = ref(emptyForm())
const availableDeals = computed(() => dealMap[form.value.property_type] || ['매매'])
const isUploading = computed(() => previewImages.value.some(i => i.uploading))

function dealClass(type) {
  return { '매매': 'badge-sell', '전세': 'badge-jeonse', '월세': 'badge-monthly' }[type] || ''
}
function formatPrice(price) {
  if (!price) return '-'
  const eok = Math.floor(price / 100000000)
  const man = Math.floor((price % 100000000) / 10000)
  let str = ''
  if (eok > 0) str += eok + '억 '
  if (man > 0) str += man.toLocaleString() + '만'
  return str + '원'
}
function formatDate(dt) {
  return new Date(dt).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}
async function toggleActive(p) {
  togglingId.value = p.id
  try {
    await store.update(p.id, { ...p, is_active: !p.is_active }, auth.token)
    await store.fetchAllAdmin(auth.token)
  } catch (e) {
    alert('상태 변경 중 오류가 발생했습니다.')
  } finally {
    togglingId.value = null
  }
}
function triggerUpload() { fileInput.value.click() }
function onFileChange(e) { handleFiles(e.target.files) }
function onDrop(e) { handleFiles(e.dataTransfer.files) }
function handleFiles(files) {
  Array.from(files).forEach(file => {
    const url = URL.createObjectURL(file)
    previewImages.value.push({ url, file, uploading: false, uploaded: false, dbId: null })
  })
}
async function removeImage(i, img) {
  if (img.dbId) {
    try {
      await axios.delete("https://budongsan-site.onrender.com/api/images/" + img.dbId, {
        headers: { Authorization: "Bearer " + auth.token }
      })
    } catch (e) { console.error(e) }
  }
  previewImages.value.splice(i, 1)
}
async function uploadImages(propertyId) {
  const pending = previewImages.value.filter(i => !i.uploaded && i.file)
  if (pending.length === 0) return
  const formData = new FormData()
  pending.forEach(img => formData.append('images', img.file))
  pending.forEach(img => { img.uploading = true })
  try {
    const res = await axios.post("https://budongsan-site.onrender.com/api/images/" + propertyId, formData, {
      headers: { Authorization: "Bearer " + auth.token, 'Content-Type': 'multipart/form-data' }
    })
    pending.forEach((img, i) => {
      img.uploading = false
      img.uploaded = true
      img.dbId = res.data[i]?.id
    })
  } catch (e) {
    pending.forEach(img => { img.uploading = false })
    throw e
  }
}
function openAdd() {
  form.value = emptyForm()
  editId.value = null
  previewImages.value = []
  tab.value = 'add'
}
async function openEdit(p) {
  form.value = { ...p }
  editId.value = p.id
  tab.value = 'edit'
  try {
    const res = await axios.get("https://budongsan-site.onrender.com/api/images/" + p.id)
    previewImages.value = res.data.map(img => ({
      url: img.url, file: null, uploading: false, uploaded: true, dbId: img.id
    }))
  } catch (e) { previewImages.value = [] }
}
async function saveProperty() {
  if (!form.value.title || !form.value.address || !form.value.price) {
    return alert('매물명, 주소, 가격은 필수입니다.')
  }
  saving.value = true
  try {
    let propertyId = editId.value
    if (tab.value === 'add') {
      const created = await store.create(form.value, auth.token)
      propertyId = created.id
    } else {
      await store.update(editId.value, form.value, auth.token)
    }
    await uploadImages(propertyId)
    await store.fetchAllAdmin(auth.token)
    tab.value = 'list'
  } catch (e) {
    alert('저장 중 오류가 발생했습니다.')
  } finally {
    saving.value = false
  }
}
async function deleteProperty(id) {
  if (!confirm('이 매물을 삭제하시겠습니까?')) return
  try {
    await store.remove(id, auth.token)
  } catch (e) { alert('삭제 중 오류가 발생했습니다.') }
}
async function loadInquiries() {
  const res = await axios.get('https://budongsan-site.onrender.com/api/inquiries', {
    headers: { Authorization: "Bearer " + auth.token }
  })
  inquiries.value = res.data
}
function searchAddress() {
  new daum.Postcode({
    oncomplete: (data) => {
      form.value.address = data.roadAddress || data.jibunAddress
    }
  }).open()
}

function doLogout() {
  auth.logout()
  router.push('/')
}
onMounted(async () => {
  await store.fetchAllAdmin(auth.token)
  await loadInquiries()
})
</script>

<style scoped>
.admin-wrap { display: flex; min-height: calc(100vh - 60px); }
.sidebar { width: 220px; background: var(--navy); padding: 32px 20px; display: flex; flex-direction: column; flex-shrink: 0; }
.sidebar-logo { font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 4px; }
.sidebar-sub { font-size: 11px; color: rgba(255,255,255,0.4); margin-bottom: 32px; }
.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.nav-item { padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.6); cursor: pointer; transition: all 0.15s; }
.nav-item:hover { background: rgba(255,255,255,0.08); color: #fff; }
.nav-item.active { background: rgba(255,255,255,0.12); color: #fff; font-weight: 700; }
.logout-btn { background: rgba(255,255,255,0.08); border: none; border-radius: 8px; padding: 10px; color: rgba(255,255,255,0.5); font-family: Pretendard, sans-serif; font-size: 12px; cursor: pointer; margin-top: 16px; }
.logout-btn:hover { background: rgba(255,255,255,0.14); color: #fff; }
.main-content { flex: 1; padding: 36px 40px; background: var(--bg); overflow-y: auto; }
.content-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.content-title { font-size: 20px; font-weight: 800; color: var(--navy); }
.add-btn { background: var(--blue); color: #fff; border: none; border-radius: 8px; padding: 9px 18px; font-family: Pretendard, sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; }
.add-btn:hover { background: #1e4bc4; }
.cancel-btn { background: none; border: 1.5px solid var(--border); border-radius: 8px; padding: 8px 16px; font-family: Pretendard, sans-serif; font-size: 13px; color: var(--muted); cursor: pointer; }
.cancel-btn:hover { border-color: var(--navy); color: var(--navy); }
.property-table, .inquiry-table { background: var(--white); border-radius: 12px; border: 1px solid var(--border); overflow: hidden; }
.table-header { display: grid; padding: 12px 20px; background: var(--bg); border-bottom: 1px solid var(--border); font-size: 11px; font-weight: 700; color: var(--muted); }
.property-table .table-header { grid-template-columns: 90px 1fr 80px 120px 90px 120px; gap: 12px; }
.inquiry-table .table-header { grid-template-columns: 180px 80px 120px 1fr 120px; gap: 12px; }
.table-row { display: grid; padding: 14px 20px; border-bottom: 1px solid var(--border); align-items: center; font-size: 13px; transition: background 0.15s; }
.property-table .table-row { grid-template-columns: 90px 1fr 80px 120px 90px 120px; gap: 12px; }
.inquiry-table .table-row { grid-template-columns: 180px 80px 120px 1fr 120px; gap: 12px; }
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: var(--bg); }
.badge { font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: 5px; }
.badge-type { background: rgba(27,45,79,0.1); color: var(--navy); }
.badge-sell { background: #e4f4e4; color: #1e7a1e; }
.badge-jeonse { background: #fff4e0; color: #a06000; }
.badge-monthly { background: #fde8e8; color: #a02020; }
.row-title { font-weight: 500; color: var(--navy); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.row-price { font-weight: 700; color: var(--text); font-size: 12px; }
.row-msg { color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 12px; }
.row-date { font-size: 11px; color: var(--muted); }
.toggle-status { font-family: Pretendard, sans-serif; font-size: 11px; font-weight: 600; padding: 5px 10px; border-radius: 20px; border: none; cursor: pointer; transition: all 0.2s; }
.toggle-status.on { background: #e4f4e4; color: #1e7a1e; }
.toggle-status.on:hover { background: #fde8e8; color: #a02020; }
.toggle-status.off { background: #f0f0f0; color: var(--muted); }
.toggle-status.off:hover { background: #e4f4e4; color: #1e7a1e; }
.toggle-status:disabled { opacity: 0.5; cursor: not-allowed; }
.row-actions { display: flex; gap: 6px; }
.edit-btn { background: var(--blue-light); color: var(--blue); border: none; border-radius: 6px; padding: 5px 12px; font-family: Pretendard, sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; }
.edit-btn:hover { background: #d4e4fb; }
.delete-btn { background: #fde8e8; color: #a02020; border: none; border-radius: 6px; padding: 5px 12px; font-family: Pretendard, sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; }
.delete-btn:hover { background: #f9c8c8; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: var(--white); border-radius: 12px; border: 1px solid var(--border); padding: 28px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full { grid-column: 1 / -1; }
.form-group label { font-size: 12px; font-weight: 700; color: var(--navy); }
.form-group input, .form-group select, .form-group textarea { font-family: Pretendard, sans-serif; font-size: 13px; border: 1.5px solid var(--border); border-radius: 8px; padding: 10px 14px; outline: none; background: var(--bg); color: var(--text); transition: border-color 0.2s; resize: none; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--blue); background: var(--white); }
.upload-area { border: 2px dashed var(--border); border-radius: 12px; padding: 36px; text-align: center; cursor: pointer; transition: all 0.2s; background: var(--bg); }
.upload-area:hover { border-color: var(--blue); background: var(--blue-light); }
.upload-icon { font-size: 32px; margin-bottom: 10px; }
.upload-text { font-size: 14px; font-weight: 600; color: var(--navy); margin-bottom: 4px; }
.upload-sub { font-size: 12px; color: var(--muted); }
.preview-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-top: 14px; }
.preview-item { position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; border: 1px solid var(--border); }
.preview-item img { width: 100%; height: 100%; object-fit: cover; }
.remove-img { position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.6); color: #fff; border: none; border-radius: 50%; width: 22px; height: 22px; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.uploading-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); color: #fff; font-size: 11px; font-weight: 600; display: flex; align-items: center; justify-content: center; }
.toggle-wrap { display: flex; align-items: center; gap: 10px; }
.toggle { position: relative; display: inline-block; width: 44px; height: 24px; }
.toggle input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: var(--border); border-radius: 24px; transition: 0.3s; }
.slider:before { position: absolute; content: ''; height: 18px; width: 18px; left: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: 0.3s; }
.toggle input:checked + .slider { background: var(--blue); }
.toggle input:checked + .slider:before { transform: translateX(20px); }
.toggle-label { font-size: 13px; font-weight: 600; color: var(--navy); }
.form-actions { margin-top: 20px; }
.save-btn { background: var(--navy); color: #fff; border: none; border-radius: 8px; padding: 13px 36px; font-family: Pretendard, sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; }
.save-btn:hover { background: #0f1f3d; }
.save-btn:disabled { background: var(--muted); cursor: not-allowed; }
.addr-wrap { display: flex; gap: 8px; }
.addr-wrap input { flex: 1; }
.addr-btn { background: var(--navy); color: #fff; border: none; border-radius: 8px; padding: 10px 16px; font-family: Pretendard, sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: background 0.2s; }
.addr-btn:hover { background: #0f1f3d; }
.empty { text-align: center; padding: 80px 0; color: var(--muted); font-size: 14px; }

/* 모바일 탭 */
.mobile-tabs { display: none; }

/* 반응형 */
@media (max-width: 768px) {
  .admin-wrap { flex-direction: column; }
  .sidebar { display: none; }
  .mobile-tabs {
    display: flex;
    background: var(--navy);
    padding: 0;
    overflow-x: auto;
  }
  .mobile-tab {
    flex: 1;
    padding: 14px 8px;
    text-align: center;
    font-size: 12px;
    font-weight: 500;
    color: rgba(255,255,255,0.6);
    cursor: pointer;
    white-space: nowrap;
    border-bottom: 2px solid transparent;
    transition: all 0.15s;
  }
  .mobile-tab:hover { color: #fff; }
  .mobile-tab.active { color: #fff; font-weight: 700; border-bottom-color: #fff; }
  .mobile-tab.logout { color: rgba(255,255,255,0.4); font-size: 11px; }

  .main-content { padding: 20px 16px; }
  .content-title { font-size: 16px; }

  .property-table, .inquiry-table { overflow-x: auto; }
  .property-table .table-header,
  .property-table .table-row { grid-template-columns: 70px 1fr 60px 80px; gap: 8px; }
  .property-table .table-header span:nth-child(5),
  .property-table .table-header span:nth-child(6),
  .property-table .table-row span:nth-child(5),
  .property-table .table-row span:nth-child(6) { display: none; }

  .inquiry-table .table-header,
  .inquiry-table .table-row { grid-template-columns: 1fr 60px 90px; gap: 8px; }
  .inquiry-table .table-header span:nth-child(4),
  .inquiry-table .table-header span:nth-child(5),
  .inquiry-table .table-row span:nth-child(4),
  .inquiry-table .table-row span:nth-child(5) { display: none; }

  .form-grid { grid-template-columns: 1fr; padding: 20px 16px; }
  .form-group.full { grid-column: 1; }
  .preview-grid { grid-template-columns: repeat(3, 1fr); }

  .save-btn { width: 100%; }
  .add-btn, .cancel-btn { font-size: 12px; padding: 8px 12px; }
}
</style>