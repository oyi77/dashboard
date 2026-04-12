<template>
  <div class="page-wrapper">
    <div class="page-header">
      <div class="page-title">◈ Engines</div>
      <div class="page-subtitle">
        Compare and choose the right WhatsApp engine
      </div>
    </div>

    <div class="engines-grid stagger">
      <div
        v-for="eng in engineCards"
        :key="eng.name"
        class="engine-card card"
        :class="`engine-border-${eng.name.toLowerCase()}`"
      >
        <div class="engine-header">
          <span class="badge" :class="`engine-${eng.name.toLowerCase()}`">{{
            eng.name
          }}</span>
          <span class="engine-stars">{{ eng.stars }}</span>
        </div>
        <div class="engine-tagline">{{ eng.tagline }}</div>
        <ul class="engine-features">
          <li v-for="f in eng.features" :key="f">{{ f }}</li>
        </ul>
        <button
          class="btn-secondary"
          style="width: 100%; margin-top: auto"
          @click="openCreate(eng.name)"
        >
          Create Session
        </button>
      </div>
    </div>

    <div class="section-title" style="margin-top: 32px">Comparison</div>
    <div class="card" style="padding: 0; overflow: hidden; overflow-x: auto">
      <table>
        <thead>
          <tr>
            <th>Feature</th>
            <th v-for="eng in engineCards" :key="eng.name">
              <span class="badge" :class="`engine-${eng.name.toLowerCase()}`">{{
                eng.name
              }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in comparisonRows" :key="row.feature">
            <td>{{ row.feature }}</td>
            <td v-for="eng in engineCards" :key="eng.name">
              <span v-if="row[eng.name] === true">✓</span>
              <span
                v-else-if="row[eng.name] === false"
                style="color: var(--text-dim)"
                >—</span
              >
              <span v-else style="font-size: 12px; color: var(--text-muted)">{{
                row[eng.name]
              }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section-title" style="margin-top: 32px">Active Sessions</div>
    <div v-if="sessions.length === 0" class="empty-state">
      <div class="empty-state-text">No sessions</div>
    </div>
    <div v-else class="sessions-list">
      <div v-for="s in sessions" :key="s.name" class="session-row card">
        <span style="font-weight: 500; color: var(--text)">{{ s.name }}</span>
        <span
          class="badge"
          :class="`engine-${(s.engine ?? 'noweb').toLowerCase()}`"
          >{{ s.engine }}</span
        >
        <span class="badge" :class="statusClass(s.status)">{{ s.status }}</span>
      </div>
    </div>

    <div
      v-if="showCreate"
      class="modal-overlay"
      @click.self="showCreate = false"
    >
      <div class="modal-box">
        <div class="modal-title">
          Create Session with {{ createForm.engine }}
        </div>
        <div class="form-group">
          <label class="form-label">Session Name</label>
          <input v-model="createForm.name" placeholder="default" />
        </div>
        <div style="display: flex; gap: 10px; margin-top: 20px">
          <button
            class="btn-secondary"
            style="flex: 1"
            @click="showCreate = false"
          >
            Cancel
          </button>
          <button class="btn-primary" style="flex: 1" @click="createSession">
            Create
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Session {
  name: string;
  status: string;
  engine?: string;
}

const { get, post } = useWahaApi();
const { success, error } = useToast();

const sessions = ref<Session[]>([]);
const showCreate = ref(false);
const createForm = reactive({ name: "", engine: "" });

const engineCards = [
  {
    name: "NOWEB",
    stars: "⭐⭐⭐⭐⭐",
    tagline: "Lightweight, no browser required",
    features: [
      "Runs without Chromium",
      "Low memory usage",
      "Best for cloud/VPS",
      "Multi-device",
    ],
  },
  {
    name: "WEBJS",
    stars: "⭐⭐⭐⭐",
    tagline: "Chromium-based, battle-tested",
    features: [
      "Browser-based automation",
      "High compatibility",
      "Mature ecosystem",
      "Multi-device",
    ],
  },
  {
    name: "WPP",
    stars: "⭐⭐⭐",
    tagline: "WPPConnect-based engine",
    features: [
      "WPPConnect compatible",
      "Chromium-based",
      "Extra API surface",
      "Multi-device",
    ],
  },
  {
    name: "GOWS",
    stars: "⭐⭐⭐",
    tagline: "Go-based, experimental",
    features: [
      "Written in Go",
      "Minimal footprint",
      "Fast startup",
      "Experimental",
    ],
  },
];

const comparisonRows: Record<string, unknown>[] = [
  { feature: "No Chromium", NOWEB: true, WEBJS: false, WPP: false, GOWS: true },
  {
    feature: "Memory usage",
    NOWEB: "Low",
    WEBJS: "High",
    WPP: "High",
    GOWS: "Very Low",
  },
  {
    feature: "Stability",
    NOWEB: "High",
    WEBJS: "Very High",
    WPP: "Medium",
    GOWS: "Experimental",
  },
  { feature: "Multi-device", NOWEB: true, WEBJS: true, WPP: true, GOWS: true },
  {
    feature: "Voice calls",
    NOWEB: false,
    WEBJS: false,
    WPP: false,
    GOWS: false,
  },
  { feature: "Status", NOWEB: "✓", WEBJS: "✓", WPP: "✓", GOWS: "✓" },
  { feature: "Polls", NOWEB: true, WEBJS: false, WPP: false, GOWS: true },
  { feature: "Reactions", NOWEB: true, WEBJS: true, WPP: true, GOWS: true },
];

function statusClass(status: string): string {
  const map: Record<string, string> = {
    WORKING: "badge-working",
    STARTING: "badge-starting",
    SCAN_QR_CODE: "badge-scan",
    STOPPED: "badge-stopped",
    FAILED: "badge-failed",
  };
  return map[status] ?? "badge-stopped";
}

function openCreate(engine: string) {
  createForm.engine = engine;
  createForm.name = "";
  showCreate.value = true;
}

async function createSession() {
  try {
    await post("/api/sessions", {
      name: createForm.name || "default",
      engine: createForm.engine,
    });
    success("Session created");
    showCreate.value = false;
    await loadSessions();
  } catch {
    error("Failed to create session");
  }
}

async function loadSessions() {
  try {
    const data = await get<Session[]>("/api/sessions?all=true");
    sessions.value = data;
  } catch {}
}

onMounted(loadSessions);
</script>
