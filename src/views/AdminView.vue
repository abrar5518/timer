<template>
  <div class="admin-page noise">
    <div class="admin-container">
      <!-- Header -->
      <div class="admin-header">
        <router-link to="/" class="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </router-link>
        <div class="logo-sm">
          <span class="logo-dot"></span>
          EventSync <span class="logo-ai">AI</span>
        </div>
        <div class="header-actions">
          <router-link to="/profile" class="btn btn-ghost btn-sm">Profile</router-link>
          <button @click="logout" class="btn btn-ghost btn-sm">Log Out</button>
        </div>
      </div>

      <p class="admin-sub">Set up your agenda and optional FAQ. You'll get a shareable host + audience link house.</p>

      <!-- Magic Setup Card -->
      <section class="magic-setup-section mb-4 fade-up">
        <div class="card glass magic-card">
          <div class="magic-card-header">
            <span class="magic-sparkle">✨</span>
            <div class="magic-label-group">
              <h3 class="mb-0">Magic Event Draft</h3>
              <p class="text-muted text-sm mb-0">Tell the AI what you're hosting, it'll build the agenda for you.</p>
            </div>
          </div>
          <div class="magic-input-wrapper mt-3">
            <textarea 
              v-model="magicPrompt" 
              class="input magic-textarea" 
              placeholder="e.g., A 45-minute workshop with an intro, two 15-minute talks, and a Q&A session."
              @keyup.enter.ctrl="generateMagicDraft"
            ></textarea>
            <div class="magic-controls">
              <div class="magic-presets">
                <button type="button" @click="magicPrompt = 'Weekly 30min Team Sync'; generateMagicDraft()" class="btn-preset">📅 Team Sync</button>
                <button type="button" @click="magicPrompt = '1 hour Webinar with 3 speakers'; generateMagicDraft()" class="btn-preset">🎙️ Webinar</button>
                <button type="button" @click="magicPrompt = '2 hour Birthday Party with games'; generateMagicDraft()" class="btn-preset">🎂 Party</button>
              </div>
              <button 
                @click="generateMagicDraft" 
                class="btn btn-primary btn-magic"
                :disabled="!magicPrompt.trim() || drafting"
              >
                {{ drafting ? 'Drafting...' : 'Build Agenda' }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Form -->
      <div class="row mt-3">
        <!-- Left: Agenda -->
        <div class="col">
          <div class="card">
            <div class="flex-between">
              <h3 class="section-label">📋 Event Agenda</h3>
              <button class="btn btn-ghost btn-xs" @click="addItem">+ Add</button>
            </div>
            <p class="section-hint">Segments for your event.</p>

            <div class="agenda-items" v-auto-animate>
              <div v-for="(item, i) in agendaItems" :key="i" class="agenda-item">
                <div class="agenda-num">{{ i + 1 }}</div>
                <div class="agenda-fields">
                  <input
                    v-model="item.title"
                    class="input input-sm"
                    :placeholder="`Segment Title`"
                  />
                  <div class="duration-input">
                    <input
                      v-model.number="item.durationMins"
                      type="number"
                      class="input input-tiny"
                    />
                    <span class="duration-label">m</span>
                  </div>
                </div>
                <button
                  v-if="agendaItems.length > 1"
                  class="remove-btn"
                  @click="removeItem(i)"
                >✕</button>
              </div>
            </div>

            <div class="total-duration">
              <span>Total Duration: <b>{{ totalMins }} min</b></span>
            </div>
          </div>
        </div>

        <!-- Right: Settings -->
        <div class="col">
          <div class="card h-full">
            <h3 class="section-label">⚙️ Quick Settings</h3>
            <label for="event-name">Event Name</label>
            <input id="event-name" v-model="eventName" class="input input-sm mb-3" placeholder="e.g. Q2 All-Hands" />

            <div class="advanced-toggle mt-2" @click="showAdvanced = !showAdvanced">
              <span>{{ showAdvanced ? '▼' : '▶' }} Advanced (AI & Branding)</span>
            </div>

            <transition name="fade">
              <div v-if="showAdvanced" class="mt-3">
                <div class="divider"></div>
                
                <h3 class="section-label mt-2">🤖 AI Knowledge</h3>
                <textarea v-model="faqDoc" class="input input-sm" style="height: 100px" placeholder="Paste event info here..."></textarea>
                
                <div class="mt-2" v-if="userPlan !== 'Starter'">
                  <label class="switch-label">
                    <input type="checkbox" v-model="aiModeration" />
                    <span class="switch-text">AI Auto-Moderation</span>
                  </label>
                  
                  <h3 class="section-label mt-3">🎨 Branding</h3>
                  <div class="flex-between">
                    <input type="color" v-model="branding.primaryColor" class="input-color" />
                    <input v-model="branding.logoUrl" class="input input-sm ml-2" placeholder="Logo URL" />
                  </div>
                </div>
                <div v-else class="locked-feature-inline mt-2">
                  <span>Branding & Moderation (Pro)</span>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <!-- Create Button -->
      <div class="create-row mt-4">
        <button class="btn btn-primary btn-lg" @click="createRoom" :disabled="creating || !isValid">
          <span v-if="!creating">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Create Event Room
          </span>
          <span v-else>Creating…</span>
        </button>
        <p v-if="!isValid" class="error-text">Please add at least one agenda item with a title.</p>
      </div>

      <!-- Result -->
      <div v-if="roomCode" class="result-panel card card--glow mt-4">
        <div class="result-header">
          <div class="badge badge-live"><span class="live-dot"></span> Room Created</div>
          <div class="room-display">
            <div class="room-code">{{ roomCode }}</div>
            <div v-if="hostKey" class="host-badge">HOST KEY: <span>{{ hostKey }}</span></div>
          </div>
        </div>

        <div class="links-grid">
          <div class="link-block">
            <div class="link-role">🎤 Speaker / Host</div>
            <div class="link-url">{{ hostUrl }}</div>
            <div class="link-actions">
              <button class="btn btn-primary btn-sm" @click="goHost">Open Host View</button>
              <button class="btn btn-ghost btn-sm" @click="copy(hostUrl)">{{ copied === 'host' ? '✓ Copied' : 'Copy Link' }}</button>
            </div>
          </div>
          <div class="link-divider"></div>
          <div class="link-block">
            <div class="link-role">🎥 Broadcast Overlay (OBS/vMix)</div>
            <div class="link-url">{{ overlayUrl }}</div>
            <div class="link-actions">
              <button class="btn btn-ghost btn-sm" @click="copy(overlayUrl)">{{ copied === 'overlay' ? '✓ Copied' : 'Copy Link' }}</button>
            </div>
          </div>
        </div>

        <p class="result-hint">Share the audience link with your attendees. Open the host link to start controlling the timer.</p>
      </div>

      <!-- NEW: Event History Section -->
      <section class="history-section mt-8 fade-up">
        <h3 class="section-label mb-3">🕒 Pro Event History</h3>
        <div class="card glass">
          <div v-if="loadingHistory" class="loading-history">Loading history...</div>
          <div v-else-if="eventHistory.length === 0" class="empty-history">
            No previous events found. Create your first one above!
          </div>
          <div v-else class="history-table-wrapper">
            <table class="history-table">
              <thead>
                <tr>
                  <th>Room Code</th>
                  <th>Date</th>
                  <th>Participants</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="room in eventHistory" :key="room.code">
                  <td><span class="code-tag">{{ room.code }}</span></td>
                  <td>{{ formatDate(room.createdAt) }}</td>
                  <td>{{ room.participantCount || 0 }}</td>
                  <td class="table-actions">
                    <router-link :to="`/host/${room.code}`" class="btn btn-ghost btn-xs">Re-Open</router-link>
                    <router-link :to="`/report/${room.code}`" class="btn btn-primary btn-xs">Report</router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const creating = ref(false)
const roomCode = ref('')
const hostKey = ref('')
const copied = ref('')
const faqDoc = ref('')
const eventName = ref('')
const branding = ref({
  logoUrl: '',
  primaryColor: '#e63946'
})
const aiModeration = ref(false)
const magicPrompt = ref('')
const drafting = ref(false)
const showAdvanced = ref(false)

const eventHistory = ref([])
const loadingHistory = ref(true)

const user = JSON.parse(localStorage.getItem('user') || '{}')
const userPlan = user.plan || 'Starter'

onMounted(() => {
  fetchUserData()
})

async function fetchUserData() {
  const token = localStorage.getItem('token')
  if (!token) return
  
  try {
    const res = await fetch('/api/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    if (res.ok) {
      eventHistory.value = data.history || []
    }
  } catch (e) {
    console.error('History fetch failed', e)
  } finally {
    loadingHistory.value = false
  }
}

function formatDate(iso) {
  if (!iso) return 'N/A'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const agendaItems = ref([
  { title: '', durationMins: 5 },
  { title: '', durationMins: 10 },
])

const totalMins = computed(() => agendaItems.value.reduce((s, i) => s + (i.durationMins || 0), 0))
const isValid = computed(() => agendaItems.value.some(i => i.title.trim().length > 0))

const hostUrl = computed(() => {
  if (!roomCode.value) return ''
  return `${window.location.origin}/host/${roomCode.value}?key=${hostKey.value}`
})
const audienceUrl = computed(() => `${window.location.origin}/audience/${roomCode.value}`)
const overlayUrl = computed(() => `${window.location.origin}/overlay/${roomCode.value}`)

function addItem() {
  agendaItems.value.push({ title: '', durationMins: 5 })
}
function removeItem(i) {
  agendaItems.value.splice(i, 1)
}

async function createRoom() {
  creating.value = true
  const token = localStorage.getItem('token')
  
  if (!token) {
    alert('You must be logged in to create an event.')
    router.push('/login')
    return
  }

  try {
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        agenda: agendaItems.value.filter(i => i.title.trim()),
        faqDoc: faqDoc.value,
        branding: branding.value,
        aiModeration: aiModeration.value
      })
    })
    
    const data = await res.json().catch(() => ({}))
    
    if (!res.ok) {
      throw new Error(data.error || `Server Error: ${res.status} ${res.statusText}`)
    }
    
    roomCode.value = data.code
    hostKey.value = data.hostKey
  } catch (e) {
    alert(`Setup Failed: ${e.message}`)
  } finally {
    creating.value = false
  }
}

