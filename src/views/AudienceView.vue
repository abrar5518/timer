<template>
  <div class="audience-page noise">
    <!-- Top bar -->
    <header class="audience-header glass">
      <div class="audience-header-inner">
        <div class="logo-sm">
          <img v-if="branding?.logoUrl" :src="branding.logoUrl" class="brand-img" />
          <span v-else class="logo-dot"></span>
          <span class="logo-text">EventSync <span class="logo-ai">AI</span></span>
        </div>
        <div class="header-status">
          <span v-if="running" class="badge badge-live"><span class="live-dot"></span> LIVE</span>
          <span v-else class="badge badge-next">PAUSED</span>
        </div>
      </div>
    </header>

    <!-- Main -->
    <main class="audience-main">
      <div class="container container-audience">
        <!-- NEW: Active Poll Section -->
        <transition name="fade">
          <div v-if="activePoll && (activePoll.active || votedPolls.has(activePoll.id))" class="poll-notice glass mb-3" :class="{ 'poll-closed': !activePoll.active }">
            <div class="poll-card-inner">
              <div class="poll-header-wide">
                <div class="badge" :class="activePoll.active ? 'badge-primary' : 'badge-done'">
                  {{ activePoll.active ? 'LIVE POLL' : 'POLL CLOSED' }}
                </div>
                <div v-if="activePoll.active && pollTimeLeft > 0" class="poll-countdown">
                  ⏱ <b>{{ pollTimeLeft }}s</b>
                </div>
              </div>
              <h3>{{ activePoll.question }}</h3>
              
              <!-- Voting State -->
              <div v-if="activePoll.active && !votedPolls.has(activePoll.id)" class="poll-options-grid">
                <button v-for="(opt, i) in activePoll.options" :key="i" @click="submitVote(i)" class="btn btn-outline btn-full">
                  {{ opt.text }}
                </button>
              </div>

              <!-- Results State (After Vote or After Close) -->
              <div v-else class="poll-results-view" v-auto-animate>
                <div v-for="(opt, i) in sortedOptions" :key="i" class="result-row" :class="{ 'is-winner': !activePoll.active && i === 0 && opt.votes > 0 }">
                  <div class="result-label">
                    <span>{{ opt.text }}</span>
                    <span>{{ Math.round((opt.votes / (activePoll.totalVotes || 1)) * 100) }}%</span>
                  </div>
                  <div class="result-bar-bg">
                    <div class="result-bar-fill" :style="{ width: (opt.votes / (activePoll.totalVotes || 1)) * 100 + '%' }"></div>
                  </div>
                  <div v-if="!activePoll.active && i === 0 && opt.votes > 0" class="winner-badge">⭐ WINNER</div>
                </div>
              </div>
            </div>
          </div>
        </transition>

        <!-- Top: Hero Timer -->
        <div class="audience-hero-timer card">
          <div class="timer-context">
            <span v-if="currentItem" class="current-label">{{ currentItem.title }}</span>
            <span v-else class="current-label">Event Concluded</span>
          </div>
          <div class="big-time-display" :class="{ running: running }">
            {{ formattedTime }}
          </div>
          <div class="timer-progress-bar">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
        </div>

        <div class="audience-grid" :class="{ 'mobile-hidden': activeTab !== 'live' }">
          <!-- LEFT: Agenda (Mobile: Tab 'agenda') -->
          <section class="agenda-section" :class="{ 'mobile-show': activeTab === 'agenda' }">
            <h3 class="section-title">LIVE AGENDA</h3>
            <div class="agenda-list-audience">
              <div 
                v-for="(item, i) in agenda" 
                :key="i"
                class="agenda-row"
                :class="{ 
                  active: item.status === 'active', 
                  done: item.status === 'done',
                  next: i === currentIndex + 1
                }"
              >
                <div class="row-time">{{ formatDuration(item.durationSecs) }}</div>
                <div class="row-content">
                  <div class="row-title">{{ item.title }}</div>
                  <div class="row-status">
                    <span v-if="item.status === 'active'" class="status-txt">Now Speaking</span>
                    <span v-else-if="item.status === 'done'" class="status-txt">Completed</span>
                    <span v-else-if="i === currentIndex + 1" class="status-txt">Up Next</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- RIGHT: Q&A (Mobile: Tab 'qa') -->
          <section class="qa-section" :class="{ 'mobile-show': activeTab === 'qa' }">
            <div class="qa-header">
              <h3 class="section-title">ASK A QUESTION</h3>
              <div class="ai-badge badge badge-info">AI Assisted</div>
            </div>
            
            <div class="qa-input-wrapper card">
              <textarea 
                v-model="newQuestion" 
                class="input qa-textarea" 
                placeholder="Ask anything..."
                @keyup.enter.ctrl="submitQuestion"
              ></textarea>
              <div class="qa-controls">
                <span class="ctrl-hint hidden-mobile">Press Ctrl + Enter to send</span>
                <button 
                  class="btn btn-primary btn-sm" 
                  @click="submitQuestion"
                  :disabled="!newQuestion.trim() || submitting"
                >
                  {{ submitting ? 'Sending...' : 'Send' }}
                </button>
              </div>
            </div>

            <div class="qa-feed mt-3" v-auto-animate>
              <div v-for="q in myQuestions" :key="q.id" class="qa-item my-q">
                <div class="q-bubble">{{ q.question }}</div>
                <div v-if="q.answer" class="ai-reply glass">
                  <div class="ai-reply-header">
                    <span class="ai-icon">🤖</span>
                    <span class="ai-name">AI ASSISTANT</span>
                  </div>
                  <p>{{ q.answer }}</p>
                </div>
              </div>
              
              <div v-for="q in publicQuestions" :key="q.id" class="qa-item public-q">
                <div class="q-header">
                  <span class="q-author">{{ q.name }}</span>
                  <span class="q-time">{{ formatTime(q.timestamp) }}</span>
                </div>
                <div class="q-text">{{ q.question }}</div>
                <div class="q-actions">
                  <button class="upvote-btn" @click="upvote(q.id)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                    {{ q.votes }}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Mobile Sticky Nav -->
        <nav class="mobile-sticky-nav glass only-mobile">
          <button @click="activeTab = 'live'" :class="{ active: activeTab === 'live' }" class="m-nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
            <span>Live</span>
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
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { io } from 'socket.io-client'

