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

// https://www.algolia.com/doc/api-reference/widgets/instantsearch/react/

/**
 * Displays Algolia search for larger resolutions that do not show the mobile menu
 */
const AlgoliaSearchBox = () => {
  const [search, setSearch] = useState<string | null>(null);
  const [hasFocus, sethasFocus] = useState<boolean>(false);
  const algoliaConfigured = useMemo(() => isAlgoliaConfigured(), []);

  // Don't render if Algolia is not configured
  if (!algoliaConfigured) {
    return null;
  }

  return (
    <div className="hidden mt-2 md:inline xl:inline">
      <div className="">
        <InstantSearch
          indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!}
          searchClient={searchClient}
        >
          {/*We need to conditionally add a border because the element has position:fixed*/}
          <SearchBox
            aria-label="Search here"
            translations={{
              submitTitle: 'Search',
              resetTitle: 'Clear search text',
              placeholder: 'Search for products',
            }}
            className={`px-4 py-2 text-base bg-white border outline-none rounded ${
              hasFocus ? 'border-black' : 'border-gray-400'
            }`}
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
            onReset={() => {
              setSearch(null);
            }}
          />
          {search && (
            <div className="absolute z-50 bg-white shadow-lg rounded-md mt-1 md:w-[18rem]">
              <Hits hitComponent={SearchResults} />
            </div>
          )}
        </InstantSearch>
      </div>
    </div>
  );
};

export default AlgoliaSearchBox;