function goHost() {
  router.push(`/host/${roomCode.value}?key=${hostKey.value}`)
}

async function copy(url) {
  await navigator.clipboard.writeText(url)
  if (url.includes('/host/')) copied.value = 'host'
  else if (url.includes('/audience/')) copied.value = 'audience'
  else copied.value = 'overlay'
  setTimeout(() => copied.value = '', 2000)
}

async function generateMagicDraft() {
  if (!magicPrompt.value.trim() || drafting.value) return
  drafting.value = true
  try {
    const res = await fetch('/api/magic-setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: magicPrompt.value })
    })
    if (!res.ok) throw new Error('Magic failed')
    const draft = await res.json()
    
    eventName.value = draft.title
    agendaItems.value = draft.agenda
    faqDoc.value = draft.faqDoc
    magicPrompt.value = ''
  } catch (e) {
    alert('Magic setup failed. Please try a different prompt.')
  } finally {
    drafting.value = false
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
.admin-page { min-height: 100vh; padding: 0 0 80px; }
.admin-container { max-width: 980px; margin: 0 auto; padding: 0 24px; }

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 0;
  border-bottom: 1px solid var(--c-border);
  margin-bottom: 40px;
}
.back-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--c-text-muted);
  font-size: 0.88rem;
  font-weight: 500;
  transition: color 0.2s;
}
.back-link:hover { color: var(--c-text); }
.logo-sm { font-size: 1rem; font-weight: 800; display: flex; align-items: center; gap: 6px; }
.logo-dot { width: 8px; height: 8px; background: var(--c-primary); border-radius: 50%; box-shadow: 0 0 8px var(--c-primary); animation: pulse 2s ease infinite; }
.logo-ai { color: var(--c-primary-lit); }

