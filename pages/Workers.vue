<template>
  <div class="page-wrapper">
    <div
      class="page-header"
      style="display: flex; align-items: center; justify-content: space-between"
    >
      <div>
        <div class="page-title">⚙ Workers</div>
        <div class="page-subtitle">WAHA worker process management</div>
      </div>
      <div>
        <button class="btn-ghost" @click="loadWorkers">⟳ Refresh</button>
      </div>
    </div>

    <div v-if="loading && workers.length === 0" class="empty-state">
      <div class="empty-state-icon">⟳</div>
      <div class="empty-state-text">Loading workers…</div>
    </div>

    <div v-else-if="workers.length === 0" class="empty-state">
      <div class="empty-state-icon">⚙</div>
      <div class="empty-state-text">No workers available.</div>
    </div>

    <div v-else class="grid-4 stagger">
      <div
        v-for="worker in workers"
        :key="worker.name"
        class="worker-card card"
      >
        <div class="worker-card-top">
          <div class="worker-name">{{ worker.name }}</div>
          <span class="badge" :class="statusClass(worker.status)">
            <span class="badge-dot" />{{ worker.status }}
          </span>
        </div>

        <div v-if="hasExtraFields(worker)" class="worker-details">
          <div
            v-for="(val, key) in extraFields(worker)"
            :key="key"
            class="detail-row"
          >
            <span class="detail-key">{{ key }}:</span>
            <span class="detail-val">{{ val }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useWahaApi } from "~/composables/useWahaApi";
import { useToast } from "~/composables/useToast";

interface WorkerInfo {
  name: string;
  status: string;
  [key: string]: any;
}

const { get } = useWahaApi();
const { error } = useToast();

const workers = ref<WorkerInfo[]>([]);
const loading = ref(true);

function statusClass(status: string): string {
  const s = status.toUpperCase();
  if (s === "WORKING" || s === "ONLINE" || s === "RUNNING")
    return "badge-working";
  if (s === "STOPPED" || s === "OFFLINE") return "badge-stopped";
  if (s === "FAILED" || s === "ERROR") return "badge-failed";
  return "badge-stopped";
}

function hasExtraFields(worker: WorkerInfo): boolean {
  return Object.keys(extraFields(worker)).length > 0;
}

function extraFields(worker: WorkerInfo): Record<string, any> {
  const { name, status, ...rest } = worker;
  return rest;
}

async function loadWorkers() {
  try {
    const data = await get<WorkerInfo[]>("/api/workers");
    workers.value = Array.isArray(data) ? data : [];
  } catch (err: any) {
    // If it's a 404, we just assume no workers available, not necessarily an error
    if (err?.response?.status === 404) {
      workers.value = [];
    } else {
      error("Failed to load workers");
    }
  } finally {
    loading.value = false;
  }
}

let pollTimer: ReturnType<typeof setInterval> | null = null;

onMounted(async () => {
  await loadWorkers();
  pollTimer = setInterval(loadWorkers, 15000);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<style scoped>
.worker-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.worker-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.worker-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  word-break: break-all;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  display: inline-block;
  margin-right: 6px;
}

.worker-details {
  border-top: 1px solid var(--border);
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.detail-key {
  color: var(--text-dim);
  text-transform: capitalize;
}

.detail-val {
  color: var(--text-muted);
  font-family: var(--font-mono, monospace);
  word-break: break-all;
  max-width: 60%;
  text-align: right;
}
</style>
