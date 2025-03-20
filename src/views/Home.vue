<script setup>
</script>

<template>
  <div class="home">
    <section class="hero">
      <h1>欢迎来到我们的网站</h1>
      <p class="subtitle">为您提供最优质的服务和解决方案</p>
    </section>

    <section class="features">
      <h2>产品特性</h2>
      <div class="feature-grid">
        <div class="feature-card">
          <h3>高效便捷</h3>
          <p>快速响应您的需求，提供便捷的解决方案</p>
        </div>
        <div class="feature-card">
          <h3>专业可靠</h3>
          <p>专业团队支持，确保服务质量</p>
        </div>
        <div class="feature-card">
          <h3>创新科技</h3>
          <p>采用最新技术，引领行业发展</p>
        </div>
      </div>
    </section>

    <section class="news">
      <h2>最新动态</h2>
      <div class="news-list">
        <div class="news-item">
          <h3>新产品发布</h3>
          <p>我们最新的产品线已经上线，为您带来更好的体验</p>
          <span class="date">2024-01-20</span>
        </div>
        <div class="news-item">
          <h3>技术升级</h3>
          <p>系统全面升级，性能显著提升</p>
          <span class="date">2024-01-15</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  padding-top: 4rem;
}

.hero {
  text-align: center;
  padding: 4rem 2rem;
  background-color: #f8f9fa;
}

.hero h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.2rem;
  color: #666;
}

.features {
  padding: 4rem 2rem;
  text-align: center;
}

.features h2 {
  margin-bottom: 3rem;
  color: #333;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.feature-card h3 {
  color: #333;
  margin-bottom: 1rem;
}

.feature-card p {
  color: #666;
}

.news {
  padding: 4rem 2rem;
  background-color: #f8f9fa;
}

.news h2 {
  text-align: center;
  margin-bottom: 3rem;
  color: #333;
}

.news-list {
  max-width: 800px;
  margin: 0 auto;
}

.news-item {
  background: white;
  padding: 2rem;
  margin-bottom: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.news-item h3 {
  color: #333;
  margin-bottom: 1rem;
}

.news-item p {
  color: #666;
  margin-bottom: 1rem;
}

.date {
  color: #999;
  font-size: 0.9rem;
}
</style>
