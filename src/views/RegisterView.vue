<template>
  <div class="auth-page noise">
    <router-link to="/" class="back-home">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
      Back to Home
    </router-link>

    <div class="container auth-container fade-up">
      <div class="card glass auth-card">
        <div class="text-center mb-4">
          <div class="auth-logo mb-2">
            <span class="logo-dot"></span>
            <span class="logo-text">EventSync <span class="logo-ai">AI</span></span>
          </div>
          <h2>Create an Account</h2>
          <p class="text-muted">Start organizing flawless live events.</p>
        </div>
        
        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label>Full Name</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input type="text" class="input has-icon" v-model="name" required placeholder="Jane Doe" />
            </div>
          </div>

          <div class="form-group">
            <label>Email Address</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input type="email" class="input has-icon" v-model="email" required placeholder="you@company.com" />
            </div>
          </div>
          
          <div class="form-group">
             <label>Password</label>
             <div class="input-wrapper">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input type="password" class="input has-icon" v-model="password" required placeholder="••••••••" minlength="6" />
            </div>
          </div>

          <p class="error-msg" v-if="error">{{ error }}</p>
          
          <button type="submit" class="btn btn-primary btn-full mt-2" :disabled="loading">
            <span v-if="loading">Creating Account...</span>
            <span v-else>Get Started for Free</span>
          </button>
        </form>

        <div class="auth-footer text-center mt-3">
          <p>Already have an account? <router-link to="/login" class="link-primary">Sign in</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()

const handleRegister = async () => {
  error.value = ''
  loading.value = true
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.value, email: email.value, password: password.value })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Registration failed')
    
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    router.push('/dashboard')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; padding: 40px 20px; }
.auth-container { max-width: 440px; width: 100%; z-index: 10; }
.auth-card { padding: 40px; border: 1px solid var(--c-border-brighter); }
.auth-logo { display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: 800; font-size: 1.2rem; }
.auth-form { display: flex; flex-direction: column; gap: 24px; }
.input-wrapper { position: relative; }
.input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--c-text-faint); pointer-events: none; }
.input.has-icon { padding-left: 44px; }
.btn-full { width: 100%; justify-content: center; height: 48px; font-weight: 700; }
.error-msg { color: var(--c-primary-lit); font-size: 0.85rem; background: rgba(230, 57, 70, 0.1); padding: 10px; border-radius: 8px; border: 1px solid rgba(230, 57, 70, 0.2); }
.back-home { position: absolute; top: 32px; left: 32px; display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: var(--c-text-muted); text-decoration: none; transition: color 0.2s; }
.back-home:hover { color: var(--c-text); }
.link-primary { color: var(--c-primary); font-weight: 600; text-decoration: none; }
.link-primary:hover { text-decoration: underline; }
</style>
