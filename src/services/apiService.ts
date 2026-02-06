import axios, { AxiosError } from 'axios';
import { getCached, setCached } from '../utils/cache';

type ApiOptions = {
  cacheKey?: string;
  ttl?: number;
};

export async function fetchApi<T = any>(
  url: string,
  options: ApiOptions = {}
): Promise<T> {
  const { cacheKey = url, ttl = 60_000 } = options;

  const cached = getCached<T>(cacheKey);
  if (cached) return cached;

  try {
    const res = await axios.get<T>(url);
    setCached(cacheKey, res.data, ttl);
    return res.data;
  } catch (error) {
    const err = error as AxiosError;

    // 🔍 IMPORTANT: log the real error
    console.error(
      'API ERROR:',
      err.response?.data || err.message
    );

    if (err.response?.status === 429) {
      throw new Error('Rate limit exceeded. Try again later.');
    }

    throw new Error(
      err.response?.data
        ? JSON.stringify(err.response.data)
        : 'Failed to fetch financial data'
    );
  }
}
