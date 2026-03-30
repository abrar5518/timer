<template>
  <div class="error-page noise">
    <div class="text-center">
      <h1 class="gradient-text">404</h1>
      <p>Room or page not found.</p>
      <div class="mt-4">
        <router-link to="/" class="btn btn-primary">Back to Safety</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
h1 { font-size: 6rem; line-height: 1; }
.gradient-text {
  background: linear-gradient(135deg, #c0392b 0%, #8a1538 50%, #c0392b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
