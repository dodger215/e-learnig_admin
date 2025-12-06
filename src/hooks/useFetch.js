import { useState, useEffect, useCallback, useRef } from 'react';
import { notification } from 'antd';

export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const abortControllerRef = useRef(null);

  const fetchData = useCallback(async (customUrl = null, customOptions = {}) => {
    const fetchUrl = customUrl || url;
    const fetchOptions = { ...options, ...customOptions };
    
    if (!fetchUrl) return;

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setLoading(true);
    setStatus('loading');
    setError(null);

    try {
      const response = await fetch(fetchUrl, {
        ...fetchOptions,
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          ...fetchOptions.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      setStatus('success');
      return result;
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }
      
      setError(err);
      setStatus('error');
      
      // Auto show notification for errors
      if (options.showErrorNotification !== false) {
        notification.error({
          message: 'Request Failed',
          description: err.message || 'Something went wrong',
          placement: 'topRight',
        });
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  const refresh = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  const post = useCallback(async (postUrl, postData) => {
    return fetchData(postUrl, {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }, [fetchData]);

  const put = useCallback(async (putUrl, putData) => {
    return fetchData(putUrl, {
      method: 'PUT',
      body: JSON.stringify(putData),
    });
  }, [fetchData]);

  const del = useCallback(async (deleteUrl) => {
    return fetchData(deleteUrl, {
      method: 'DELETE',
    });
  }, [fetchData]);

  useEffect(() => {
    if (options.autoFetch !== false && url) {
      fetchData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, url, options.autoFetch]);

  return {
    data,
    loading,
    error,
    status,
    fetchData,
    refresh,
    post,
    put,
    delete: del,
    setData, 
  };
};