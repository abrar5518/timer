<template>
  <div class="dashboard-page noise">
    
    <!-- Nav -->
    <nav class="nav glass fade-up">
      <div class="container nav-inner">
        <div class="logo">
          <span class="logo-dot"></span>
          EventSync AI
        </div>
        <div class="nav-links">
          <router-link to="/dashboard" class="nav-link active">Home</router-link>
          <router-link to="/profile" class="nav-link">Profile</router-link>
          <div class="admin-nav-actions">
          <router-link to="/profile" class="btn btn-ghost btn-sm">Profile</router-link>
          <button @click="logout" class="btn btn-ghost btn-sm ml-2">Log Out</button>
        </div>
        </div>
      </div>
    </nav>

    <div class="container dash-container fade-up delay-1">
      <div class="header-section">
        <div class="user-greeting">
          <h1>Welcome, {{ user?.name?.split(' ')[0] || 'Organizer' }}</h1>
          <p class="user-plan-info">
            Your current plan: <span class="badge" :class="planBadgeClass">{{ user?.plan || 'Starter' }}</span>
            <router-link v-if="user?.plan === 'Starter'" to="/#pricing" class="upgrade-link link-primary ml-1">Upgrade for more features</router-link>
          </p>
        </div>
        <div class="header-actions">
          <router-link to="/admin" class="btn btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            New Event
          </router-link>
        </div>
      </div>

      <div class="dashboard-grid mt-5">
        <div class="main-content">
          <div class="section-header">
            <h2>Your Events</h2>
            <span class="count-badge">{{ history.length }}</span>
          </div>
          
          <div v-if="loading" class="empty-state card mt-3">
            <p>Loading events...</p>
          </div>

          <div v-else-if="history.length === 0" class="empty-state card mt-3">
            <div class="icon">🎟️</div>
            <h3>No events yet</h3>
            <p>Create your first synchronized event to get started.</p>
          </div>

          <div v-else class="events-list mt-3">
            <div v-for="event in history" :key="event.code" class="card glass event-card">
              <div class="event-info">
                <div class="event-code-badge">{{ event.code }}</div>
                <div class="event-details">
                  <h3>Session on {{ new Date(event.date).toLocaleDateString() }}</h3>
                  <p>{{ event.participants }} participant{{ event.participants !== 1 ? 's' : '' }} joined</p>
                </div>
              </div>
              <div class="event-actions">
                <router-link :to="`/host/${event.code}`" class="btn btn-ghost btn-sm">Open Host Panel</router-link>
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar-content">
          <div class="card glass upgrade-card" v-if="user?.plan === 'Starter'">
            <div class="upgrade-icon">🚀</div>
            <h3>Unlock Pro Features</h3>
            <p>Get up to 50 connections, AI moderation, and custom branding.</p>
            <router-link to="/#pricing" class="btn btn-primary btn-full mt-2">View Pro Plans</router-link>
          </div>

          <div class="card glass feature-limits mt-3">
            <h3>Plan Limits</h3>
            <div class="limit-item">
              <div class="limit-label">Connections</div>
              <div class="limit-bar"><div class="limit-progress" :style="{ width: (history.length > 0 ? '60%' : '5%'), background: 'var(--c-primary)' }"></div></div>
              <div class="limit-value">{{ user?.plan === 'Starter' ? '3' : user?.plan === 'Pro' ? '50' : '500' }} max</div>
            </div>
            <div class="limit-item mt-2">
              <div class="limit-label">AI Moderation</div>
              <div class="limit-status" :class="user?.plan !== 'Starter' ? 'status-unlocked' : 'status-locked'">
                {{ user?.plan !== 'Starter' ? 'Unlocked' : 'Locked' }}
              </div>
            </div>
            <div class="limit-item mt-2">
              <div class="limit-label">Custom Branding</div>
              <div class="limit-status" :class="user?.plan === 'Premium' ? 'status-unlocked' : 'status-locked'">
                {{ user?.plan === 'Premium' ? 'Unlocked' : 'Locked' }}
              </div>
            </div>
          </div>

          <!-- NEW: Security Status Box -->
          <div class="card glass mt-3 security-status-card">
            <div class="flex-between">
              <h3>Account Security</h3>
              <router-link to="/profile" class="btn-api">Manage</router-link>
            </div>
            <div class="security-indicator mt-2">
              <span class="dot yellow"></span>
              <span class="security-text">MFA is currently <b>Disabled</b></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const history = ref([])
const loading = ref(true)

const planBadgeClass = computed(() => {
  if (user.value.plan === 'Pro') return 'badge-info'
  if (user.value.plan === 'Premium') return 'badge-gold'
  return 'badge-done'
})

