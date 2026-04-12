<template>
  <div class="page-wrapper">
    <div class="page-header">
      <div class="page-title">◎ Sessions</div>
      <div class="page-subtitle">WAHA Core session management</div>
    </div>
    <div class="upstream-frame-wrap">
      <iframe :src="upstreamUrl" class="upstream-frame" frameborder="0" />
    </div>
  </div>
</template>

<script setup lang="ts">
const upstreamUrl = computed(() =>
  typeof window !== "undefined"
    ? `${window.location.origin}/dashboard/#/Sessions`
    : "/#/Sessions",
);
</script>

<style scoped>
.upstream-frame-wrap {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  height: calc(100vh - 160px);
}

.upstream-frame {
  width: 100%;
  height: 100%;
  background: var(--bg);
}
</style>
