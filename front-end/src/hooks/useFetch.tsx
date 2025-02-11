import { useCallback, useEffect, useState } from 'react';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';

export interface iResposseData {
  [key: string]: any,
  message: string
}
interface iUseApiResponse {
  loading: boolean;
  request: (config?: AxiosRequestConfig) => Promise<requestReturnType>;
}

interface iFetchImediate<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

type errorResponseData = {
  error: {
    message: string
  },
  status: string
};

type requestReturnType = {
  data: iResposseData | null,
  error: string | null,
}

const axiosInstance = axios.create({
  withCredentials: true,
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const useFetch = (url: string): iUseApiResponse => {
  const [loading, setLoading] = useState(false);

  const request = useCallback(async (config: AxiosRequestConfig = {}): Promise<requestReturnType> => {
    setLoading(true)
    const result: requestReturnType = {
      error: null,
      data: null
    };
    try {
      const response = await axiosInstance.request({
        method: 'GET',
        url,
        headers: {
          'Content-Type': 'application/json'
        },
        ...config
      });
      result.data = response.data.data;
    } catch (error) {
      const { response } = error as AxiosError;
      const errorMessage = (response?.data as errorResponseData)?.error?.message || 'Something went wrong!';
      result.error = errorMessage;
    } finally {
      setLoading(false);
      return { ...result };
    }
  }, [url]);

  return { loading, request };
};

export const useFetchImediate = (url: string, config: AxiosRequestConfig = {}): iFetchImediate<iResposseData> => {
  const [state, setState] = useState<{
    loading: boolean;
    error: string | null;
    data: iResposseData | null;
  }>({
    loading: false,
    error: null,
    data: null,
  });

  useEffect(() => {
    setState(prev => ({ ...prev, loading: true }));
    axiosInstance
      .request({
        method: 'GET',
        url,
        headers: {
          'Content-Type': 'application/json'
        },
        ...config
      })
      .then(response => {
        setState({ loading: false, error: null, data: response.data.data });
      }).catch(error => {
        const { response } = error as AxiosError;
        const errorMessage = (response?.data as errorResponseData)?.error?.message || 'Something went wrong!';
        setState({ loading: false, error: errorMessage, data: null });
      });
  }, []);

  return { ...state };
};

export const useSearchDebounce = (url: string, searchQuery: string): iFetchImediate<iResposseData> => {
  const [state, setState] = useState<{
    loading: boolean;
    error: string | null;
    data: iResposseData | null;
  }>({
    loading: false,
    error: null,
    data: null,
  });

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 4) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }
    const timer = setTimeout(() => {
      setState(prev => ({ ...prev, loading: true }));
      axiosInstance
        .request({
          method: 'GET',
          url: `${url}/${searchQuery}`,
          headers: {
            'Content-Type': 'application/json'
          },
        })
        .then(response => {
          setState({ loading: false, error: null, data: response.data.data });
        }).catch(error => {
          const { response } = error as AxiosError;
          const errorMessage = (response?.data as errorResponseData)?.error?.message || 'Something went wrong!';
          setState({ loading: false, error: errorMessage, data: null });
        });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return { ...state };
};

export default useFetch;
