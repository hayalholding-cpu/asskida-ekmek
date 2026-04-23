const DEFAULT_API_BASE = "https://api.ekmek.com.tr";
const API_BASE = (process.env.EXPO_PUBLIC_API_URL?.trim() || DEFAULT_API_BASE).replace(
  /\/+$/,
  ""
);

type RequestOptions = RequestInit & {
  bodyJson?: unknown;
  timeoutMs?: number;
};

export type DeliverProductType = "ekmek" | "pide";
export type DeliverSource = "bakery-panel" | "tabela-mode";

export type DeliverSuspendedProductPayload = {
  bakeryId: string;
  productType: DeliverProductType;
  count?: number;
  source?: DeliverSource;
  note?: string;
};

export type DeliverSuspendedProductResponse = {
  ok: boolean;
  message: string;
  data?: {
    bakeryId: string;
    bakeryName: string;
    city?: string;
    district?: string;
    neighborhood?: string;
    productType: DeliverProductType;
    source: DeliverSource;
    count: number;
    pendingBefore: number;
    pendingAfter: number;
    deliveredBefore: number;
    deliveredAfter: number;
  };
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { bodyJson, headers, timeoutMs = 60000, ...rest } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `${API_BASE}${path}`;

    console.log("[API BASE]", API_BASE);
    console.log("[API REQUEST]", rest.method || "GET", url, bodyJson ?? null);

    const response = await fetch(url, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(headers || {}),
      },
      body: bodyJson !== undefined ? JSON.stringify(bodyJson) : rest.body,
      signal: controller.signal,
    });

    const text = await response.text();

    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    console.log("[API RESPONSE]", rest.method || "GET", url, response.status, data);

    if (!response.ok) {
      const message =
        (data && typeof data === "object" && (data.message || data.error)) ||
        `API ${response.status}`;
      throw new Error(String(message));
    }

    return data as T;
  } catch (error: any) {
    if (error?.name === "AbortError") {
      console.log("[API ERROR TIMEOUT]", path);
      throw new Error("Sunucu zamanında cevap vermedi. İstek zaman aşımına uğradı.");
    }

    console.log("[API ERROR]", path, error);
    throw new Error(error?.message || "Ağ bağlantısı veya sunucu hatası oluştu.");
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: "GET" });
}

export async function apiPost<T>(path: string, bodyJson?: unknown): Promise<T> {
  return request<T>(path, { method: "POST", bodyJson });
}

async function wakeBackend() {
  try {
    console.log("[WAKE BACKEND] başladı");
    await request("/", { method: "GET", timeoutMs: 60000 });
    console.log("[WAKE BACKEND] başarılı");
  } catch (error) {
    console.log("[WAKE BACKEND] hata", error);
    throw error;
  }
}

export async function deliverSuspendedProduct(
  payload: DeliverSuspendedProductPayload
): Promise<DeliverSuspendedProductResponse> {
  const bakeryId = String(payload?.bakeryId || "").trim();
  const productType = payload?.productType;
  const count = Math.max(1, Number(payload?.count || 1));
  const source = payload?.source || "bakery-panel";
  const note = String(payload?.note || "").trim();

  if (!bakeryId) {
    throw new Error("bakeryId zorunlu");
  }

  if (productType !== "ekmek" && productType !== "pide") {
    throw new Error("productType yalnızca 'ekmek' veya 'pide' olabilir");
  }

  if (source !== "bakery-panel" && source !== "tabela-mode") {
    throw new Error("source yalnızca 'bakery-panel' veya 'tabela-mode' olabilir");
  }

  console.log("[deliverSuspendedProduct] payload", {
    bakeryId,
    productType,
    count,
    source,
    note,
  });

  await wakeBackend();

  return apiPost<DeliverSuspendedProductResponse>("/bakery/deliver", {
    bakeryId,
    productType,
    count,
    source,
    note,
  });
}

export const API = {
  mobileCities: () => apiGet("/mobile/cities"),

  mobileDistricts: (cityCode: number | string) =>
    apiGet(`/mobile/districts?cityCode=${encodeURIComponent(String(cityCode))}`),

  mobileNeighborhoods: (districtSlug: string) =>
    apiGet(
      `/mobile/neighborhoods?districtSlug=${encodeURIComponent(
        String(districtSlug)
      )}`
    ),

  mobileBakeries: (params: {
    cityCode?: number | string;
    districtCode?: number | string;
    neighborhoodCode?: number | string;
  }) => {
    const search = new URLSearchParams();

    if (params.cityCode !== undefined && params.cityCode !== null) {
      search.append("cityCode", String(params.cityCode));
    }
    if (params.districtCode !== undefined && params.districtCode !== null) {
      search.append("districtCode", String(params.districtCode));
    }
    if (params.neighborhoodCode !== undefined && params.neighborhoodCode !== null) {
      search.append("neighborhoodCode", String(params.neighborhoodCode));
    }

    const query = search.toString();
    return apiGet(`/mobile/bakeries${query ? `?${query}` : ""}`);
  },

  mobileProducts: () => apiGet("/mobile/products"),

  mobilePaymentComplete: (payload: any) =>
    apiPost("/mobile/payment-complete", payload),

  deliverSuspendedProduct: (payload: DeliverSuspendedProductPayload) =>
    deliverSuspendedProduct(payload),
};

export default API;