onMounted(async () => {
  const token = localStorage.getItem('token')
  if (!token) return router.push('/login')

  try {
    const res = await fetch('/api/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to fetch profile')
    const data = await res.json()
    user.value = data.user
    history.value = data.history.reverse() // newest first
    localStorage.setItem('user', JSON.stringify(data.user))
  } catch (e) {
    console.error(e)
    if (e.message.includes('Unauthorized')) logout()
  } finally {
    loading.value = false
  }
})

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
.dashboard-page { min-height: 100vh; position: relative; }
.nav { padding: 16px 0; border-bottom: 1px solid var(--c-border); position: sticky; top: 0; z-index: 100; }
.nav-inner { display: flex; justify-content: space-between; align-items: center; }
.logo { font-family: var(--font-head); font-weight: 800; font-size: 1.25rem; display: flex; align-items: center; gap: 8px; }
.logo-dot { width: 10px; height: 10px; background: var(--c-primary); border-radius: 50%; box-shadow: 0 0 10px var(--c-primary); }

.dash-container { padding-top: 60px; padding-bottom: 80px; z-index: 10; position: relative; }
.header-section { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 24px; border-bottom: 1px solid var(--c-border); padding-bottom: 40px; }
.user-greeting h1 { font-size: 2.8rem; margin-bottom: 8px; font-weight: 800; letter-spacing: -0.04em; }
.user-plan-info { color: var(--c-text-muted); font-size: 1rem; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.upgrade-link { font-size: 0.9rem; font-weight: 600; text-decoration: none; padding-left: 8px; border-left: 1px solid var(--c-border); }
.upgrade-link:hover { text-decoration: underline; }

.dashboard-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 40px; }
@media (max-width: 992px) { .dashboard-grid { grid-template-columns: 1fr; } }

.section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.count-badge { background: var(--c-bg-2); color: var(--c-text-muted); padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; border: 1px solid var(--c-border); }

.events-list { display: flex; flex-direction: column; gap: 16px; }
.event-card { padding: 24px; display: flex; justify-content: space-between; align-items: center; transition: transform 0.2s, border-color 0.2s; border: 1px solid transparent; }
.event-card:hover { transform: translateY(-2px); border-color: var(--c-border-brighter); }
.event-info { display: flex; align-items: center; gap: 20px; }
.event-code-badge { background: var(--c-primary); color: white; padding: 12px; border-radius: 12px; font-weight: 800; font-family: var(--font-mono); font-size: 1.1rem; box-shadow: 0 4px 12px rgba(230, 57, 70, 0.3); }
.event-details h3 { font-size: 1.1rem; margin-bottom: 4px; }
.event-details p { font-size: 0.85rem; color: var(--c-text-muted); }

.upgrade-card { padding: 32px; text-align: center; background: linear-gradient(135deg, rgba(230, 57, 70, 0.1), rgba(69, 123, 157, 0.1)); border: 1px solid var(--c-primary-faint); }
.upgrade-icon { font-size: 2.5rem; margin-bottom: 16px; }
.upgrade-card h3 { margin-bottom: 12px; }
.upgrade-card p { font-size: 0.9rem; color: var(--c-text-muted); margin-bottom: 20px; }

.feature-limits { padding: 24px; }
.feature-limits h3 { font-size: 1rem; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--c-text-faint); }
.limit-item { display: flex; flex-direction: column; gap: 8px; }
.limit-label { font-size: 0.85rem; font-weight: 600; }
.limit-bar { height: 6px; background: var(--c-bg-2); border-radius: 3px; overflow: hidden; }
.limit-progress { height: 100%; border-radius: 3px; }
.limit-value { font-size: 0.75rem; color: var(--c-text-muted); text-align: right; }
.limit-status { font-size: 0.8rem; font-weight: 700; padding: 4px 8px; border-radius: 4px; width: fit-content; }
.status-locked { background: rgba(255,255,255,0.05); color: var(--c-text-faint); text-decoration: line-through; }
.status-unlocked { background: rgba(42, 157, 143, 0.1); color: var(--c-green); }

.badge-gold { background: rgba(233,196,106,0.1); color: var(--c-gold); border: 1px solid rgba(233,196,106,0.3); }
.badge-done { background: rgba(255,255,255,0.05); color: var(--c-text-muted); }

.empty-state .icon { font-size: 3rem; margin-bottom: 16px; opacity: 0.8; }

/* Security Status Card Styles */
.security-status-card h3 { font-size: 0.9rem; font-weight: 700; color: var(--c-text-muted); }
.flex-between { display: flex; justify-content: space-between; align-items: center; }
.security-indicator { display: flex; align-items: center; gap: 8px; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot.yellow { background: var(--c-gold); box-shadow: 0 0 8px var(--c-gold); }
.security-text { font-size: 0.8rem; color: var(--c-text-faint); }
.btn-api { font-size: 0.75rem; font-weight: 700; color: var(--c-primary-lit); cursor: pointer; text-decoration: none; }
.btn-api:hover { text-decoration: underline; }
.ml-2 { margin-left: 8px; }
</style>
