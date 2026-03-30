<template>
  <div class="report-page noise">
    <div v-if="loading" class="loading-state">
      <div class="loader"></div>
      <p>Analyzing event data...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <h3>Error Loading Report</h3>
      <p>{{ error }}</p>
      <router-link to="/admin" class="btn btn-primary mt-3">Back to Admin</router-link>
    </div>

    <div v-else class="report-container fade-up">
      <!-- Header -->
      <header class="report-header">
        <div class="header-left">
          <div class="logo-sm mb-2">
            <span class="logo-dot"></span>
            EventSync <span class="logo-ai">AI</span>
          </div>
          <h1 class="report-title">Post-Event <span class="gradient-text">Performance Report</span></h1>
          <p class="report-meta">Room Code: <b>{{ report.meta.code }}</b> | Created: {{ formatDate(report.meta.createdAt) }}</p>
        </div>
        <div class="header-right">
          <button @click="window.print()" class="btn btn-ghost btn-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Export PDF
          </button>
        </div>
      </header>

      <!-- Stats Grid -->
      <section class="stats-grid mt-6">
        <div class="stat-card card glass">
          <div class="stat-icon">⏱️</div>
          <div class="stat-info">
            <div class="stat-label">Total Duration</div>
            <div class="stat-value">{{ formatTime(report.timing.totalActualSecs) }}</div>
          </div>
        </div>
        <div class="stat-card card glass">
          <div class="stat-icon">🙋</div>
          <div class="stat-info">
            <div class="stat-label">Q&A Engagement</div>
            <div class="stat-value">{{ report.engagement.questions.total }} Questions</div>
          </div>
        </div>
        <div class="stat-card card glass">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <div class="stat-label">Sentiment Pulse</div>
            <div class="stat-value" :class="sentimentClass">{{ report.engagement.sentiment.label }}</div>
          </div>
        </div>
      </section>

      <!-- Timing Chart -->
      <section class="report-section mt-6">
        <h2 class="section-title">Timing Fidelity <small>(Planned vs Actual)</small></h2>
        <div class="card glass">
          <div class="performance-list">
            <div v-for="item in report.timing.performance" :key="item.title" class="performance-item">
              <div class="item-header">
                <span class="item-title">{{ item.title }}</span>
                <span class="item-status" :class="item.status">{{ item.status }}</span>
              </div>
              <div class="chart-bar-container">
                <!-- Planned -->
                <div class="chart-bar planned" :style="{ width: getWidth(item.plannedMins, maxMins) + '%' }">
                  <span class="bar-label">Planned: {{ item.plannedMins }}m</span>
                </div>
                <!-- Actual -->
                <div class="chart-bar actual" :style="{ width: getWidth(item.actualMins, maxMins) + '%' }">
                  <span class="bar-label">Actual: {{ item.actualMins }}m</span>
                </div>
              </div>
              <div class="item-accuracy" :class="{ 'text-danger': item.accuracy < 80 }">
                Accuracy: {{ item.accuracy }}%
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Engagement Section -->
      <div class="row mt-6">
        <div class="col">
          <section class="report-section">
            <h2 class="section-title">Top Poll Results</h2>
            <div class="card glass h-full">
              <div v-if="report.engagement.polls.length === 0" class="empty-state">No polls conducted.</div>
              <div v-else class="poll-summary-list">
                <div v-for="poll in report.engagement.polls" :key="poll.question" class="poll-summary-item">
                  <p class="poll-q">{{ poll.question }}</p>
                  <div class="poll-winner">
                    <span class="ribbon">🏆</span> Best Option: <b>{{ poll.winner }}</b> 
                    <small>({{ poll.totalVotes }} votes)</small>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div class="col">
          <section class="report-section">
            <h2 class="section-title">AI Intent Analysis</h2>
            <div class="card glass h-full">
              <div class="sentiment-box" :class="sentimentClass">
                <div class="sentiment-score">{{ report.engagement.sentiment.score }}%</div>
                <div class="sentiment-desc">Overall positivity and engagement score generated by the EventSync AI listener during the live stream.</div>
              </div>
              <div class="digest-highlights mt-3">
                <h4>Audience Curiosity Index</h4>
                <p>Average of <b>{{ report.engagement.questions.avgVotes }}</b> votes per question indicates high audience interest levels.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
      
      <footer class="report-footer mt-8">
        <p>© 2026 EventSync AI — Professional Event Intelligence Report</p>
        <router-link to="/admin" class="btn btn-ghost btn-sm">Return to Dashboard</router-link>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const code = route.params.code
const report = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const res = await fetch(`/api/rooms/${code}/report`)
    if (!res.ok) throw new Error('Report data not available for this room.')
    report.value = await res.json()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

