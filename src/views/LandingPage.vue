<template>
  <div class="landing-page noise">

    <!-- Nav -->
    <nav class="nav glass fade-up">
      <div class="container nav-inner">
        <div class="logo">
          <span class="logo-dot"></span>
          EventSync <span class="logo-ai">AI</span>
        </div>
        <div class="nav-links">
          <router-link to="/admin" class="btn btn-primary btn-sm">
            Create Event
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <section class="hero section">
      <div class="container hero-inner">
        <div class="hero-badge badge badge-live fade-up">
          <span class="live-dot"></span> Live Event Orchestration
        </div>
        <h1 class="fade-up delay-1">
          The <span class="gradient-text">Intelligent</span> Event
          <br />Sync Hub
        </h1>
        <p class="hero-sub fade-up delay-2">
          Real-time synchronized agendas, AI-powered Q&amp;A moderation, and
          live speaker digests — for corporate all-hands, keynotes, and
          high-stakes presentations.
        </p>
        <div class="hero-cta fade-up delay-3">
          <router-link to="/admin" class="btn btn-primary btn-lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Create an Event
          </router-link>
          <button @click="showJoin = !showJoin" class="btn btn-ghost btn-lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Join an Event
          </button>
        </div>

        <!-- Join panel -->
        <div v-if="showJoin" class="join-panel card mt-3">
          <label for="join-code">Enter your event code</label>
          <div class="join-row">
            <input id="join-code" v-model="joinCode" class="input" placeholder="e.g. A3K92" maxlength="5" @keyup.enter="joinAudience" />
            <button class="btn btn-primary" @click="joinAudience">Join</button>
          </div>
          <p v-if="joinError" class="error-text mt-1">{{ joinError }}</p>
        </div>
      </div>

      <!-- Trusted By Logo Cloud -->
      <div class="container trusted-by fade-up delay-3">
        <p class="trusted-label">Trusted by production teams at</p>
        <div class="logo-cloud">

          <!-- TECHFLOW -->
          <div class="cloud-item">
            <svg class="cloud-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            <span class="cloud-name">TECHFLOW</span>
          </div>

          <!-- NEXUS -->
          <div class="cloud-item">
            <svg class="cloud-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
            </svg>
            <span class="cloud-name">NEXUS</span>
          </div>

          <!-- PULSE -->
          <div class="cloud-item">
            <svg class="cloud-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <span class="cloud-name">PULSE</span>
          </div>

          <!-- APEX -->
          <div class="cloud-item">
            <svg class="cloud-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 22 20 2 20"/>
            </svg>
            <span class="cloud-name">APEX</span>
          </div>

          <!-- VISION -->
          <div class="cloud-item">
            <svg class="cloud-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span class="cloud-name">VISION</span>
          </div>

        </div>
      </div>

      <!-- Hero visual -->
      <div class="hero-visual fade-up delay-2">
        <div class="mockup-ring">
          <svg viewBox="0 0 200 200" class="ring-svg">
            <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(230, 57, 70, 0.15)" stroke-width="6"/>
            <circle cx="100" cy="100" r="85" fill="none" stroke="var(--c-primary)" stroke-width="6"
              stroke-dasharray="534" stroke-dashoffset="134"
              stroke-linecap="round" transform="rotate(-90 100 100)" class="ring-progress"/>
          </svg>
          <div class="ring-time">14:37</div>
          <div class="ring-label">Opening Keynote</div>
        </div>
      </div>
    </section>

    <!-- Problem & Solution Section -->
    <section class="section problem-solution-section">
      <div class="container">
        <!-- The Problem -->
        <div class="problem-block fade-up mb-10">
          <div class="badge badge-error mb-2">THE FRUSTRATION</div>
          <h2 class="mb-3">The Hidden <span class="text-danger">Chaos</span> of Live Events</h2>
          <p class="section-sub mb-8">Precision matters. When every second is a live broadcast, even the smallest misalignment becomes a terminal error.</p>
          
          <div class="problem-grid">
            <div class="problem-card card glass">
              <div class="problem-header">
                <span class="problem-icon">⏳</span>
                <h3>Sync Lag</h3>
              </div>
              <p>AV desks, speakers, and audiences seeing different times — leading to awkward, uncoordinated transitions.</p>
            </div>
            <div class="problem-card card glass">
              <div class="problem-header">
                <span class="problem-icon">💬</span>
                <h3>Q&A Noise</h3>
              </div>
              <p>Struggling to find real questions amidst a sea of duplicates and spam while live on stage.</p>
            </div>
            <div class="problem-card card glass">
              <div class="problem-header">
                <span class="problem-icon">⚡</span>
                <h3>Static Agendas</h3>
              </div>
              <p>The manual nightmare of updating timers and handouts when a speaker runs 5 minutes over.</p>
            </div>
          </div>
        </div>

        <!-- The Need/Solution -->
        <div class="solution-block fade-up delay-2">
          <div class="badge badge-primary mb-2">THE FIX</div>
          <h2 class="mb-3">Orchestrate with <span class="gradient-text">Confidence</span></h2>
          <p class="section-sub mb-8">EventSync AI provides the unified intelligence you need to run flawless events at any scale.</p>

          <div class="solution-grid">
            <div class="solution-card card glass">
              <div class="solution-header">
                <span class="solution-icon">✨</span>
                <h3>Unified Source of Truth</h3>
              </div>
              <p>One ultra-low latency WebSocket engine to rule them all. When you hit play, everyone stays in step.</p>
            </div>
            <div class="solution-card card glass">
              <div class="solution-header">
                <span class="solution-icon">🤖</span>
                <h3>AI-Driven Clarity</h3>
              </div>
              <p>Automatically filter the noise and amplify the signal. Let AI handle the sorting so you can handle the speaking.</p>
            </div>
            <div class="solution-card card glass">
              <div class="solution-header">
                <span class="solution-icon">🔄</span>
                <h3>Adaptive Orchestration</h3>
              </div>
              <p>A fluid event is a professional event. Our engine adapts to the rhythm of your performance in real-time.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Broadcast Integrations Section -->
    <section class="section integrations-section">
      <div class="container">
        <div class="text-center mb-section fade-up">
          <div class="badge badge-info mb-2">PRO ECOSYSTEM</div>
          <h2 class="mb-3">Ready for the <span class="gradient-text">Broadcast Desk</span></h2>
          <p class="mt-2">Connect EventSync AI to your existing professional production workflow.</p>
        </div>

        <div class="integrations-grid">
          <div class="integration-card card glass fade-up">
            <div class="integration-logo">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="2" y="2" width="20" height="20" rx="4" />
                <circle cx="12" cy="12" r="6" />
                <path d="M12 9v6M9 12h6" />
              </svg>
            </div>
            <h3>OBS Studio & vMix</h3>
            <p>Seamlessly overlay live timers, Q&A blocks, and lower-thirds into your broadcast using low-latency browser sources.</p>
          </div>

          <div class="integration-card card glass fade-up delay-1">
            <div class="integration-logo">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M4 4h16v16H4z" />
                <path d="M8 8h8v8H8z" />
                <path d="M12 4v4M12 16v4M4 12h4M16 12h4" />
              </svg>
            </div>
            <h3>Blackmagic ATEM</h3>
            <p>Sync your event rhythm with hardware transitions. Trigger ATEM macros directly from the EventSync orchestrator.</p>
          </div>

          <div class="integration-card card glass fade-up delay-2">
            <div class="integration-logo">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3>NDI Integration</h3>
            <p>Broadcast your timer states and audience sentiment as high-quality NDI streams over your local production network.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="section features-section">
      <div class="container">
        <div class="text-center mb-section fade-up">
          <h2 class="mb-3">Everything you need for <span class="gradient-text">flawless events</span></h2>
          <p class="mt-2">From a 10-person department sync to a 10,000-person global all-hands.</p>
        </div>
        <div class="features-grid">
          <div v-for="(f, i) in features" :key="f.title" class="feature-card card fade-up" :style="`animation-delay: ${i * 0.1}s`">
            <div class="feature-icon">{{ f.icon }}</div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <section id="pricing" class="section pricing-section">
      <div class="container">
        <div class="text-center mb-section">
          <h2 class="mb-3">Professional <span class="gradient-text">Pricing</span> for every scale</h2>
          <p class="mt-2">Choose the perfect plan for your next presentation or enterprise event.</p>
          
          <div class="pricing-toggle mt-3">
            <span :class="{ active: !isYearly }">Monthly</span>
            <div class="toggle-bg" @click="isYearly = !isYearly">
              <div class="toggle-circle" :class="{ right: isYearly }"></div>
            </div>
            <span :class="{ active: isYearly }">Yearly <span class="badge badge-primary badge-xs">Save 40%</span></span>
          </div>
        </div>

        <div class="pricing-grid">
          <div v-for="plan in plans" :key="plan.name" class="pricing-card card" :class="{ 'card--featured': plan.featured }">
            <div v-if="plan.featured" class="featured-badge">MOST POPULAR</div>
            <div class="plan-header">
              <h3 class="plan-name">{{ plan.name }}</h3>
              <p class="plan-desc">{{ plan.desc }}</p>
              <div class="plan-price">
                <span class="currency">€</span>
                <span class="amount">{{ isYearly ? plan.priceYearly : plan.priceMonthly }}</span>
                <span class="period">/{{ isYearly ? 'year' : 'mo' }}</span>
              </div>
              <p v-if="isYearly && plan.savings" class="plan-savings">Save €{{ plan.savings }}</p>
              <p v-else-if="plan.name === 'Starter'" class="plan-savings">Try for Free</p>
              <router-link :to="plan.name === 'Starter' ? '/admin' : '/register'" class="btn btn-full mt-3" :class="plan.featured ? 'btn-primary' : 'btn-ghost'">
                {{ plan.cta }}
              </router-link>
            </div>
            <div class="divider"></div>
            <ul class="plan-features">
              <li v-for="f in plan.features" :key="f" class="feature-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="check-icon"><polyline points="20 6 9 17 4 12"/></svg>
                {{ f }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Enterprise & Desktop -->
        <div class="text-center" style="margin-top: 100px; margin-bottom: 48px;">
          <h3>Additional Plans</h3>
        </div>
        <div class="pricing-extra">
          <div class="pricing-card card enterprise-card">
            <div class="plan-header">
              <div class="badge badge-info mb-1">ENTERPRISE</div>
              <h3 class="plan-name">Large Scale Organizations</h3>
              <p class="plan-desc">For custom-tailored needs of larger organisations.</p>
              <div class="plan-price mt-2">
                <span class="period">starting from</span>
                <span class="currency ml-1">€</span>
                <span class="amount">540</span>
              </div>
              <router-link to="/contact" class="btn btn-full btn-primary mt-3">Contact Us</router-link>
            </div>
            <div class="divider"></div>
            <ul class="plan-features">
              <li class="feature-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="check-icon"><polyline points="20 6 9 17 4 12"/></svg> Large Teams possible</li>
              <li class="feature-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="check-icon"><polyline points="20 6 9 17 4 12"/></svg> Up to 500 Live Connections</li>
              <li class="feature-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="check-icon"><polyline points="20 6 9 17 4 12"/></svg> All Premium Features included</li>
              <li class="feature-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="check-icon"><polyline points="20 6 9 17 4 12"/></svg> Purchase via reseller or vendor</li>
              <li class="feature-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="check-icon"><polyline points="20 6 9 17 4 12"/></svg> Custom invoice, billing and terms</li>
              <li class="feature-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="check-icon"><polyline points="20 6 9 17 4 12"/></svg> Multiple licenses in one invoice possible</li>
            </ul>
          </div>
          <div class="pricing-card card desktop-card">
            <div class="plan-header">
              <div class="badge badge-live mb-1">OFFLINE POWER</div>
              <h3 class="plan-name">Desktop App Lifetime License</h3>
              <p class="plan-desc">One-time purchase, yours forever.</p>
              <div class="plan-price mt-2">
                <span class="currency">€</span>
                <span class="amount">890</span>
                <span class="period">/one-time</span>
              </div>
              <a href="mailto:sales@eventsync.ai" class="btn btn-full btn-ghost mt-3">Get Desktop App License</a>
            </div>
            <div class="divider"></div>
            <ul class="plan-features">
              <li class="feature-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="check-icon"><polyline points="20 6 9 17 4 12"/></svg> Mac, Windows & Linux – Flexible key</li>
              <li class="feature-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="check-icon"><polyline points="20 6 9 17 4 12"/></svg> 100% offline operation – Works without internet</li>
              <li class="feature-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="check-icon"><polyline points="20 6 9 17 4 12"/></svg> All features unlocked forever – no limits</li>
              <li class="feature-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="check-icon"><polyline points="20 6 9 17 4 12"/></svg> JSON import/export with Web Version</li>
              <li class="feature-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="check-icon"><polyline points="20 6 9 17 4 12"/></svg> 3 years of updates included</li>
              <li class="feature-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="check-icon"><polyline points="20 6 9 17 4 12"/></svg> Only applies to Desktop App, Web Version not included</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Plan Comparison Table -->
      <div class="container comparison-container fade-up">
        <div class="text-center mb-4">
          <h3>Compare <span class="gradient-text">Features</span></h3>
        </div>
        <table class="comp-table card glass">
          <thead>
            <tr>
              <th>Feature</th>
              <th>Starter</th>
              <th>Pro</th>
              <th>Premium</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="comp-label">Live Connections</td>
              <td>Up to 3</td>
              <td>Up to 50</td>
              <td>Up to 500</td>
            </tr>
            <tr>
              <td class="comp-label">Real-time Timer Sync</td>
              <td class="comp-check">✔</td>
              <td class="comp-check">✔</td>
              <td class="comp-check">✔</td>
            </tr>
            <tr>
              <td class="comp-label">Number of Timers</td>
              <td>3 per room</td>
              <td>50 per room</td>
              <td>Unlimited</td>
            </tr>
            <tr>
              <td class="comp-label">AI Moderation</td>
              <td class="comp-cross">✘</td>
              <td class="comp-check">✔</td>
              <td class="comp-check">✔</td>
            </tr>
            <tr>
              <td class="comp-label">Custom Branding</td>
              <td class="comp-cross">✘</td>
              <td class="comp-cross">✘</td>
              <td class="comp-check">✔</td>
            </tr>
            <tr>
              <td class="comp-label">API Access</td>
              <td class="comp-cross">✘</td>
              <td class="comp-check">✔</td>
              <td class="comp-check">✔</td>
            </tr>
            <tr>
              <td class="comp-label">CSV Post-Event Export</td>
              <td class="comp-check">✔</td>
              <td class="comp-check">✔</td>
              <td class="comp-check">✔</td>
            </tr>
            <tr>
              <td class="comp-label">Priority Support</td>
              <td class="comp-cross">✘</td>
              <td class="comp-check">✔</td>
              <td class="comp-check">✔</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="section testimonials-section">
      <div class="container">
        <div class="text-center mb-section fade-up">
          <div class="badge badge-info mb-1">PRO STORIES</div>
          <h2>Loved by <span class="gradient-text">Event Directors</span></h2>
        </div>
        <div class="testimonials-grid">
          <div v-for="(t, i) in testimonials" :key="i" class="testimonial-card card glass fade-up" :style="`animation-delay: ${i * 0.1}s`">
            <div class="quote-icon">"</div>
            <p class="quote-text">{{ t.text }}</p>
            <div class="quote-author">
              <div class="author-avatar" :style="{ background: t.avatarBg }">{{ t.initials }}</div>
              <div>
                <div class="author-name">{{ t.name }}</div>
                <div class="author-title">{{ t.title }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="section stats-section">
      <div class="container">
        <div class="stats-grid">
          <div v-for="s in stats" :key="s.label" class="stat-block">
            <div class="stat-val">{{ s.val }}</div>
            <div class="stat-label">{{ s.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="section faq-section">
      <div class="container faq-inner">
        <div class="text-center mb-section fade-up">
          <h2>Frequently Asked <span class="gradient-text">Questions</span></h2>
          <p class="mt-1">Everything you need to know about EventSync AI.</p>
        </div>
        
        <div class="faq-list fade-up delay-2">
          <div 
            v-for="(faq, index) in faqs" 
            :key="index" 
            class="faq-item card glass" 
            :class="{ active: activeFaq === index }"
          >
            <div class="faq-question" @click="toggleFaq(index)">
              <h3>{{ faq.q }}</h3>
              <svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--c-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <div class="faq-answer-wrapper" :style="{ maxHeight: activeFaq === index ? '200px' : '0' }">
              <div class="faq-answer">
                <p>{{ faq.a }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Bottom -->
    <section class="section cta-section">
      <div class="container text-center">
        <h2>Ready to run your next <span class="gradient-text">perfect event</span>?</h2>
        <p class="mt-1">Create a room in 30 seconds. No sign-up required to try.</p>
        <div class="mt-4">
          <router-link to="/admin" class="btn btn-primary btn-lg">Get Started — It's Free</router-link>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container footer-inner">
        <div class="logo">
          <span class="logo-dot"></span>EventSync <span class="logo-ai">AI</span>
        </div>
        <p>Built for professionals who need every second to count.</p>
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
        <p class="mt-2" style="font-size: 0.8rem; opacity: 0.5;">© 2026 EventSync AI. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const router = useRouter()
const showJoin = ref(false)
const joinCode = ref('')
const joinError = ref('')

onMounted(() => {
  // Hero Animation
  gsap.from('.hero-inner > *', {
    y: 30,
    opacity: 0,
    duration: 1,
    stagger: 0.2,
    ease: 'power3.out'
  })

  // Section Reveal
  const sections = document.querySelectorAll('.section')
  sections.forEach(section => {
    const fadeElements = section.querySelectorAll('.fade-up')
    if (fadeElements.length > 0) {
      gsap.from(fadeElements, {
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
        },
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power2.out',
        clearProps: 'all' // To avoid conflict with hover states
      })
    }
  })
})

const features = [
  { icon: '⚡', title: 'Zero-Latency Sync', desc: 'Every connected device sees the same countdown, updated every second. Works across continents with WebSocket precision.' },
  { icon: '📋', title: 'Dynamic Agendas', desc: 'Running 5 minutes over? The agenda auto-shifts in real-time for every viewer. No manual updates needed.' },
  { icon: '🤖', title: 'AI Q&A Assistant', desc: "Audience questions answered instantly by an AI trained on your event's FAQ. Common noise filtered before it reaches the speaker." },
  { icon: '📊', title: 'Speaker Digest', desc: "The top audience questions are clustered and delivered to the speaker's dashboard — so only the most impactful topics surface." },
  { icon: '🔗', title: 'Instant Share Links', desc: 'Share a short event code. Audience connects in one click — no app install, no login, no friction.' },
  { icon: '👥', title: 'Live Presence', desc: 'See exactly how many people are viewing in real-time. Perfect for broadcast producers and corporate event managers.' },
]

const stats = [
  { val: '< 1s', label: 'WebSocket Latency' },
  { val: '10k+', label: 'Max Connections' },
  { val: '0.0%', label: 'Manual Moderation' },
  { val: 'Instant', label: 'Sentiment Analysis' },
]

const activeFaq = ref(null)

const toggleFaq = (index) => {
  activeFaq.value = activeFaq.value === index ? null : index
}

const faqs = [
  { q: "What is EventSync AI?", a: "EventSync AI is a premium live event orchestration platform that synchronizes speaker timers, moderates audience Q&A using AI, and provides a unified dashboard for event producers." },
  { q: "Do attendees need to download an app?", a: "No! The Audience view is 100% web-based. Attendees simply scan a QR code or visit the short link on their phone browser to instantly join the session." },
  { q: "How does the AI Moderation work?", a: "Our AI engine automatically scans incoming audience questions in real-time. It filters out profanity, flags inappropriate content, and groups similar questions together to prevent duplicates." },
  { q: "Can I use my own company's branding?", a: "Yes. Pro and Premium users can upload custom logos and select a primary brand color. The platform dynamically injects your brand into all Host and Audience views." },
  { q: "What happens if my event loses internet connection?", a: "The Web version requires internet. However, we offer a Desktop App Lifetime License (€890) which operates entirely offline over a local area network (LAN) for critical corporate events." },
  { q: "How does the timer sync across devices?", a: "We use ultra-low latency WebSockets. When the event producer starts or pauses a timer on the Admin dashboard, every speaker iPad and audience phone updates within milliseconds." },
  { q: "Is there a limit to how many attendees can join?", a: "The Free Starter tier supports 3 connections. Our Pro tier supports up to 50, Premium supports 500, and Enterprise supports custom limits up to 10,000+ simultaneous connections." },
  { q: "Are the audience questions anonymous?", a: "Attendees have the option to enter their name or submit questions anonymously, depending on how the Event Organizer configures the room." },
  { q: "How does the 'AI Sentiment Analysis' work?", a: "The AI evaluates the tone of incoming audience queries (Positive, Neutral, Negative) and displays an aggregated 'Audience Mood' gauge on the Host's dashboard in real-time." },
  { q: "Can I test the platform for free?", a: "Absolutely. You can create a free account to test the system with up to 3 live connections and basic timer functionality forever." },
  { q: "Is my corporate data secure?", a: "Yes. Rooms are protected by cryptographic Host Keys, and all connections are transmitted over secure WSS (WebSocket Secure) protocols. We do not sell your event data." },
  { q: "What is an 'Agenda Segment'?", a: "An agenda segment is a block of time allocated to a specific speaker or topic. You can chain multiple segments together to create a fluid, automated run-of-show." },
  { q: "Can I export the audience questions after the event?", a: "Yes, Pro and Premium users can export the entire Q&A log, including dismissed questions and AI sentiment scores, to a standard CSV file." },
  { q: "Do you offer API access?", a: "Yes! API access to automate event creation and pull real-time timer states is included in the Pro, Premium, and Enterprise tiers." },
  { q: "What platforms does the Desktop App run on?", a: "The offline Desktop App License provides binaries for macOS, Windows, and Linux, ensuring compatibility with whatever hardware the AV team is running." },
  { q: "Can multiple producers manage the same event?", a: "Yes. Anyone with the private 'Host Key' can access the Host Dashboard and act as a co-producer to moderate questions or control the timer." },
  { q: "What payment methods do you accept?", a: "We accept all major credit cards via Stripe for Pro and Premium subscriptions. Enterprise and Desktop Licenses can be purchased via custom invoice and wire transfer." },
  { q: "Can I upgrade or downgrade my plan?", a: "You can change your subscription tier at any time from your User Dashboard. Prorated charges or credits will automatically apply." },
  { q: "What is the difference between Pro and Premium?", a: "Pro is designed for standard events (50 connections, no custom branding). Premium unlocks full White-Labeling (custom logos/colors) and handles up to 500 simultaneous connections." },
  { q: "Do you offer support?", a: "Yes, Starter plans have access to community forums, while Pro, Premium, and Enterprise users get priority email and dedicated account manager support." }
]

const testimonials = [
  { initials: 'JD', name: 'James Dalton', title: 'Global Events, Techflow', text: 'EventSync AI transformed our annual keynote. The sub-second timer sync meant our speakers were never out of step with the broadcast desk.', avatarBg: 'linear-gradient(135deg, #e63946, #457b9d)' },
  { initials: 'SC', name: 'Sarah Chen', title: 'Executive Producer, Nexus', text: 'The AI moderation is a lifesaver. We handled 400+ questions in an hour without a single duplicate or inappropriate message reaching the stage.', avatarBg: 'linear-gradient(135deg, #2a9d8f, #e9c46a)' },
  { initials: 'MK', name: 'Marcus Knight', title: 'Lead Coordinator, Apex Global', text: 'Real-time agenda shifts saved us when our CEO went 12 minutes over. One slide, and everyone saw the update instantly.', avatarBg: 'linear-gradient(135deg, #8e44ad, #2980b9)' },
  { initials: 'AL', name: 'Anita Lopez', title: 'Producer, Vision Media', text: 'Integrating the live timer into our vMix setup via browser source was effortless. Professional broadcast quality on a budget.', avatarBg: 'linear-gradient(135deg, #d35400, #c0392b)' },
  { initials: 'RJ', name: 'Robert Jenkins', title: 'Director, Pulse Events', text: 'Sentiment analysis gave us an edge. We knew exactly when the energy shifted and adjusted our panel discussion mid-stream.', avatarBg: 'linear-gradient(135deg, #16a085, #2c3e50)' },
  { initials: 'EB', name: 'Elena Belova', title: 'Event Architect, Aurora', text: 'The speaker digest clustering is pure magic. It turns audience chaos into a structured narrative for our presenters.', avatarBg: 'linear-gradient(135deg, #f39c12, #d35400)' },
  { initials: 'TH', name: 'Thomas Hynes', title: 'Operations, Skybound', text: 'Zero latency is not a marketing buzzword here. It actually works. Across 5 hub locations, we stayed perfectly aligned.', avatarBg: 'linear-gradient(135deg, #27ae60, #2c3e50)' },
  { initials: 'SM', name: 'Suki Min', title: 'Stage Manager, TechSummit', text: 'The interface is so intuitive our backup crew picked it up in 5 minutes. Reliability is everything in live production.', avatarBg: 'linear-gradient(135deg, #c0392b, #8e44ad)' },
  { initials: 'DW', name: 'David Wright', title: 'AV Lead, Streamline', text: 'We use the Desktop App for mission-critical offline environments. It has never once dropped a frame or a sync.', avatarBg: 'linear-gradient(135deg, #2980b9, #1abc9c)' },
  { initials: 'PF', name: 'Paola Fabbri', title: 'Marketing Dir, Innovate', text: 'Our registration numbers spiked after using EventSync AI. The poll interactions made spectators feel like active participants.', avatarBg: 'linear-gradient(135deg, #e67e22, #f1c40f)' },
  { initials: 'GL', name: 'Gary Lewis', title: 'Senior VP, GlobalOne', text: "Best-in-class security. For our private executive sessions, the Room Key encryption is a non-negotiable must-have.", avatarBg: 'linear-gradient(135deg, #34495e, #95a5a6)' },
  { initials: 'KM', name: 'Kelly Moore', title: 'Creative Lead, Neon', text: 'The custom branding allowed us to white-label the entire experience for our clients. They thought we built it bespoke.', avatarBg: 'linear-gradient(135deg, #ed4264, #ffedbc)' }
]

const isYearly = ref(true)
const plans = [
  {
    name: 'Starter',
    desc: 'The basics to get you started',
    priceMonthly: 0,
    priceYearly: 0,
    cta: 'Try for Free',
    features: ['Live Timer Sharing', '3 Connections per Room', 'Up to 3 Timers', 'Audio Chimes', 'CSV Export']
  },
  {
    name: 'Pro',
    desc: 'Keep your event running on time',
    priceMonthly: 24,
    priceYearly: 180,
    savings: 108,
    featured: true,
    cta: 'Get Pro',
    features: ['50 Connections per Room', '50 Timers per Room', 'Custom Moderation Link', 'API Access', 'Companion Module']
  },
  {
    name: 'Premium',
    desc: 'Custom-branded professional outputs',
    priceMonthly: 48,
    priceYearly: 360,
    savings: 216,
    cta: 'Get Premium',
    features: ['500 Connections per Room', 'Unlimited Timers', 'Custom Logo & Branding', 'Custom Colors & Fonts', 'Drag & Drop Builder']
  }
]

async function joinAudience() {
  joinError.value = ''
  const code = joinCode.value.trim().toUpperCase()
  if (code.length < 3) { joinError.value = 'Please enter a valid event code.'; return; }
  try {
    const res = await fetch(`/api/rooms/${code}`)
    if (!res.ok) { joinError.value = 'Room not found. Check your code and try again.'; return; }
    router.push(`/audience/${code}`)
  } catch {
    joinError.value = 'Could not connect to server. Is the backend running?'
  }
}
</script>

<style scoped>
.landing { position: relative; overflow-x: hidden; }

/* Trusted By */
.trusted-by {
  margin-top: 64px;
  padding-top: 40px;
  border-top: 1px solid var(--c-border);
}
.trusted-label {
  text-align: center;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--c-text-faint);
  margin-bottom: 28px;
}
.logo-cloud {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 16px;
}
.cloud-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 20px;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 40px;
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(4px);
  transition: border-color 0.25s, background 0.25s, transform 0.25s;
  cursor: default;
}
.cloud-item:hover {
  border-color: rgba(230, 57, 70, 0.35);
  background: rgba(230, 57, 70, 0.06);
  transform: translateY(-2px);
}
.cloud-icon {
  width: 18px;
  height: 18px;
  color: var(--c-primary-lit);
  flex-shrink: 0;
  opacity: 0.85;
}
.cloud-name {
  font-family: var(--font-head);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--c-text-muted);
  text-transform: uppercase;
}

/* Nav */
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--c-border);
}
.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  padding-bottom: 16px;
}
.logo {
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  display: flex;
  align-items: center;
  gap: 8px;
}
.logo-dot {
  width: 10px; height: 10px;
  background: var(--c-primary);
  border-radius: 50%;
  box-shadow: 0 0 12px var(--c-primary);
  animation: pulse 2s ease infinite;
}
.logo-ai { color: var(--c-primary-lit); }

