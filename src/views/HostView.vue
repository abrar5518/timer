<template>
  <div class="host-page noise">
    <!-- Top bar -->
    <header class="host-header glass">
      <div class="host-header-inner">
        <div class="logo-sm">
          <img v-if="branding?.logoUrl" :src="branding.logoUrl" class="brand-img" />
          <span v-else class="logo-dot"></span>
          <span class="logo-text">EventSync <span class="logo-ai">AI</span></span>
        </div>
        <div class="header-meta hidden-mobile">
          <div v-if="sentiment" class="sentiment-indicator" :style="{ color: sentiment.color }">
            <span class="sentiment-label">AUDIENCE MOOD:</span>
            <span class="sentiment-val">{{ sentiment.label }} ({{ Math.round(displayedSentimentScore) }}%)</span>
          </div>
          <span class="room-badge">ROOM: <b>{{ code }}</b></span>
          <span class="participants">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            {{ participantCount }}
          </span>
          <button @click="logout" class="btn btn-ghost btn-sm">Log Out</button>
          <a :href="`/overlay/${code}`" target="_blank" class="btn btn-ghost btn-sm">Overlay View</a>
        </div>
        <!-- Mobile Header Meta -->
        <div class="header-meta-mobile only-mobile">
           <span class="room-badge"><b>{{ code }}</b></span>
           <span class="participants">{{ participantCount }}</span>
        </div>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Connecting to room <b>{{ code }}</b>…</p>
    </div>

    <!-- Main layout -->
    <div v-else class="host-layout">
      <!-- LEFT: Timer + Controls -->
      <main class="timer-panel" :class="{ 'mobile-show': activeTab === 'timer', 'mobile-hidden': activeTab !== 'timer' }">
        <div class="current-item-label" v-if="currentItem">
          <span class="item-index">{{ currentIndex + 1 }}/{{ agenda.length }}</span>
          <span class="item-title">{{ currentItem.title }}</span>
        </div>
        <div v-else class="item-title">Event Complete</div>

        <!-- Ring Timer -->
        <div class="ring-wrap" @click="toggleTimer">
          <svg class="ring-svg" viewBox="0 0 240 240">
            <circle cx="120" cy="120" r="108" fill="none" stroke="rgba(138,21,56,0.12)" stroke-width="10"/>
            <circle
              cx="120" cy="120" r="108"
              fill="none"
              stroke="url(#grad)"
              stroke-width="10"
              stroke-linecap="round"
              :stroke-dasharray="CIRCUMFERENCE"
              :stroke-dashoffset="dashOffset"
              transform="rotate(-90 120 120)"
              class="progress-ring"
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#c0392b"/>
                <stop offset="100%" stop-color="#8a1538"/>
              </linearGradient>
            </defs>
          </svg>
          <div class="ring-inner">
            <div class="big-time" :class="{ warning: remainingSecs < 60, critical: remainingSecs < 20 }">
              {{ formattedTime }}
            </div>
            <div class="time-status">{{ running ? 'Running' : (currentIndex >= agenda.length ? 'Finished' : 'Paused') }}</div>
          </div>
        </div>

        <!-- Controls -->
        <div class="controls">
          <button class="btn btn-ghost btn-lg-mobile" @click="reset" title="Reset">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
          </button>
          <button
            class="btn control-main btn-lg-mobile"
            :class="running ? 'btn-pause' : 'btn-start'"
            @click="toggleTimer"
            :disabled="currentIndex >= agenda.length"
          >
            <svg v-if="!running" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            <span class="hidden-mobile">{{ running ? 'Pause' : 'Start' }}</span>
          </button>
          <button class="btn btn-ghost btn-lg-mobile" @click="skip" title="Skip to next" :disabled="currentIndex >= agenda.length - 1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
          </button>
        </div>
      </main>

      <!-- CENTER: Agenda -->
      <aside class="agenda-panel" :class="{ 'mobile-show': activeTab === 'agenda', 'mobile-hidden': activeTab !== 'agenda' }">
        <div class="panel-header">
          <h3>Agenda</h3>
          <span class="badge badge-info">{{ agenda.length }} segments</span>
        </div>
        <div class="agenda-list" v-auto-animate>
          <div
            v-for="(item, i) in agenda"
            :key="i"
            class="agenda-row-host"
            :class="{
              active: item.status === 'active',
              done:   item.status === 'done',
              next:   i === currentIndex + 1
            }"
          >
            <div class="agenda-status-dot"></div>
            <div class="agenda-info">
              <div class="agenda-title">{{ item.title }}</div>
              <div class="agenda-dur">{{ formatSecs(item.durationSecs) }}</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- RIGHT: Q&A Digest -->
      <aside class="digest-panel" :class="{ 'mobile-show': activeTab === 'qa', 'mobile-hidden': activeTab !== 'qa' }">
        <div class="panel-header">
          <h3>🤖 AI Q&amp;A</h3>
          <div v-if="sentiment" class="only-mobile mini-mood" :style="{ color: sentiment.color }">{{ sentiment.label }}</div>
        </div>

        <div v-if="digest.length === 0" class="empty-digest">
          <div class="empty-icon">💬</div>
          <p>No questions yet.</p>
        </div>

        <div v-else class="digest-list" v-auto-animate>
          <div v-for="(d, i) in digest" :key="i" class="digest-card card" :class="{ 'digest-top': i === 0 }">
            <div class="digest-rank">#{{ i + 1 }}</div>
            <div class="digest-content">
              <span class="digest-q">"{{ d.mainQuestion || d.representative }}"</span>
              <div class="digest-meta">
                <span class="badge badge-info">{{ d.count }} similar</span>
                <span class="badge badge-live">{{ d.totalVotes || d.votes }} votes</span>
              </div>
            </div>
          </div>
        </div>

        <div class="divider"></div>
        <div class="panel-header">
          <h3>📊 POLLS</h3>
          <button @click="showPollCreator = true" class="btn btn-primary btn-xs">+ NEW</button>
        </div>

        <div v-if="activePoll" class="poll-active-host card">
          <div class="poll-header-row">
            <h4>{{ activePoll.question }}</h4>
            <div class="poll-timer-badge" v-if="activePoll.active && pollTimeLeft > 0">
              ⏱ {{ pollTimeLeft }}s
            </div>
            <span v-if="!activePoll.active" class="badge">CLOSED</span>
          </div>
          <div class="poll-results-list">
            <div v-for="(opt, i) in activePoll.options" :key="i" class="poll-result-item">
              <div class="poll-result-info">
                <span>{{ opt.text }}</span>
                <span>{{ Math.round((opt.votes / (activePoll.totalVotes || 1)) * 100) }}%</span>
              </div>
              <div class="poll-bar-bg"><div class="poll-bar-fill" :style="{ width: (opt.votes / (activePoll.totalVotes || 1)) * 100 + '%' }"></div></div>
            </div>
          </div>
        </div>

        <!-- NEW: Poll Creator Duration Input -->
        <div v-if="showPollCreator" class="poll-creator-modal">
          <div class="poll-creator-inner glass">
             <h4>Launch a Poll</h4>
             <div class="mt-3">
               <label class="label-xs">QUESTION</label>
               <input v-model="newPoll.question" class="input" placeholder="e.g. Is this helpful?" />
             </div>
             <div class="mt-3">
               <label class="label-xs">OPTIONS</label>
               <div v-for="(opt, i) in newPoll.options" :key="i" class="poll-opt-row">
                 <input v-model="newPoll.options[i]" class="input" :placeholder="'Option ' + (i+1)" />
                 <button v-if="newPoll.options.length > 2" @click="newPoll.options.splice(i,1)" class="btn-del">×</button>
               </div>
               <button @click="newPoll.options.push('')" class="btn btn-ghost btn-xs mt-1">+ Add Option</button>
             </div>
             <div class="mt-3">
               <label class="label-xs">DURATION (SECONDS)</label>
               <input type="number" v-model="newPoll.duration" class="input" />
             </div>
             <div class="poll-creator-footer">
               <button @click="showPollCreator = false" class="btn btn-ghost">Cancel</button>
               <button @click="createPoll" class="btn btn-primary" :disabled="!newPoll.question">Launch Live</button>
             </div>
          </div>
        </div>
      </aside>
    </div>

    <!-- Mobile Sticky Nav -->
    <nav class="mobile-sticky-nav glass only-mobile">
      <button @click="activeTab = 'timer'" :class="{ active: activeTab === 'timer' }" class="m-nav-item">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span>Timer</span>
      </button>
      <button @click="activeTab = 'agenda'" :class="{ active: activeTab === 'agenda' }" class="m-nav-item">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
        <span>Agenda</span>
      </button>
      <button @click="activeTab = 'qa'" :class="{ active: activeTab === 'qa' }" class="m-nav-item">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span>Q&A</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { io } from 'socket.io-client'