const maxMins = computed(() => {
  if (!report.value) return 0
  return Math.max(...report.value.timing.performance.map(i => Math.max(i.plannedMins, i.actualMins)))
})

const sentimentClass = computed(() => {
  if (!report.value) return ''
  const s = report.value.engagement.sentiment.label.toLowerCase()
  if (s.includes('positive')) return 'sentiment-positive'
  if (s.includes('negative')) return 'sentiment-negative'
  return 'sentiment-neutral'
})

function getWidth(val, max) {
  if (max === 0) return 0
  return (val / max) * 100
}

function formatTime(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}m ${s}s`
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.report-page { min-height: 100vh; padding: 60px 24px; color: var(--c-text); }
.report-container { max-width: 1000px; margin: 0 auto; }

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1px solid var(--c-border);
  padding-bottom: 24px;
}
.report-title { font-size: 2.2rem; margin-bottom: 4px; }
.report-meta { color: var(--c-text-muted); font-size: 0.9rem; }

.section-title { font-size: 1.25rem; font-weight: 800; margin-bottom: 16px; color: var(--c-text-muted); }
.section-title small { font-weight: 500; opacity: 0.6; }

/* Stats Grid */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; }
.stat-card { display: flex; align-items: center; gap: 20px; padding: 24px; }
.stat-icon { font-size: 2rem; }
.stat-label { font-size: 0.82rem; color: var(--c-text-muted); font-weight: 600; text-transform: uppercase; }
.stat-value { font-size: 1.5rem; font-weight: 900; }

/* Performance Chart */
.performance-list { display: flex; flex-direction: column; gap: 32px; padding: 10px; }
.performance-item { display: flex; flex-direction: column; gap: 8px; }
.item-header { display: flex; justify-content: space-between; align-items: center; }
.item-title { font-weight: 700; font-size: 1.1rem; }
.item-status { font-size: 0.72rem; text-transform: uppercase; padding: 2px 8px; border-radius: 99px; }
.item-status.done { background: rgba(46, 204, 113, 0.2); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.4); }
.item-status.active { background: rgba(52, 152, 219, 0.2); color: #3498db; border: 1px solid rgba(52, 152, 219, 0.4); }

.chart-bar-container { display: flex; flex-direction: column; gap: 4px; background: rgba(255,255,255,0.02); padding: 8px; border-radius: 8px; position: relative; }
.chart-bar { height: 24px; border-radius: 4px; display: flex; align-items: center; padding: 0 10px; font-size: 0.7rem; font-weight: 700; transition: width 1s ease; overflow: hidden; white-space: nowrap; }
.chart-bar.planned { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); color: var(--c-text-muted); }
.chart-bar.actual { background: linear-gradient(90deg, var(--c-primary), var(--c-primary-lit)); box-shadow: 0 0 15px var(--c-primary-glo); color: #fff; }
.item-accuracy { font-size: 0.82rem; font-weight: 600; color: var(--c-teal); margin-top: 4px; align-self: flex-end; }

/* Polls */
.poll-summary-list { display: flex; flex-direction: column; gap: 20px; }
.poll-summary-item { border-left: 3px solid var(--c-primary); padding-left: 16px; }
.poll-q { font-weight: 700; margin-bottom: 8px; }
.poll-winner { font-size: 0.95rem; color: var(--c-text-muted); }

/* Sentiment */
.sentiment-box { text-align: center; padding: 32px; border-radius: 12px; background: rgba(255,255,255,0.03); }
.sentiment-score { font-size: 3.5rem; font-weight: 900; line-height: 1; margin-bottom: 12px; }
.sentiment-desc { font-size: 0.88rem; color: var(--c-text-muted); line-height: 1.6; }

.sentiment-positive .sentiment-score { color: #2ecc71; text-shadow: 0 0 20px rgba(46, 204, 113, 0.3); }
.sentiment-negative .sentiment-score { color: #e36a7c; text-shadow: 0 0 20px rgba(230, 57, 70, 0.3); }
.sentiment-neutral .sentiment-score { color: var(--c-gold); }

.report-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--c-border); padding-top: 32px; color: var(--c-text-faint); font-size: 0.85rem; }

@media print {
  .report-page { padding: 0; background: #fff !important; color: #000 !important; }
  .noise::before { display: none; }
  .card { border: 1px solid #eee !important; box-shadow: none !important; color: #000 !important; }
  .report-footer button, .header-right { display: none; }
  .gradient-text { -webkit-text-fill-color: initial; background: none; color: #000; font-weight: 900; }
  .stat-card { border: 1px solid #eee !important; }
}

.loading-state, .error-state { min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.loader { width: 40px; height: 40px; border: 3px solid rgba(230, 57, 70, 0.1); border-top-color: var(--c-primary); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
