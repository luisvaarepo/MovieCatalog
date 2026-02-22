import React, { useState } from 'react';

// Simple, reusable search bar used by the actors listing page. The component
// is controlled internally and calls `onSearch` when the form is submitted.
// It intentionally avoids baggage like debouncing to keep the demo simple.
type Props = {
  onSearch: (q: string) => void;
  placeholder?: string;
};

export default function SearchBar({ onSearch, placeholder }: Props) {
  const [value, setValue] = useState('');

  // Called when the form is submitted. Prevents navigation and forwards the
  // current input value to the parent via the `onSearch` callback.
  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    onSearch(value);
  }

  return (
    <form onSubmit={submit} className="flex items-center space-x-2" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder || 'Search actors...'}
        className="border rounded px-3 py-2 flex-1"
        aria-label="Search"
        style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
      />
      <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded" style={{ background: '#2563eb', color: '#fff', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: 'none' }}>
        Search
      </button>
    </form>
  );
}
