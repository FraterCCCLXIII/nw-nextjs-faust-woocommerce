/**
 * Loading spinner, shows while loading products or categories.
 * Black circular spinner without grey track.
 */
const LoadingSpinner = () => (
  <div className="w-full h-full flex justify-center items-center p-4 mt-2">
    <div role="status" aria-label="Loading">
      <div className="animate-spin rounded-full w-12 h-12 border-4 border-transparent border-t-black border-r-black"></div>
      <span className="sr-only">Loading...</span>
    </div>
  </div>
);

export default LoadingSpinner;
