const API_BASE =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.104:4000";

type RequestOptions = RequestInit & {
  bodyJson?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { bodyJson, headers, ...rest } = options;

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    body: bodyJson !== undefined ? JSON.stringify(bodyJson) : rest.body,
  });

  const text = await response.text();

  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.message || data.error)) ||
      `API ${response.status}`;
    throw new Error(String(message));
  }

  return data as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: "GET" });
}

export async function apiPost<T>(path: string, bodyJson?: unknown): Promise<T> {
  return request<T>(path, { method: "POST", bodyJson });
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
};

export default API;