import Link from 'next/link';
import { convertTextToHtml } from '@/utils/functions/productUtils';

interface ProductInfoProps {
  product: {
    name: string;
    shortDescription?: string;
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
  const shortDescription = product.shortDescription;
  const htmlContent = shortDescription ? convertTextToHtml(shortDescription) : '';

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

        {htmlContent && (
          <div
            className="product-detail-content text-gray-600"
            data-testid="product-description"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )}
      </div>
    </div>
  );
};

export default ProductInfo;