const route = useRoute()
const code = route.params.code?.toUpperCase()

const socket = io()
const agenda = ref([])
const currentIndex = ref(0)
const running = ref(false)
const newQuestion = ref('')
const submitting = ref(false)
const myQuestions = ref([])
const publicQuestions = ref([])
const activeTab = ref('live') // 'live' | 'agenda' | 'qa'
let wakeLock = null

const activePoll = ref(null)
const votedPolls = ref(new Set())
const pollTimeLeft = ref(0)
let pollInterval = null
const branding = ref(null)

const currentItem = computed(() => agenda.value[currentIndex.value] || null)
const remainingSecs = computed(() => currentItem.value?.remainingSecs ?? 0)
const progressPercent = computed(() => {
  if (!currentItem.value) return 100
  return (remainingSecs.value / currentItem.value.durationSecs) * 100
})

const sortedOptions = computed(() => {
  if (!activePoll.value) return []
  return [...activePoll.value.options].sort((a,b) => b.votes - a.votes)
})

const formattedTime = computed(() => {
  const s = remainingSecs.value
  const m = Math.floor(s / 60)
  const ss = s % 60
  return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
})

function formatDuration(s) {
  const m = Math.floor(s / 60)
  return `${m}m`
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function submitQuestion() {
  if (!newQuestion.value.trim() || submitting.value) return
  submitting.value = true
  socket.emit('qa:submit', { 
    code, 
    question: newQuestion.value.trim(),
    name: 'Me' 
  })
  newQuestion.value = ''
  setTimeout(() => { submitting.value = false }, 500)
}

function upvote(questionId) {
  socket.emit('qa:upvote', { code, questionId })
}

onMounted(() => {
  socket.emit('room:join', { code, role: 'audience' })
  
  socket.on('timer:tick', (data) => {
    agenda.value = data.agenda
    currentIndex.value = data.currentIndex
    running.value = data.running
    branding.value = data.branding
    if (data.branding?.primaryColor) {
      document.documentElement.style.setProperty('--c-primary', data.branding.primaryColor)
    }
  })

  socket.on('qa:reply', (data) => {
    myQuestions.value.unshift(data)
  })

  socket.on('qa:new', (data) => {
    // Update public list
    publicQuestions.value.unshift(data)
  })

  socket.on('poll:new', (poll) => {
    activePoll.value = poll
    startPollCountdown(poll)
  })
  socket.on('poll:update', (poll) => {
    activePoll.value = poll
    if (!poll.active) clearInterval(pollInterval)
  })

  socket.on('error', (data) => {
    alert(data.msg)
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

function submitVote(optionIndex) {
  if (!activePoll.value || votedPolls.value.has(activePoll.value.id)) return
  socket.emit('poll:vote', { code, pollId: activePoll.value.id, optionIndex })
  votedPolls.value.add(activePoll.value.id)
}

function startPollCountdown(poll) {
  clearInterval(pollInterval)
  if (!poll.expiresAt) return
  
  const update = () => {
    const diff = Math.max(0, Math.floor((poll.expiresAt - Date.now()) / 1000))
    pollTimeLeft.value = diff
    if (diff <= 0) clearInterval(pollInterval)
  }
  update()
  pollInterval = setInterval(update, 1000)
}

onUnmounted(() => { socket.disconnect() })
</script>

<style scoped>
.audience-page { min-height: 100vh; padding-bottom: 60px; }

.audience-header { border-bottom: 1px solid var(--c-border); position: sticky; top: 0; z-index: 50; }
.audience-header-inner { max-width: 1200px; margin: 0 auto; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; }
.logo-sm { font-size: 1rem; font-weight: 800; display: flex; align-items: center; gap: 8px; }
.logo-dot { width: 8px; height: 8px; background: var(--c-primary); border-radius: 50%; box-shadow: 0 0 8px var(--c-primary); animation: pulse 2s ease infinite; }
.logo-ai { color: var(--c-primary-lit); }

.audience-main { padding: 24px 0; }
.container-audience { max-width: 1000px; }

/* Hero Timer */
.audience-hero-timer { 
  padding: 40px; 
  text-align: center; 
  margin-bottom: 24px; 
  background: linear-gradient(135deg, rgba(138,21,56,0.08) 0%, rgba(10,10,15,0.4) 100%);
}

.poll-notice { padding: 32px; border: 1px solid var(--c-primary-lit); border-radius: 20px; background: rgba(138,21,56,0.05); transition: all 0.5s; }
.poll-closed { background: rgba(255,255,255,0.02); border-color: var(--c-border); }
.poll-header-wide { display: flex; justify-content: space-between; align-items: center; }
.poll-countdown { font-family: var(--font-mono); font-size: 0.9rem; color: var(--c-primary-lit); }
.poll-notice h3 { margin: 16px 0 24px; font-size: 1.4rem; font-weight: 700; }
.poll-options-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
.btn-full { width: 100%; border-radius: 12px; padding: 14px; font-weight: 600; }

.poll-results-view { display: flex; flex-direction: column; gap: 16px; }
.result-row { position: relative; }
.result-label { display: flex; justify-content: space-between; font-size: 0.9rem; font-weight: 700; margin-bottom: 8px; }
.result-bar-bg { height: 10px; background: rgba(255,255,255,0.05); border-radius: 5px; overflow: hidden; }
.result-bar-fill { height: 100%; background: var(--c-primary); box-shadow: 0 0 10px var(--c-primary-glo); transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); }
.is-winner .result-bar-fill { background: var(--c-gold); box-shadow: 0 0 15px var(--c-gold); }
.winner-badge { position: absolute; top: -20px; right: 0; font-size: 0.7rem; font-weight: 800; color: var(--c-gold); animation: bounce 2s infinite; }

@keyframes bounce { 0%, 20%, 50%, 80%, 100% {transform: translateY(0);} 40% {transform: translateY(-5px);} 60% {transform: translateY(-3px);} }

.timer-context { margin-bottom: 12px; }
.brand-img { height: 24px; max-width: 80px; object-fit: contain; }
.current-label { font-size: 1.1rem; font-weight: 700; letter-spacing: -0.01em; }

.big-time-display {
  font-size: clamp(3rem, 15vw, 6rem);
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.05em;
  line-height: 1;
  color: var(--c-text-muted);
  transition: color 0.5s;
}

/* Polls */
.poll-overlay { margin-bottom: 24px; animation: slideDown 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28); }
.poll-card { padding: 24px; border: 1px solid var(--c-primary); background: rgba(138,21,56,0.05); border-radius: 16px; }
.poll-card h3 { margin: 16px 0 20px; font-size: 1.2rem; }
.poll-options { display: flex; flex-direction: column; gap: 10px; }
.poll-voted { padding: 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); }
.poll-voted h4 { margin-top: 0; font-size: 1rem; color: var(--c-text-muted); }

.poll-results-mini { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
.mini-result { display: flex; align-items: center; gap: 12px; }
.mini-bar-bg { flex: 1; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; }
.mini-bar-fill { height: 100%; background: var(--c-primary); transition: width 0.5s; }
.mini-text { font-size: 0.8rem; font-weight: 600; width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

@keyframes slideDown { from { transform: translateY(-30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.mb-3 { margin-bottom: 24px; }
.big-time-display.running { 
  color: var(--c-text);
  text-shadow: 0 0 30px rgba(255,255,255,0.05);
}

.timer-progress-bar {
  height: 4px;
  background: var(--c-border);
  border-radius: 2px;
  margin-top: 32px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--c-primary);
  box-shadow: 0 0 10px var(--c-primary-glo);
  transition: width 1s linear;
}

/* Grid */
.audience-grid { display: grid; grid-template-columns: 320px 1fr; gap: 32px; }
@media (max-width: 850px) { .audience-grid { grid-template-columns: 1fr; } }

.section-title { font-size: 0.75rem; letter-spacing: 0.12em; color: var(--c-text-faint); margin-bottom: 16px; font-weight: 800; }

/* Agenda List */
.agenda-list-audience { display: flex; flex-direction: column; gap: 8px; }
.agenda-row {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: var(--r-md);
  border: 1px solid var(--c-border);
  background: var(--c-bg-2);
  transition: all 0.3s;
}
.agenda-row.active {
  border-color: var(--c-primary-lit);
  background: rgba(138,21,56,0.05);
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}
.agenda-row.done { opacity: 0.35; filter: grayscale(1); }
.agenda-row.next { border-style: dashed; }

.row-time { font-family: var(--font-mono); font-size: 0.75rem; color: var(--c-text-muted); padding-top: 2px; min-width: 40px; }
.row-content { flex: 1; }
.row-title { font-size: 0.9rem; font-weight: 600; margin-bottom: 2px; }
.status-txt { font-size: 0.65rem; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em; color: var(--c-text-faint); }
.active .status-txt { color: var(--c-primary-lit); }

/* Q&A */
.qa-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.qa-input-wrapper { padding: 20px; border-color: var(--c-border-hov); }
.qa-textarea { height: 100px; margin-bottom: 12px; }
.qa-controls { display: flex; align-items: center; justify-content: space-between; }
.ctrl-hint { font-size: 0.75rem; color: var(--c-text-faint); }

.qa-feed { display: flex; flex-direction: column; gap: 16px; }
.qa-item { display: flex; flex-direction: column; gap: 8px; }

.q-bubble { 
  align-self: flex-end; 
  background: var(--c-primary); 
  color: #fff; 
  padding: 12px 18px; 
  border-radius: 18px 18px 2px 18px; 
  font-size: 0.9rem;
  max-width: 85%;
}

.ai-reply {
  align-self: flex-start;
  padding: 16px;
  border-radius: 2px 18px 18px 18px;
  max-width: 90%;
  border-color: rgba(15, 184, 201, 0.3);
  background: rgba(15, 184, 201, 0.04);
}
.ai-reply-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.ai-icon { font-size: 1.1rem; }
.ai-name { font-size: 0.7rem; font-weight: 800; color: var(--c-teal); letter-spacing: 0.05em; }
.ai-reply p { font-size: 0.88rem; color: var(--c-text); line-height: 1.6; }

.public-q { 
  background: var(--c-bg-card); 
  border: 1px solid var(--c-border); 
  padding: 16px; 
  border-radius: var(--r-lg);
}
.q-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
.q-author { font-size: 0.8rem; font-weight: 700; color: var(--c-text-muted); }
.q-time { font-size: 0.72rem; color: var(--c-text-faint); }
.q-text { font-size: 0.9rem; line-height: 1.5; }
.q-actions { margin-top: 10px; }
.upvote-btn {
  background: transparent;
  border: 1px solid var(--c-border);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  color: var(--c-text-muted);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}
.upvote-btn:hover { border-color: var(--c-border-hov); background: var(--c-bg-card-hov); color: var(--c-text); }

/* Mobile Overrides */
.only-mobile { display: none; }
.hidden-mobile { display: block; }

@media (max-width: 750px) {
  .only-mobile { display: flex; }
  .hidden-mobile { display: none; }
  .logo-text { display: none; }
  
  .audience-main { padding: 12px 12px 80px; }
  .audience-hero-timer { padding: 24px; border-radius: 16px; margin-bottom: 12px; }
  .big-time-display { font-size: 4rem; }
  
  .mobile-hidden { display: none; }
  .audience-grid.mobile-hidden { display: block; }
  .agenda-section, .qa-section { display: none; }
  .agenda-section.mobile-show, .qa-section.mobile-show { display: block; animation: fadeIn 0.3s ease; }

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
}

@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Transitions */
.list-enter-active, .list-leave-active { transition: all 0.4s ease; }
.list-enter-from { opacity: 0; transform: translateY(-20px); }
.list-leave-to { opacity: 0; transform: scale(0.9); }
</style>
