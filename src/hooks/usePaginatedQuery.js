import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function usePaginatedQuery(table, selectQuery, pageSize = 20, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase.from(table).select(selectQuery, { count: 'exact' });
      
      if (options.orderBy) {
        query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? true });
      }

      if (options.filters) {
        Object.entries(options.filters).forEach(([col, val]) => {
          query = query.eq(col, val);
        });
      }

      const from = page * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data: resultData, count, error: queryError } = await query;
      
      if (queryError) throw queryError;
      
      setData(resultData || []);
      setTotalCount(count || 0);
      setHasMore(count !== null && to < count - 1);
    } catch (err) {
      setError(err);
      console.error(`Pagination error on ${table}:`, err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, table, selectQuery, JSON.stringify(options)]);

  const nextPage = () => {
    if (hasMore) setPage(p => p + 1);
  };

  const prevPage = () => {
    if (page > 0) setPage(p => p - 1);
  };
  
  const refresh = () => {
    fetchData();
  };

  return { data, loading, error, page, hasMore, totalCount, nextPage, prevPage, refresh };
}