import gsap from 'gsap'

const route = useRoute()
const code = route.params.code?.toUpperCase()
const hostKey = route.query.key

const socket = io()
const loading = ref(true)
const branding = ref(null)
const agenda = ref([])
const currentIndex = ref(0)
const running = ref(false)
const participantCount = ref(1)
const digest = ref([])
const sentiment = ref(null)
const displayedSentimentScore = ref(0)
const activeTab = ref('timer') // 'timer' | 'agenda' | 'qa'
let wakeLock = null

const showPollCreator = ref(false)
const activePoll = ref(null)
const newPoll = ref({
  question: '',
  options: ['', ''],
  duration: 30 // default 30s
})

const pollTimeLeft = ref(0)
let pollInterval = null

const CIRCUMFERENCE = 2 * Math.PI * 108

const currentItem = computed(() => agenda.value[currentIndex.value] || null)
const remainingSecs = computed(() => currentItem.value?.remainingSecs ?? 0)
const dashOffset = computed(() => {
  if (!currentItem.value) return CIRCUMFERENCE
  const pct = remainingSecs.value / currentItem.value.durationSecs
  return CIRCUMFERENCE * (1 - pct)
})
const formattedTime = computed(() => {
  const s = remainingSecs.value
  const m = Math.floor(s / 60)
  const ss = s % 60
  return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
})

