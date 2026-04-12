export interface WahaConfig {
  apiKey: string;
  baseUrl: string;
}

const apiKey = useState<string>("waha_api_key", () => "");
const baseUrl = useState<string>("waha_base_url", () => "");
let initPromise: Promise<void> | null = null;

export function useWahaApi() {
  async function init(): Promise<void> {
    if (apiKey.value) return;
    if (initPromise) return initPromise;
    initPromise = fetchConfig();
    return initPromise;
  }

  async function fetchConfig(): Promise<void> {
    try {
      const data = await $fetch<WahaConfig>("/api/dashboard/config");
      apiKey.value = data.apiKey || "";
      baseUrl.value =
        typeof window !== "undefined" ? window.location.origin : "";
    } catch (err: unknown) {
      // 401 = not logged in → redirect to login page
      const status =
        err &&
        typeof err === "object" &&
        "status" in err &&
        typeof (err as { status: unknown }).status === "number"
          ? (err as { status: number }).status
          : 0;
      if (status === 401 && typeof window !== "undefined") {
        window.location.href = "/dashboard/login.html";
        return;
      }
      baseUrl.value =
        typeof window !== "undefined" ? window.location.origin : "";
    }
  }

  function headers(): Record<string, string> {
    return apiKey.value ? { "X-Api-Key": apiKey.value } : {};
  }

  function authHeaders(): Record<string, string> {
    return apiKey.value ? { Authorization: `Bearer ${apiKey.value}` } : {};
  }

  async function get<T>(path: string): Promise<T> {
    await init();
    return $fetch<T>(path, { headers: headers() });
  }

  async function post<T>(path: string, body?: unknown): Promise<T> {
    await init();
    return $fetch<T>(path, {
      method: "POST",
      headers: headers(),
      body: body as Record<string, unknown>,
    });
  }

  async function put<T>(path: string, body?: unknown): Promise<T> {
    await init();
    return $fetch<T>(path, {
      method: "PUT",
      headers: headers(),
      body: body as Record<string, unknown>,
    });
  }

  async function del<T>(path: string): Promise<T> {
    await init();
    return $fetch<T>(path, { method: "DELETE", headers: headers() });
  }

  return {
    apiKey: readonly(apiKey),
    baseUrl: readonly(baseUrl),
    init,
    headers,
    authHeaders,
    get,
    post,
    put,
    del,
  };
}
