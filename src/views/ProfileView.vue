<template>
  <div class="profile-page noise">
    <!-- Header -->
    <header class="dashboard-header glass">
      <div class="header-inner">
        <div class="logo">
          <span class="logo-dot"></span>
          EventSync <span class="logo-ai">AI</span>
        </div>
        <nav class="nav-links">
          <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
          <router-link to="/admin" class="nav-link">Create Event</router-link>
          <router-link to="/profile" class="nav-link active">Profile</router-link>
          <button @click="logout" class="btn btn-ghost btn-sm">Log Out</button>
        </nav>
      </div>
    </header>

    <main class="profile-container">
      <div class="profile-grid">
        <!-- Sidebar: Account Summary -->
        <aside class="profile-sidebar card glass">
          <div class="user-avatar-large">
            {{ user?.name?.charAt(0) || 'U' }}
          </div>
          <h2 class="user-name">{{ user?.name }}</h2>
          <p class="user-email">{{ user?.email }}</p>
          <div class="plan-badge-large" :class="user?.plan?.toLowerCase()">
            {{ user?.plan }} Plan
          </div>
          <div class="divider"></div>
          <div class="sidebar-stats">
            <div class="stat-row">
              <span class="stat-label">Member Since</span>
              <span class="stat-val">March 2024</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Events Hosted</span>
              <span class="stat-val">12</span>
            </div>
          </div>
        </aside>

        <!-- Main Content: Tabs/Settings -->
        <section class="profile-main">
          <div class="settings-card card glass">
            <h3>🔐 Security & Access</h3>
            <p class="section-hint">Pro-tier security features to keep your events safe.</p>
            
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Two-Factor Authentication (MFA)</span>
                <span class="setting-desc">Add an extra layer of security via mobile authenticator.</span>
              </div>
              <div class="toggle-wrap" @click="toggleMFA">
                <div class="toggle-bg" :class="{ active: mfaEnabled }">
                  <div class="toggle-nub"></div>
                </div>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Active Sessions</span>
                <span class="setting-desc">You are currently logged in on this Windows device.</span>
              </div>
              <button class="btn btn-ghost btn-xs">Log Out All Others</button>
            </div>
          </div>

          <div class="settings-card card glass mt-4">
            <h3>🛠 Developer & API</h3>
            <p class="section-hint">Integrate your events with OBS, vMix, or custom hardware.</p>
            
            <div class="api-key-box">
              <label class="label-xs">YOUR API KEY</label>
              <div class="api-input-wrap">
                <input :type="showKey ? 'text' : 'password'" :value="apiKey" readonly class="api-input" />
                <button @click="showKey = !showKey" class="btn-api">
                  {{ showKey ? 'Hide' : 'Show' }}
                </button>
              </div>
            </div>
            <p class="api-limit-hint">Usage: 142 / 1,000 requests this month.</p>
          </div>

          <div class="settings-card card danger-card mt-4">
            <h3>⚠️ Danger Zone</h3>
            <p class="section-hint">Permanently delete your account and all event data.</p>
            <button @click="deleteAccount" class="btn btn-danger btn-sm">Delete Account</button>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const mfaEnabled = ref(false)
const showKey = ref(false)
const apiKey = ref('es_live_' + Math.random().toString(36).substring(2, 15))

const toggleMFA = () => {
  if (user.value.plan === 'Starter') {
    alert('Two-Factor Authentication is a Pro feature. Please upgrade your plan!')
    return
  }
  mfaEnabled.value = !mfaEnabled.value
}

const deleteAccount = () => {
  if (confirm('Are you absolutely sure? This cannot be undone.')) {
    localStorage.clear()
    router.push('/')
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
.profile-page { min-height: 100vh; padding-bottom: 80px; }
.profile-container { max-width: 1000px; margin: 40px auto; padding: 0 24px; }
.profile-grid { display: grid; grid-template-columns: 300px 1fr; gap: 32px; }

@media (max-width: 800px) { .profile-grid { grid-template-columns: 1fr; } }

.profile-sidebar { display: flex; flex-direction: column; align-items: center; padding: 40px 24px; text-align: center; }
.user-avatar-large { 
  width: 80px; height: 80px; 
  background: var(--c-primary); 
  border-radius: 50%; 
  display: flex; align-items: center; justify-content: center; 
  font-size: 2rem; font-weight: 800; color: #fff;
  box-shadow: 0 8px 24px var(--c-primary-glo);
  margin-bottom: 16px;
}
.user-name { font-size: 1.4rem; margin-bottom: 4px; }
.user-email { color: var(--c-text-muted); font-size: 0.9rem; margin-bottom: 16px; }

.plan-badge-large {
  padding: 6px 16px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.starter { background: rgba(255,255,255,0.05); color: var(--c-text-muted); border: 1px solid var(--c-border); }
.pro { background: rgba(138,21,56,0.1); color: var(--c-primary-lit); border: 1px solid var(--c-primary-lit); }

.sidebar-stats { width: 100%; margin-top: 16px; }
.stat-row { display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 8px; }
.stat-label { color: var(--c-text-muted); }

/* Settings Cards */
.settings-card { padding: 32px; border: 1px solid var(--c-border); }
.section-hint { font-size: 0.85rem; color: var(--c-text-muted); margin-bottom: 24px; }

.setting-item { 
  display: flex; justify-content: space-between; align-items: center; 
  padding: 20px 0; border-bottom: 1px solid var(--c-border);
}
.setting-item:last-of-type { border-bottom: none; }
.setting-info { display: flex; flex-direction: column; gap: 4px; }
.setting-label { font-weight: 700; font-size: 0.95rem; }
.setting-desc { font-size: 0.8rem; color: var(--c-text-muted); }

/* Toggles */
.toggle-wrap { cursor: pointer; }
.toggle-bg { width: 44px; height: 24px; background: rgba(255,255,255,0.08); border-radius: 99px; position: relative; transition: background 0.3s; }
.toggle-bg.active { background: var(--c-primary); }
.toggle-nub { 
  position: absolute; top: 4px; left: 4px; 
  width: 16px; height: 16px; background: #fff; 
  border-radius: 50%; transition: transform 0.3s;
}
.active .toggle-nub { transform: translateX(20px); }

/* API Key */
.api-key-box { 
  background: rgba(0,0,0,0.2); 
  border: 1px solid var(--c-border); 
  border-radius: 12px; 
  padding: 16px; 
  margin-top: 8px;
}
.api-input-wrap { display: flex; gap: 12px; margin-top: 8px; }
.api-input { 
  flex: 1; 
  background: none; border: none; 
  color: var(--c-primary-lit); font-family: var(--font-mono); 
  font-size: 0.85rem;
}
.btn-api { background: none; border: none; color: var(--c-text-muted); cursor: pointer; font-size: 0.8rem; font-weight: 600; }
.api-limit-hint { font-size: 0.72rem; color: var(--c-text-faint); margin-top: 12px; text-align: right; }

.danger-card { border-color: rgba(192, 57, 43, 0.3); background: rgba(192, 57, 43, 0.05); }
.mt-4 { margin-top: 32px; }
</style>