function formatSecs(s) {
  const m = Math.floor(s / 60)
  const ss = s % 60
  return ss > 0 ? `${m}m ${ss}s` : `${m}m`
}

function toggleTimer() {
  if (running.value) {
    socket.emit('timer:pause', { code, hostKey })
  } else {
    socket.emit('timer:start', { code, hostKey })
  }
}
function reset() { socket.emit('timer:reset', { code, hostKey }) }
function skip() { socket.emit('timer:skip', { code, hostKey }) }

onMounted(() => {
  if (!hostKey) {
    const manualKey = prompt('Please enter your Host Access Key:')
    if (!manualKey) return (window.location.href = '/')
    window.location.href = window.location.href + (window.location.href.includes('?') ? '&' : '?') + 'key=' + manualKey
    return
  }

  socket.emit('room:join', { code, role: 'host', hostKey })
  socket.on('timer:tick', (data) => {
    agenda.value = data.agenda
    currentIndex.value = data.currentIndex
    running.value = data.running
    branding.value = data.branding
    if (data.branding?.primaryColor) {
      document.documentElement.style.setProperty('--c-primary', data.branding.primaryColor)
    }
    loading.value = false
  })
  socket.on('room:participants', (data) => {
    participantCount.value = data.count
  })
  socket.on('qa:digest', (data) => {
    digest.value = data.digest
    sentiment.value = data.sentiment || null
  })

  watch(() => sentiment.value?.score, (newVal) => {
    if (newVal !== undefined) {
      gsap.to(displayedSentimentScore, {
        duration: 1,
        value: newVal,
        ease: "power2.out"
      })
    }
  }, { immediate: true })
  socket.on('poll:new', (poll) => {
    activePoll.value = poll
    showPollCreator.value = false
    startPollCountdown(poll)
  })
  socket.on('poll:update', (poll) => {
    activePoll.value = poll
    if (!poll.active) clearInterval(pollInterval)
  })
  socket.on('error', (data) => {
    alert(data.msg)
    loading.value = false
  })

  // Wake Lock
  if ('wakeLock' in navigator) {
    try {
      navigator.wakeLock.request('screen').then(lock => { wakeLock = lock })
    } catch (e) {
      console.warn('WakeLock failed:', e)
    }
  }
})

