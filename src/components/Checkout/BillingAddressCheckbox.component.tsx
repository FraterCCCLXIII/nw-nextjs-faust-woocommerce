"use client";

import { useFormContext } from 'react-hook-form';

/**
 * Checkbox to indicate billing address is same as shipping
 */
const BillingAddressCheckbox = () => {
  const { register, watch, setValue } = useFormContext();
  const billingSameAsShipping = watch('billingSameAsShipping') ?? true;

  return (
    <div className="mb-6">
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          {...register('billingSameAsShipping')}
          defaultChecked={true}
          className="h-4 w-4 cursor-pointer accent-black"
        />
        <span className="ml-2 text-sm text-gray-700">
          Billing address is same as shipping
        </span>
      </label>
    </div>
  );
};

export default BillingAddressCheckbox;

