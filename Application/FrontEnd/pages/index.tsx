import Link from 'next/link';
import Layout from '../components/Layout';

// Homepage with a simple hero and action buttons styled using Tailwind CSS.
export default function HomePage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">Movie Catalog</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Browse a small demo catalog of movies and actors. Supports search, pagination and a lightweight authentication flow.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
          <Link href="/movies" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow">Browse Movies</Link>
          <Link href="/actors" className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md shadow">Browse Actors</Link>
          <Link href="/login" className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">Login</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-1">Search</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Quickly find movies or actors by name.</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-1">Pagination</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Browse large lists with simple pagination controls.</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-1">Authentication</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Optional login to access protected actions.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