function createPoll() {
  const options = newPoll.value.options.filter(o => o.trim())
  if (options.length < 2) return alert('Need at least 2 options')
  socket.emit('poll:create', { 
    code, 
    hostKey, 
    question: newPoll.value.question, 
    options,
    duration: newPoll.value.duration 
  })
  newPoll.value = { question: '', options: ['', ''], duration: 30 }
}

function startPollCountdown(poll) {
  clearInterval(pollInterval)
  if (!poll.expiresAt) return
  
  const update = () => {
    const diff = Math.max(0, Math.floor((poll.expiresAt - Date.now()) / 1000))
    pollTimeLeft.ref = diff // wait, it's a ref
    pollTimeLeft.value = diff
    if (diff <= 0) clearInterval(pollInterval)
  }
  update()
  pollInterval = setInterval(update, 1000)
}
function closePoll() {
  if (activePoll.value) socket.emit('poll:close', { code, hostKey, pollId: activePoll.value.id })
}

onUnmounted(() => { socket.disconnect() })
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
.host-page { min-height: 100vh; display: flex; flex-direction: column; }

.host-header {
  border-bottom: 1px solid var(--c-border);
  position: sticky;
  top: 0;
  z-index: 50;
}
.host-header-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo-sm { font-size: 1rem; font-weight: 800; display: flex; align-items: center; gap: 8px; }
.logo-dot { width: 8px; height: 8px; background: var(--c-primary); border-radius: 50%; box-shadow: 0 0 8px var(--c-primary); animation: pulse 2s ease infinite; }
.logo-ai { color: var(--c-primary-lit); }
.ml-2 { margin-left: 8px; }
.header-meta { display: flex; align-items: center; gap: 24px; }
.sentiment-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  background: rgba(255,255,255,0.03);
  padding: 4px 12px;
  border-radius: 99px;
  border: 1px solid rgba(255,255,255,0.05);
  animation: fadeIn 0.5s ease;
  transition: color 0.5s ease;
}
.sentiment-label { color: var(--c-text-faint); }
.digest-sentiment { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; margin-left: 8px; }

@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

/* Polls Panel */
.polls-panel { margin-top: 24px; display: flex; flex-direction: column; }
.poll-active-host { background: rgba(138,21,56,0.1); border-radius: 12px; padding: 20px; border: 1px solid rgba(138,21,56,0.2); }
.poll-header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.poll-header-row h4 { margin: 0; font-size: 1.1rem; }

.poll-results-list { display: flex; flex-direction: column; gap: 16px; }
.poll-result-item { display: flex; flex-direction: column; gap: 6px; }
.poll-result-info { display: flex; justify-content: space-between; font-size: 0.9rem; font-weight: 600; }
.poll-bar-bg { height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; }
.poll-bar-fill { height: 100%; background: var(--c-primary); box-shadow: 0 0 10px var(--c-primary-glo); transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
.poll-footer { margin-top: 16px; font-size: 0.8rem; color: var(--c-text-muted); text-align: right; }

/* Modal */
.poll-creator-modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(10px);
}
.poll-creator-inner { width: 440px; background: var(--c-bg-card); padding: 32px; border-radius: 20px; border: 1px solid var(--c-border); }
.poll-opt-input { display: flex; gap: 10px; margin-bottom: 8px; }
.poll-creator-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
.btn-icon { background: none; border: none; color: var(--c-text-muted); cursor: pointer; font-size: 1.2rem; }
.btn-icon:hover { color: var(--c-primary-lit); }
.participants { display: flex; align-items: center; gap: 5px; font-size: 0.8rem; color: var(--c-text-muted); }

