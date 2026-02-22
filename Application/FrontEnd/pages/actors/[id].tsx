import useSWR from 'swr';
import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { fetcher } from '../../lib/api';

// Actor detail page. Loads the actor resource and a separate list of movies
// for the actor. Using two SWR hooks keeps the requests independent so the
// movies list can load after the actor resource if one of the endpoints is
// slower.
export default function ActorDetail() {
  const router = useRouter();
  const { id } = router.query;

  // Only fetch when `id` is available from the router
  const { data, error } = useSWR(id ? `/actors/${id}` : null, fetcher);
  const { data: moviesData } = useSWR(id ? `/actors/${id}/movies` : null, fetcher);

  return (
    <Layout>
      {error && (
        <div className="text-red-600">
          {String(error?.message || error).toLowerCase().includes('not found') ?
            'Actor not found' : `Failed to load: ${String(error?.message || 'Unknown error')}`}
        </div>
      )}

      {!error && !data && <div>Loading...</div>}

      {data && (
        <div className="space-y-4">
          {/* Actor name */}
          <h2 className="text-2xl font-semibold">{data.name}</h2>

          {/* Movies list fetched separately */}
          <div>
            <h3 className="font-medium">Movies</h3>
            {!moviesData && <div>Loading...</div>}
            {moviesData && (
              <ul className="list-disc pl-6">
                {moviesData.map((m: any) => (
                  <li key={m.id}>
                    <Link href={'/movies/' + m.id}>{m.title}</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