.admin-title { margin-bottom: 8px; }
.admin-sub { font-size: 0.92rem; margin-bottom: 24px; }

/* Magic Card */
.magic-card { border: 1px solid var(--c-primary-lit); background: linear-gradient(135deg, rgba(138,21,56,0.08) 0%, rgba(0,0,0,0.2) 100%); padding: 24px; }
.magic-card-header { display: flex; align-items: center; gap: 16px; }
.magic-sparkle { font-size: 1.8rem; }
.magic-textarea { height: 70px; margin-bottom: 12px; border-color: rgba(138,21,56,0.2); }
.magic-input-wrapper { display: flex; flex-direction: column; }
.magic-controls { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.magic-presets { display: flex; gap: 8px; flex-wrap: wrap; }
.btn-preset { background: rgba(255,255,255,0.05); border: 1px solid var(--c-border); color: var(--c-text-muted); padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; cursor: pointer; transition: all 0.2s; }
.btn-preset:hover { background: var(--c-primary); color: #fff; border-color: var(--c-primary); }
.btn-magic { padding: 8px 20px; border-radius: 10px; font-weight: 700; box-shadow: 0 4px 15px var(--c-primary-glo); flex-shrink: 0; }
.text-xs { font-size: 0.75rem; }

/* Advanced Toggle */
.advanced-toggle { padding: 8px 12px; cursor: pointer; color: var(--c-text-muted); font-size: 0.8rem; background: rgba(255,255,255,0.03); border-radius: 6px; width: fit-content; margin-bottom: 8px; }
.advanced-toggle:hover { color: var(--c-text); background: rgba(255,255,255,0.06); }

.gradient-text { background: linear-gradient(135deg, #c0392b 0%, #8a1538 50%, #c0392b 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

.section-label { font-size: 0.95rem; margin-bottom: 6px; }
.section-hint { font-size: 0.82rem; color: var(--c-text-muted); margin-bottom: 20px; }

.agenda-items { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.agenda-item { display: flex; align-items: center; gap: 10px; }
.agenda-num {
  width: 26px; height: 26px;
  background: rgba(138,21,56,0.15);
  border: 1px solid rgba(138,21,56,0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--c-primary-lit);
  flex-shrink: 0;
}
.agenda-fields { flex: 1; display: flex; gap: 10px; }
.agenda-fields .input:first-child { flex: 1; }
.duration-input { display: flex; align-items: center; gap: 6px; }
.input-tiny { width: 70px; text-align: center; }
.duration-label { font-size: 0.8rem; color: var(--c-text-muted); }
.remove-btn {
  width: 28px; height: 28px;
  background: transparent;
  border: 1px solid var(--c-border);
  border-radius: 6px;
  color: var(--c-text-muted);
  cursor: pointer;
  font-size: 0.7rem;
  transition: all 0.2s;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.remove-btn:hover { background: rgba(192,57,43,0.15); border-color: rgba(192,57,43,0.4); color: #e36a7c; }

.total-duration { display: flex; justify-content: space-between; align-items: center; font-size: 0.88rem; color: var(--c-text-muted); }
.total-val { font-weight: 700; color: var(--c-text); }

.h-full { height: 100%; }

.create-row { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
.error-text { color: #e36a7c; font-size: 0.8rem; }

.result-panel { border-color: rgba(138,21,56,0.4); }
.result-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.room-code {
  font-size: clamp(1.2rem, 8vw, 2rem);
  font-weight: 900;
  letter-spacing: 0.2em;
  font-family: var(--font-mono);
  color: var(--c-primary-lit);
  text-shadow: 0 0 20px var(--c-primary-glo);
  line-height: 1;
}
.room-display { text-align: right; }
.host-badge { font-size: 0.7rem; font-weight: 700; color: var(--c-text-faint); margin-top: 4px; letter-spacing: 0.1em; }
.host-badge span { color: var(--c-primary-lit); font-family: var(--font-mono); }

.links-grid { display: grid; grid-template-columns: 1fr 1px 1fr; gap: 24px; margin-bottom: 20px; }
@media (max-width: 768px) {
  .links-grid { grid-template-columns: 1fr; }
  .link-divider { height: 1px; width: 100%; }
}
.link-divider { background: var(--c-border); }
.link-role { font-size: 0.88rem; font-weight: 600; margin-bottom: 8px; }
.link-url {
  font-size: 0.78rem;
  font-family: var(--font-mono);
  color: var(--c-text-muted);
  background: rgba(255,255,255,0.03);
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 12px;
  word-break: break-all;
}
.link-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.result-hint { font-size: 0.8rem; color: var(--c-text-faint); }

/* Branding */
.color-picker-wrapper { display: flex; align-items: center; gap: 12px; }
.input-color { width: 44px; height: 44px; padding: 2px; border: 1px solid var(--c-border); border-radius: 8px; background: transparent; cursor: pointer; }
.color-val { font-family: var(--font-mono); font-size: 0.85rem; color: var(--c-text-muted); }

.locked-feature {
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  padding: 32px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.lock-icon-bg {
  width: 50px; height: 50px;
  background: rgba(230, 57, 70, 0.1);
  color: var(--c-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}
.locked-feature h4 { margin-bottom: 8px; font-weight: 700; color: var(--c-text); }
.locked-feature p {
  color: var(--c-text-muted);
  font-size: 0.88rem;
  margin-bottom: 20px;
  max-width: 280px;
  margin-left: auto;
  margin-right: auto;
}

.locked-feature-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--c-text-faint);
  padding: 8px 12px;
  background: rgba(255,255,255,0.03);
  border-radius: 8px;
  width: fit-content;
}

.switch-text { color: var(--c-text); }

/* History Table */
.history-table-wrapper { margin: -16px; }
.history-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem; }
.history-table th, .history-table td { padding: 16px; border-bottom: 1px solid var(--c-border); }
.history-table th { color: var(--c-text-faint); font-weight: 600; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }
.history-table tr:last-child td { border-bottom: none; }
.code-tag { font-family: var(--font-mono); font-weight: 700; color: var(--c-primary-lit); background: rgba(138,21,56,0.1); padding: 2px 6px; border-radius: 4px; }
.table-actions { display: flex; gap: 8px; }
.btn-xs { padding: 4px 10px; font-size: 0.7rem; border-radius: 6px; height: auto; }
.loading-history, .empty-history { padding: 40px; text-align: center; color: var(--c-text-faint); font-style: italic; }
</style>
