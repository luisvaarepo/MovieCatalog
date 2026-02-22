import useSWR from 'swr';
import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { fetcher } from '../../lib/api';

// Movie detail page. Fetches the movie resource by id and displays
// basic information, actors and ratings. Uses SWR for caching and
// revalidation behavior.
export default function MovieDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { data, error } = useSWR(id ? `/movies/${id}` : null, fetcher);

  return (
    <Layout>
      {error && (
        <div className="text-red-600">
          {/* Friendly messages for common not-found cases */}
          {String(error?.message || error).toLowerCase().includes('not found') ?
            'Movie not found' : `Failed to load: ${String(error?.message || 'Unknown error')}`}
        </div>
      )}

      {/* Only show loading when there is no error and data is missing */}
      {!error && !data && <div>Loading...</div>}

      {data && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">{data.title}</h2>
          <p>{data.description}</p>

          <div>
            <h3 className="font-medium">Actors</h3>
            <ul className="list-disc pl-6">
              {data.actors?.map((a: any) => (
                <li key={a.id}>
                  <Link href={'/actors/' + a.id}>{a.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-medium">Ratings</h3>
            <ul className="list-disc pl-6">
              {data.ratings?.map((r: any, idx: number) => (
                <li key={idx}>{r.score} - {r.review ?? 'No review'}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Layout>
  );
}
