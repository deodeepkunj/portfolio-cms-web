import { useState } from 'react';

export const useBlogApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createBlog = async (blogData: any) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blogData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create blog');
      }

      return data.blog;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getBlogs = async (status?: string, page = 1, limit = 10) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await fetch(`/api/blogs?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch blogs');
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getBlogById = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/blogs/${id}?mode=cms`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch blog');
      }

      return data.blog;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBlog = async (id: string, blogData: any) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blogData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update blog');
      }

      return data.blog;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBlog = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete blog');
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createBlog,
    getBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
  };
};