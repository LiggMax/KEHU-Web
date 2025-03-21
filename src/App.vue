<script setup>
import NavBar from './components/NavBar.vue'
</script>

<template>
  <div class="app">
    <NavBar />
    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<style>
.app {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.main-content {
  padding-top: 60px;
  flex: 1;
  width: 100%;
}
</style>
