<template>
  <div class="landing-page noise">
    <!-- Nav -->
    <nav class="nav glass">
      <div class="container nav-inner">
        <router-link to="/" class="logo">
          <span class="logo-dot"></span>
          EventSync <span class="logo-ai">AI</span>
        </router-link>
        <div class="nav-links">
          <router-link to="/" class="btn btn-ghost btn-sm">Back to Home</router-link>
        </div>
      </div>
    </nav>

    <section class="section">
      <div class="container">
        <div class="text-center mb-section fade-up">
          <div class="badge badge-info mb-2">GET IN TOUCH</div>
          <h1>Let's Start a <span class="gradient-text">Conversation</span></h1>
          <p class="mt-2">Have questions about EventSync AI for your next big event? We're here to help.</p>
        </div>

        <div class="row">
          <!-- Contact Info -->
          <div class="col fade-up delay-1">
            <div class="card glass mb-3">
              <h3>Direct Support</h3>
              <p class="mt-1">For technical issues or immediate assistance.</p>
              <div class="mt-3">
                <a href="mailto:support@eventsync.ai" class="contact-link">
                  <span class="icon">📧</span> support@eventsync.ai
                </a>
              </div>
            </div>

            <div class="card glass mb-3">
              <h3>Enterprise Sales</h3>
              <p class="mt-1">Custom solutions for large-scale organizations.</p>
              <div class="mt-3">
                <a href="mailto:sales@eventsync.ai" class="contact-link">
                  <span class="icon">💼</span> sales@eventsync.ai
                </a>
              </div>
            </div>

            <div class="card glass">
              <h3>Follow Us</h3>
              <p class="mt-1">Stay updated with our latest features.</p>
              <div class="social-links mt-2">
                <a href="#" class="social-icon">𝕏</a>
                <a href="#" class="social-icon">in</a>
                <a href="#" class="social-icon">gh</a>
              </div>
            </div>
          </div>

          <!-- Contact Form -->
          <div class="col fade-up delay-2">
            <div class="card glass">
              <form @submit.prevent="handleSubmit">
                <div class="mb-3">
                  <label for="name">Your Name</label>
                  <input id="name" v-model="form.name" type="text" class="input" placeholder="John Doe" required />
                </div>
                <div class="mb-3">
                  <label for="email">Email Address</label>
                  <input id="email" v-model="form.email" type="email" class="input" placeholder="john@company.com" required />
                </div>
                <div class="mb-3">
                  <label for="subject">Subject</label>
                  <select id="subject" v-model="form.subject" class="input">
                    <option value="general">General Inquiry</option>
                    <option value="sales">Sales & Pricing</option>
                    <option value="support">Technical Support</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="message">Message</label>
                  <textarea id="message" v-model="form.message" class="input" placeholder="How can we help you?" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-full" :disabled="sending">
                  {{ sending ? 'Sending...' : 'Send Message' }}
                </button>
                <p v-if="submitted" class="success-text mt-2 text-center">
                  ✨ Message sent! We'll get back to you shortly.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container footer-inner">
        <div class="logo">
          <span class="logo-dot"></span>EventSync <span class="logo-ai">AI</span>
        </div>
        <div class="footer-social">
          <a href="#" class="social-link" title="X (Twitter)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="#" class="social-link" title="LinkedIn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
          <a href="#" class="social-link" title="Instagram">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
          <a href="#" class="social-link" title="Facebook">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href="#" class="social-link" title="YouTube">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </a>
        </div>
        <p>© 2026 EventSync AI. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  name: '',
  email: '',
  subject: 'general',
  message: ''
})

const sending = ref(false)
const submitted = ref(false)

const handleSubmit = () => {
  sending.value = true
  // Mock API call
  setTimeout(() => {
    sending.value = false
    submitted.value = true
    form.value = { name: '', email: '', subject: 'general', message: '' }
    setTimeout(() => { submitted.value = false }, 5000)
  }, 1500)
}
</script>

<style scoped>
.contact-link {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  transition: transform 0.2s;
}
.contact-link:hover {
  transform: translateX(4px);
}
.icon {
  font-size: 1.2rem;
}
.social-links {
  display: flex;
  gap: 12px;
}
.social-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  border: 1px solid var(--c-border);
  transition: all 0.3s;
  color: var(--c-text-muted);
}
.social-icon:hover {
  background: var(--c-primary);
  color: white;
  border-color: var(--c-primary);
  transform: translateY(-2px);
}
.btn-full {
  width: 100%;
}
.success-text {
  color: var(--c-teal);
  font-weight: 600;
  font-size: 0.9rem;
}
</style>
