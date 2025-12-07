import Link from 'next/link';
import { cleanHtmlFromText } from '@/utils/functions/productUtils';

interface ProductInfoProps {
  product: {
    name: string;
    description?: string;
    productCategories?: {
      nodes?: Array<{
        name: string;
        slug: string;
      }>;
    };
  };
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const collection = product.productCategories?.nodes?.[0];
  const cleanDescription = cleanHtmlFromText(product.description);

  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4">
        {collection && (
          <Link
            href={`/category/${collection.slug}`}
            className="text-base text-gray-600 hover:text-gray-900 transition-colors"
          >
            {collection.name}
          </Link>
        )}
        <h2
          className="text-3xl leading-10 text-gray-900 font-chakra-petch"
          data-testid="product-title"
        >
          {product.name}
        </h2>

        {cleanDescription && (
          <p
            className="text-base text-gray-600 whitespace-pre-line"
            data-testid="product-description"
          >
            {cleanDescription}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductInfo;

