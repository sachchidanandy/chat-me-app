import { useCallback, useEffect, useState } from 'react';
import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';

interface iUseApiResponse<T> {
  data: T | null;
  error: AxiosError | null;
  loading: boolean;
  request: (config?: AxiosRequestConfig) => Promise<void>;
}

interface iUseFetchImediateResponse<T> {
  data: T | null;
  error: AxiosError | null;
  loading: boolean;
}

const axiosInstance = axios.create({
  withCredentials: true,
  baseURL: 'http://localhost:5000/api/',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const useFetch = (url: string): iUseApiResponse<AxiosResponse> => {
  const [state, setState] = useState<{
    loading: boolean;
    error: AxiosError | null;
    data: AxiosResponse | null;
  }>({
    loading: false,
    error: null,
    data: null,
  });

  const request = useCallback(async (config: AxiosRequestConfig = {}) => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      const response = await axiosInstance.request({
        method: 'GET',
        url,
        headers: {
          'Content-Type': 'application/json'
        },
        ...config
      });
      setState({ loading: false, error: null, data: response.data });
    } catch (error) {
      setState({ loading: false, error: error as AxiosError, data: null });
    }
  }, [url]);

  return { ...state, request };
};

export const useFetchImediate = (url: string, config: AxiosRequestConfig = {}): iUseFetchImediateResponse<AxiosResponse> => {
  const [state, setState] = useState<{
    loading: boolean;
    error: AxiosError | null;
    data: AxiosResponse | null;
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
        setState({ loading: false, error: null, data: response.data });
      }).catch(error => {
        setState({ loading: false, error: error as AxiosError, data: null });
      });
  }, []);

  return { ...state };
};

export default useFetch;
