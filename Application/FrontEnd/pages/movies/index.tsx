import { useState, useEffect } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import Layout from '../../components/Layout';
import SearchBar from '../../components/SearchBar';
import { fetcher } from '../../lib/api';

// Movies listing page with pagination. Similar to the actors page, it
// supports both array and paged response formats for flexibility.
export default function MoviesPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);

  const url = q ? '/movies/search?q=' + encodeURIComponent(q) + '&page=' + page + '&limit=' + limit : '/movies?page=' + page + '&limit=' + limit;
  const { data, error } = useSWR(url, fetcher);

  // Normalize either array or paged response
  const isPaged = !!(data && !Array.isArray(data) && typeof (data as any).total === 'number');
  const items = Array.isArray(data) ? data : (data && (data as any).items ? (data as any).items : []);
  const total = isPaged ? (data as any).total : items.length;
  const totalPages = isPaged ? Math.max(1, Math.ceil(total / limit)) : 1;

  // Only adjust page when server provides paged responses. If the API
  // returns a plain array we treat it as a single page and avoid
  // jumping back to page 1 which could cause duplicate requests.
  useEffect(() => {
    if (isPaged && page > totalPages) setPage(1);
  }, [isPaged, totalPages]);

  const goTo = (p: number) => setPage(Math.max(1, Math.min(totalPages, p)));

  return (
    <Layout>
      <div>
        <h2>Movies</h2>

        {/* Search bar lifts query and resets page */}
        <SearchBar onSearch={(s: string) => { setQ(s); setPage(1); }} placeholder="Search movies..." />
        {error && <div>Failed to load: {String((error as any)?.message || error)}</div>}
        {!data && <div>Loading...</div>}

        {items && (
          <div className="h-96 overflow-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px', width: '45%' }}>Title</th>
                  <th style={{ textAlign: 'left', padding: '8px', width: '40%' }}>Actors</th>
                  <th style={{ textAlign: 'left', padding: '8px', width: '15%' }}>Ratings</th>
                </tr>
              </thead>
              <tbody>
                {items.map((m: any) => {
                  // Compute basic rating stats for display
                  const ratingCount = m.ratings && m.ratings.length ? m.ratings.length : 0;
                  const avg = ratingCount
                    ? (m.ratings.reduce((s: number, r: any) => s + (r.score || 0), 0) / ratingCount).toFixed(1)
                    : null;
                  return (
                    <tr key={m.id}>
                      <td style={{ padding: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <Link href={'/movies/' + m.id}>{m.title}</Link>
                      </td>
                      <td style={{ padding: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.actors && m.actors.length ? (
                          m.actors.map((a: any, idx: number) => (
                            <span key={a.id ?? idx}>
                              <Link href={'/actors/' + a.id}>{a.name}</Link>
                              {idx < m.actors.length - 1 ? ', ' : ''}
                            </span>
                          ))
                        ) : (
                          '-'
                        )}
                      </td>
                      <td style={{ padding: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ratingCount ? ratingCount + ' (avg ' + avg + ')' : 'No ratings'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Debug output for unexpected API responses */}
        {data && (!items || items.length === 0) && (
          <div style={{ marginTop: 12 }}>
            <strong>Response preview:</strong>
            <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto' }}>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}

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
