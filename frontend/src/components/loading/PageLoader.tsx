import Spinner from './Spinner';

const PageLoader = () => (
  <div className="flex h-64 w-full items-center justify-center">
    <Spinner size={32} />
  </div>
);

export default PageLoader;