/* Poll styles */
.poll-active-host { margin-bottom: 24px; padding: 24px; border: 1px solid var(--c-primary-lit); background: rgba(138,21,56,0.05); }
.poll-header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.poll-results-list { display: flex; flex-direction: column; gap: 16px; }
.poll-result-info { display: flex; justify-content: space-between; font-size: 0.88rem; font-weight: 600; margin-bottom: 6px; }
.poll-bar-bg { height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; }
.poll-bar-fill { height: 100%; background: var(--c-primary); transition: width 0.5s; }
.poll-footer { font-size: 0.75rem; color: var(--c-text-faint); margin-top: 16px; text-align: right; }

.poll-creator-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 100; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); }
.poll-creator-inner { width: 440px; padding: 32px; border-radius: 20px; }
.label-xs { font-size: 0.65rem; font-weight: 800; color: var(--c-text-faint); display: block; margin-bottom: 6px; }
.poll-opt-row { display: flex; gap: 8px; margin-bottom: 8px; }
.btn-del { background: none; border: none; color: var(--c-text-faint); cursor: pointer; font-size: 1.2rem; }
.poll-creator-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }

/* Mobile Overrides */
.only-mobile { display: none; }
.hidden-mobile { display: block; }

@media (max-width: 750px) {
  .only-mobile { display: flex; }
  .hidden-mobile { display: none; }
  .logo-text { display: none; }
  
  .host-layout { padding: 12px 12px 80px; grid-template-columns: 1fr; }
  .timer-panel { padding: 24px; border-radius: 20px; gap: 32px; height: calc(100vh - 180px); justify-content: center; }
  .ring-wrap { width: 100%; max-width: 240px; height: 240px; cursor: pointer; }
  .big-time { font-size: 3.5rem; }
  
  .mobile-hidden { display: none; }
  .mobile-show { display: block; animation: fadeIn 0.3s ease; }
  
  .mobile-sticky-nav {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    height: 70px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    border-top: 1px solid var(--c-border);
    padding-bottom: env(safe-area-inset-bottom);
    z-index: 1000;
  }
  .m-nav-item {
    background: none; border: none;
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    color: var(--c-text-faint); font-weight: 700; font-size: 0.65rem;
    transition: color 0.3s;
  }
  .m-nav-item.active { color: var(--c-primary-lit); }
  .m-nav-item svg { transition: transform 0.3s; }
  .m-nav-item.active svg { transform: scale(1.1); }
  
  .btn-lg-mobile { padding: 18px !important; }
  .btn-lg-mobile svg { width: 28px; height: 28px; }
  
  .header-meta-mobile { display: flex; align-items: center; gap: 12px; }
  .mini-mood { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
}

@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.digest-top-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }

.brand-img { height: 24px; max-width: 80px; object-fit: contain; }

