import { useState, useEffect } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import Layout from '../../components/Layout';
import SearchBar from '../../components/SearchBar';
import { fetcher } from '../../lib/api';

// Actors listing page with simple search and pagination. The component
// supports two shapes of API response: a plain array of actors or a paged
// response `{ items, total }` which keeps the UI flexible for different
// backends.
export default function ActorsPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);

  // Build the appropriate URL depending on whether a search query is present
  const url = q ? '/actors/search?q=' + encodeURIComponent(q) + '&page=' + page + '&limit=' + limit : '/actors?page=' + page + '&limit=' + limit;
  const { data, error } = useSWR(url, fetcher);

  // Detect whether the API returned a paged response or a plain array
  const isPaged = !!(data && !Array.isArray(data) && typeof (data as any).total === 'number');
  // Normalize response to `items` and `total` to support both response shapes
  const items = Array.isArray(data) ? data : (data && (data as any).items ? (data as any).items : []);
  const total = isPaged ? (data as any).total : items.length;
  const totalPages = isPaged ? Math.max(1, Math.ceil(total / limit)) : 1;

  // Reset page to 1 only when the server provides paged responses and the
  // current page is beyond the available range (e.g. after changing page size)
  useEffect(() => {
    if (isPaged && page > totalPages) setPage(1);
  }, [isPaged, totalPages]);

  const goTo = (p: number) => setPage(Math.max(1, Math.min(totalPages, p)));

  return (
    <Layout>
      <div>
        <h2>Actors</h2>

        {/* Search bar lifts the query up and resets to the first page */}
        <SearchBar onSearch={(s: string) => { setQ(s); setPage(1); }} />

        {error && <div>Failed to load: {String((error as any)?.message || error)}</div>}
        {!data && <div>Loading...</div>}

        {items && (
          <div className="h-96 overflow-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px', width: '40%' }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '8px', width: '60%' }}>Movies</th>
                </tr>
              </thead>
              <tbody>
                {items.map((a: any) => (
                  <tr key={a.id}>
                    <td style={{ padding: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <Link href={'/actors/' + a.id}>{a.name}</Link>
                    </td>
                    <td style={{ padding: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.movies && a.movies.length ? (
                        a.movies.map((m: any, idx: number) => (
                          <span key={m.id}>
                            <Link href={'/movies/' + m.id}>{m.title}</Link>
                            {idx < a.movies.length - 1 ? ', ' : ''}
                          </span>
                        ))
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* When the API returned an unexpected shape show the raw response */}
        {data && (!items || items.length === 0) && (
          <div style={{ marginTop: 12 }}>
            <strong>Response preview:</strong>
            <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto' }}>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}

        {/* Pagination controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>Page {page} of {totalPages} - {total} items</div>

          <div>
            <label>Page size: </label>
            <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
              {[5, 10, 20, 50].map(s => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>

          <div>
            <button
              onClick={() => goTo(page - 1)}
              disabled={page <= 1}
              className={`mx-1 px-3 py-1 rounded ${page <= 1 ? 'opacity-50 cursor-not-allowed' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
              Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 10) }).map((_, i) => {
              const p = i + 1;
              const active = p === page;
              return (
                <button
                  key={p}
                  onClick={() => goTo(p)}
                  disabled={active}
                  className={`mx-1 px-3 py-1 rounded ${active ? 'bg-blue-600 text-white' : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => goTo(page + 1)}
              disabled={page >= totalPages}
              className={`mx-1 px-3 py-1 rounded ${page >= totalPages ? 'opacity-50 cursor-not-allowed' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
              Next
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