/* Hero */
.hero { 
  padding-top: clamp(60px, 10vh, 120px); 
  padding-bottom: clamp(60px, 10vh, 120px); 
  position: relative; 
  text-align: center;
}
.hero-inner {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.hero-badge { margin-bottom: 24px; font-size: 0.72rem; }
.hero-sub {
  font-size: clamp(1rem, 2vw, 1.2rem);
  color: var(--c-text-muted);
  margin-top: 20px;
  max-width: 600px;
  line-height: 1.8;
}
.gradient-text {
  background: linear-gradient(135deg, #ffb3c1 0%, var(--c-primary) 50%, #f4a261 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-cta { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 36px; justify-content: center; }

.join-panel { max-width: 480px; width: 100%; }
.join-row { display: flex; gap: 12px; }
.error-text { color: #e36a7c; font-size: 0.82rem; }

/* Hero visual */
/* Hero visual - adjusted for centered layout */
.hero-visual {
  position: absolute;
  right: -100px;
  top: 50%;
  transform: translateY(-50%);
  width: 450px;
  height: 450px;
  pointer-events: none;
  z-index: 0;
  opacity: 0.15; /* Subtler background glow when centered */
  filter: blur(40px);
}
@media (max-width: 1200px) { .hero-visual { display: none; } }

.mockup-ring {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: float-mesh 10s infinite alternate ease-in-out;
}
.ring-svg { width: 100%; height: 100%; position: absolute; inset: 0; }
.ring-progress { transition: stroke-dashoffset 1s ease; }
.ring-time {
  font-size: 3rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.04em;
  position: relative;
  z-index: 1;
  line-height: 1;
}
.ring-label {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.8rem;
  color: var(--c-text-muted);
  white-space: nowrap;
}

/* Features */
.mb-section { margin-bottom: 80px; }
.features-section { background: linear-gradient(180deg, transparent, rgba(138,21,56,0.04), transparent); }
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  margin-top: 40px;
  justify-content: center;
}
.feature-card { padding: 28px; transition: transform 0.2s, box-shadow 0.2s; }
.feature-card:hover { transform: translateY(-4px); box-shadow: 0 8px 36px rgba(0,0,0,0.4); }
.feature-icon { font-size: 2.5rem; margin-bottom: 20px; }
.feature-card h3 { margin-bottom: 8px; font-size: 1rem; }
.feature-card p { font-size: 0.88rem; line-height: 1.6; }

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1px;
  background: var(--c-border);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  overflow: hidden;
}
.stat-block {
  background: var(--c-bg-2);
  padding: 40px 24px;
  text-align: center;
}
.stat-val {
  font-size: 2.6rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  background: linear-gradient(135deg, #fff, var(--c-primary-lit));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.stat-label { font-size: 0.82rem; color: var(--c-text-muted); margin-top: 4px; }

/* Pricing */
.pricing-section { background: rgba(138,21,56,0.02); }
.pricing-toggle { display: flex; align-items: center; justify-content: center; gap: 16px; font-weight: 600; font-size: 0.9rem; }
.pricing-toggle span { color: var(--c-text-faint); transition: color 0.3s; }
.pricing-toggle span.active { color: var(--c-text); }
.toggle-bg { width: 50px; height: 26px; background: var(--c-bg-3); border: 1px solid var(--c-border); border-radius: 20px; position: relative; cursor: pointer; }
.toggle-circle { width: 18px; height: 18px; background: var(--c-primary); border-radius: 50%; position: absolute; top: 3px; left: 4px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 0 10px var(--c-primary-glo); }
.toggle-circle.right { transform: translateX(24px); }

/* FAQ Section */
.faq-section { position: relative; z-index: 10; padding-bottom: 120px; }
.faq-inner { max-width: 800px; margin: 0 auto; }
.faq-list { display: flex; flex-direction: column; gap: 16px; margin-top: 40px; }
.faq-item { padding: 0; cursor: pointer; border-radius: var(--r-lg); overflow: hidden; }
.faq-question { display: flex; justify-content: space-between; align-items: center; padding: 24px; transition: background 0.3s; }
.faq-question:hover { background: rgba(255,255,255,0.02); }
.faq-question h3 { margin: 0; font-size: 1.1rem; font-weight: 600; }
.chevron { transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1); }
.faq-item.active .chevron { transform: rotate(180deg); }
.faq-answer-wrapper { overflow: hidden; transition: max-height 0.4s cubic-bezier(0.25, 1, 0.5, 1); }
.faq-answer { padding: 0 24px 24px 24px; color: var(--c-text-muted); line-height: 1.7; border-top: 1px dashed rgba(255,255,255,0.05); margin-top: 10px; padding-top: 16px; }

.pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-top: 48px; align-items: stretch; }
.pricing-card { position: relative; padding: 40px 32px; display: flex; flex-direction: column; }
.card--featured { border: 1px solid var(--c-primary); box-shadow: 0 0 40px rgba(138,21,56,0.15); }
.featured-badge { position: absolute; top: 0; left: 50%; transform: translate(-50%, -50%); background: var(--c-primary); color: #fff; font-size: 0.65rem; font-weight: 900; padding: 4px 12px; border-radius: 20px; letter-spacing: 0.05em; }

.plan-name { font-size: 1.4rem; font-weight: 800; margin-bottom: 8px; }
.plan-desc { font-size: 0.88rem; color: var(--c-text-muted); margin-bottom: 24px; min-height: 40px; }
.plan-price { display: flex; align-items: baseline; gap: 4px; margin-bottom: 4px; }
.currency { font-size: 1.2rem; font-weight: 700; color: var(--c-text-muted); }
.amount { font-size: 3rem; font-weight: 900; letter-spacing: -0.04em; }
.period { font-size: 1rem; color: var(--c-text-faint); }
.plan-savings { font-size: 0.8rem; font-weight: 700; color: #2ecc71; margin-bottom: 24px; height: 20px; }

.plan-features { list-style: none; padding: 0; margin: 32px 0 0; display: flex; flex-direction: column; gap: 14px; flex-grow: 1; }
.feature-item { display: flex; align-items: center; gap: 12px; font-size: 0.88rem; color: var(--c-text-muted); }
.check-icon { color: var(--c-primary-lit); flex-shrink: 0; }

.pricing-extra { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
@media (max-width: 768px) { .pricing-extra { grid-template-columns: 1fr; } }
.enterprise-card { background: linear-gradient(135deg, rgba(52,152,219,0.05) 0%, rgba(138,21,56,0.05) 100%); }
.extra-content { padding: 32px; }
.extra-footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
.extra-price { font-size: 1.1rem; font-weight: 800; }
.extra-price small { font-size: 0.75rem; color: var(--c-text-faint); font-weight: 400; }

.btn-full { width: 100%; justify-content: center; padding: 14px; border-radius: 12px; font-weight: 700; }

/* CTA */
.cta-section {
  background: radial-gradient(ellipse at center, rgba(138,21,56,0.15) 0%, transparent 70%);
}

/* Footer */
.footer {
  border-top: 1px solid var(--c-border);
  padding: 40px 0;
}
.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.footer-inner p { font-size: 0.82rem; }

/* Problem & Solution */
.problem-solution-section {
  background: radial-gradient(circle at 10% 20%, rgba(230, 57, 70, 0.03) 0%, transparent 40%),
              radial-gradient(circle at 90% 80%, rgba(69, 123, 157, 0.03) 0%, transparent 40%);
}

.section-sub {
  color: var(--c-text-muted);
  font-size: 1.1rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}

.problem-block { text-align: center; margin-bottom: 80px; }
.solution-block { text-align: center; }

.problem-grid, .solution-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  text-align: left;
}

.problem-card, .solution-card {
  padding: 32px;
  border: 1px solid rgba(255,255,255,0.03);
}

.problem-header, .solution-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.problem-icon, .solution-icon {
  font-size: 1.5rem;
}

.problem-header h3, .solution-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.text-danger {
  color: #e63946;
  text-shadow: 0 0 15px rgba(230, 57, 70, 0.3);
}

.badge-error {
  background: rgba(230, 57, 70, 0.1);
  color: #e63946;
  border: 1px solid rgba(230, 57, 70, 0.2);
}

.problem-card:hover {
  border-color: rgba(230, 57, 70, 0.2);
  transform: translateY(-4px);
  background: rgba(230, 57, 70, 0.02);
}

.solution-card:hover {
  border-color: rgba(69, 123, 157, 0.2);
  transform: translateY(-4px);
  background: rgba(69, 123, 157, 0.02);
}

/* Integrations Section */
.integrations-section {
  background: linear-gradient(180deg, transparent, rgba(69, 123, 157, 0.04), transparent);
}

.integrations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
  margin-top: 48px;
}

.integration-card {
  padding: 40px;
  text-align: center;
  border: 1px solid rgba(255,255,255,0.03);
}

.integration-logo {
  width: 80px;
  height: 80px;
  background: rgba(255,255,255,0.02);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: var(--c-primary-lit);
  border: 1px solid rgba(255,255,255,0.05);
  transition: all 0.3s;
}

.integration-card:hover .integration-logo {
  transform: scale(1.1) rotate(5deg);
  background: rgba(230, 57, 70, 0.08);
  border-color: rgba(230, 57, 70, 0.2);
  box-shadow: 0 0 30px rgba(230, 57, 70, 0.15);
}

.integration-card h3 {
  margin-bottom: 12px;
  font-size: 1.25rem;
}

.integration-card p {
  font-size: 0.95rem;
  line-height: 1.7;
}
</style>
