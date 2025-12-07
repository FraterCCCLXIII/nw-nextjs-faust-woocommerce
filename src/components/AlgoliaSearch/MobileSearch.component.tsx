import algoliasearch from 'algoliasearch';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch-dom';
import { useState, useMemo } from 'react';

import SearchResults from './SearchResults.component';

// Check if Algolia credentials are configured
const isAlgoliaConfigured = () => {
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
  const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_PUBLIC_API_KEY;
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME;
  
  return !!(
    appId && 
    appId !== 'changeme' && 
    appId !== 'changethis' &&
    apiKey && 
    apiKey !== 'changeme' && 
    apiKey !== 'changethis' &&
    indexName && 
    indexName !== 'changeme'
  );
};

// Create a mock search client that returns empty results when Algolia is not configured
const createMockSearchClient = () => ({
  search: async () => ({
    results: [{
      hits: [],
      nbHits: 0,
      nbPages: 0,
      page: 0,
      hitsPerPage: 0,
      processingTimeMS: 0,
      query: '',
      params: '',
    }],
  }),
});

const searchClient = isAlgoliaConfigured()
  ? algoliasearch(
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
      process.env.NEXT_PUBLIC_ALGOLIA_PUBLIC_API_KEY!,
    )
  : createMockSearchClient();

/**
 * Algolia search for mobile menu.
 */
const MobileSearch = () => {
  const [search, setSearch] = useState<string | null>(null);
  const [hasFocus, sethasFocus] = useState<boolean>(false);
  const algoliaConfigured = useMemo(() => isAlgoliaConfigured(), []);

  // Don't render if Algolia is not configured
  if (!algoliaConfigured) {
    return null;
  }

  return (
    <div className="inline mt-4 md:hidden">
      <InstantSearch
        indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!}
        searchClient={searchClient}
      >
        <SearchBox
          translations={{
            submitTitle: 'Search',
            resetTitle: 'Clear search text',
            placeholder: 'Search for products',
          }}
          className={`px-4 py-2 text-base bg-white border outline-none rounded ${
            hasFocus ? 'border-black' : 'border-gray-400'
          }`}
          onReset={() => {
            setSearch(null);
          }}
          onChange={(event) => {
            const target = event.target as HTMLInputElement;
            sethasFocus(true);
            setSearch(target.value);
          }}
          onKeyDown={(event) => {
            const target = event.target as HTMLInputElement;
            sethasFocus(true);
            setSearch(target.value);
          }}
        />
        {search && <Hits hitComponent={SearchResults} />}
      </InstantSearch>
    </div>
  );
};

export default MobileSearch;
