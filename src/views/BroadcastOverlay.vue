<template>
  <div class="overlay-page">
    <div v-if="currentItem" class="overlay-container fade-in">
      <!-- Item Info -->
      <div class="overlay-info">
        <h2 class="overlay-title">{{ currentItem.title }}</h2>
        <div class="overlay-next" v-if="nextItem">
          <span class="next-label">UP NEXT:</span> {{ nextItem.title }}
        </div>
      </div>

      <!-- Large Timer -->
      <div class="overlay-timer" :class="{ running: running, warning: remainingSecs < 60, critical: remainingSecs < 20 }">
        {{ formattedTime }}
      </div>

      <!-- Progress Bar -->
      <div class="overlay-progress-bg">
        <div class="overlay-progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
    </div>
    
    <div v-else-if="loading" class="overlay-loading">
      Connecting to Live Stream...
    </div>
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
const loading = ref(true)
const branding = ref(null)

const currentItem = computed(() => agenda.value[currentIndex.value] || null)
const nextItem = computed(() => agenda.value[currentIndex.value + 1] || null)
const remainingSecs = computed(() => currentItem.value?.remainingSecs ?? 0)

const formattedTime = computed(() => {
  const s = remainingSecs.value
  const m = Math.floor(s / 60)
  const ss = s % 60
  return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
})

const progressPercent = computed(() => {
  if (!currentItem.value) return 100
  return (remainingSecs.value / currentItem.value.durationSecs) * 100
})

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
    loading.value = false
  })
})

onUnmounted(() => { socket.disconnect() })
</script>

<style>
/* Reset for overlay */
body, html { background: transparent !important; margin: 0; padding: 0; overflow: hidden; }
</style>

<style scoped>
.overlay-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: flex-end; /* Position at bottom for lower-third style */
  padding: 40px;
  color: #fff;
  font-family: 'Inter', system-ui, sans-serif;
  text-shadow: 0 4px 8px rgba(0,0,0,0.8);
}

.overlay-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(12px);
  padding: 24px 40px;
  border-left: 8px solid var(--c-primary, #e63946);
  border-radius: 4px 24px 24px 4px;
  animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.overlay-title {
  font-size: 2.2rem;
  font-weight: 900;
  margin: 0;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.overlay-next {
  font-size: 0.9rem;
  font-weight: 700;
  color: rgba(255,255,255,0.7);
  margin-top: 4px;
}
.next-label { color: var(--c-primary, #e63946); margin-right: 8px; }

.overlay-timer {
  font-size: 5rem;
  font-weight: 900;
  font-family: 'JetBrains Mono', monospace;
  line-height: 1;
  margin: 12px 0;
  font-variant-numeric: tabular-nums;
  transition: color 0.3s;
}

.overlay-timer.warning { color: #f1c40f; }
.overlay-timer.critical { color: #e63946; animation: pulse-red 1s infinite; }

.overlay-progress-bg {
  width: 100%;
  height: 8px;
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
  overflow: hidden;
}
.overlay-progress-fill {
  height: 100%;
  background: var(--c-primary, #e63946);
  box-shadow: 0 0 15px var(--c-primary, #e63946);
  transition: width 1s linear;
}

.overlay-loading {
  width: 100%;
  text-align: center;
  font-weight: 800;
  letter-spacing: 2px;
  opacity: 0.8;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-100px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes pulse-red {
  0% { text-shadow: 0 0 0px #e63946; }
  50% { text-shadow: 0 0 30px #e63946; }
  100% { text-shadow: 0 0 0px #e63946; }
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.fade-in { animation: fadeIn 0.5s ease; }
</style>
