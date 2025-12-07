const ProductDisclaimer = () => {
  return (
    <div className="w-full mt-12 pt-8 border-t border-gray-200">
      <div className="bg-gray-50 rounded-lg p-6 md:p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Product Information Disclaimer
        </h3>
        <div className="text-sm text-gray-700 leading-relaxed space-y-4">
          <p>
            Product information, descriptions, and specifications are provided for informational
            purposes only. While we strive to ensure accuracy, we cannot guarantee that all
            information is complete, current, or error-free. Product images are for illustrative
            purposes and may not reflect the exact appearance of the product.
          </p>
          <p>
            Please refer to the actual product packaging and documentation for the most current
            information, usage instructions, and safety guidelines. We recommend consulting product
            documentation or contacting our support team if you have specific questions about
            product compatibility, usage, or safety.
          </p>
          <p>
            We reserve the right to correct any errors, inaccuracies, or omissions and to change
            or update information at any time without prior notice. This disclaimer applies to all product
            information provided on our website.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDisclaimer;

