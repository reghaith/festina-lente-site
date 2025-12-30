import { useState, useEffect } from 'react';

export interface UserExp {
  total_exp: number;
  current_level: number;
  exp_to_next_level: number;
  last_exp_change_reason?: string;
  last_updated?: string;
}

export function useExp(userId: string | null) {
  const [exp, setExp] = useState<UserExp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExp = async () => {
    if (!userId) {
      setExp(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/exp?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setExp(data.exp);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch EXP');
      }
    } catch (err) {
      setError('Network error while fetching EXP');
      console.error('EXP fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateExp = async (expChange: number, reason: string, actionId?: string) => {
    if (!userId) return { success: false, error: 'No user ID' };

    try {
      const response = await fetch('/api/exp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          expChange,
          reason,
          actionId
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state immediately for responsive UI
        setExp(data.exp);
        return { success: true, exp: data.exp };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error('EXP update error:', err);
      return { success: false, error: 'Network error while updating EXP' };
    }
  };

  useEffect(() => {
    fetchExp();
  }, [userId]);

  return {
    exp,
    loading,
    error,
    fetchExp,
    updateExp
  };
}