.loading-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; }
.spinner { width: 36px; height: 36px; border: 3px solid var(--c-border); border-top-color: var(--c-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.host-layout {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 280px 300px;
  gap: 0;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 24px;
  gap: 24px;
}
@media (max-width: 1100px) { .host-layout { grid-template-columns: 1fr 260px; } .digest-panel { display: none; } }
@media (max-width: 750px) { .host-layout { grid-template-columns: 1fr; } .agenda-panel { display: none; } }

/* Timer panel */
.timer-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 40px;
  background: var(--c-bg-card);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
}

.current-item-label { display: flex; align-items: center; gap: 10px; }
.item-index { font-size: 0.8rem; color: var(--c-text-muted); background: var(--c-bg-card); padding: 3px 8px; border-radius: 4px; font-family: var(--font-mono); }
.item-title { font-size: 1.1rem; font-weight: 700; }

.ring-wrap { position: relative; width: clamp(200px, 60vw, 280px); height: clamp(200px, 60vw, 280px); }
.ring-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.progress-ring { transition: stroke-dashoffset 0.9s linear; }
.ring-inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.big-time {
  font-size: clamp(2.5rem, 10vw, 4rem);
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.04em;
  line-height: 1;
  transition: color 0.3s;
}
.big-time.warning { color: var(--c-gold); }
.big-time.critical { color: #e36a7c; animation: blink 0.8s step-end infinite; }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
.time-status { font-size: 0.78rem; color: var(--c-text-muted); text-transform: uppercase; letter-spacing: 0.1em; }

.controls { display: flex; align-items: center; gap: 12px; }
.control-main { padding: 16px 36px; font-size: 1rem; font-weight: 700; gap: 10px; }
.btn-start { background: var(--c-primary); color: #fff; box-shadow: 0 4px 20px var(--c-primary-glo); }
.btn-start:hover { background: var(--c-primary-lit); }
.btn-pause { background: rgba(232,184,75,0.15); color: var(--c-gold); border: 1px solid rgba(232,184,75,0.3); }
.btn-pause:hover { background: rgba(232,184,75,0.25); }

/* Side panels */
.agenda-panel, .digest-panel {
  background: var(--c-bg-card);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  padding: 20px;
  overflow-y: auto;
  max-height: calc(100vh - 100px);
}
.panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.panel-header h3 { font-size: 0.92rem; }
.panel-hint { font-size: 0.78rem; margin-bottom: 14px; }

.agenda-list { display: flex; flex-direction: column; gap: 6px; }
.agenda-entry {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--r-md);
  border: 1px solid transparent;
  transition: all 0.3s;
}
.agenda-entry.active {
  background: rgba(138,21,56,0.1);
  border-color: rgba(138,21,56,0.3);
}
.agenda-entry.done { opacity: 0.4; }
.agenda-entry.next { background: rgba(232,184,75,0.06); border-color: rgba(232,184,75,0.2); }

.agenda-status-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--c-text-faint);
  flex-shrink: 0;
  transition: background 0.3s;
}
.active .agenda-status-dot { background: var(--c-primary); box-shadow: 0 0 8px var(--c-primary); animation: pulse 1.5s ease infinite; }
.done .agenda-status-dot { background: var(--c-green); }
.next .agenda-status-dot { background: var(--c-gold); }
.agenda-info { flex: 1; min-width: 0; }
.agenda-title { font-size: 0.85rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.agenda-dur { font-size: 0.72rem; color: var(--c-text-muted); margin-top: 2px; font-family: var(--font-mono); }

.empty-digest { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 32px 0; text-align: center; }
.empty-icon { font-size: 2.5rem; }
.empty-digest p { font-size: 0.8rem; max-width: 200px; }

.digest-list { display: flex; flex-direction: column; gap: 10px; }
.digest-card { padding: 14px; display: flex; gap: 12px; border-radius: var(--r-md); }
.digest-top { border-color: rgba(138,21,56,0.4); background: rgba(138,21,56,0.06); }
.digest-rank { font-size: 0.72rem; font-weight: 800; color: var(--c-primary-lit); font-family: var(--font-mono); padding-top: 2px; }
.digest-content { flex: 1; min-width: 0; }
.digest-q { font-size: 0.82rem; font-style: italic; color: var(--c-text); margin-bottom: 8px; line-height: 1.5; }
.digest-meta { display: flex; gap: 6px; flex-wrap: wrap; }
</style>
