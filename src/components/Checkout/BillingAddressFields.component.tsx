"use client";

import { useFormContext } from 'react-hook-form';
import { InputField } from '@/components/Input/InputField.component';
import { INPUT_FIELDS } from '@/utils/constants/INPUT_FIELDS';

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

/**
 * Billing address fields component
 * Shows when user unchecks "Billing address is same as shipping"
 */
const BillingAddressFields = () => {
  const { watch, register, formState: { errors } } = useFormContext();
  const billingSameAsShipping = watch('billingSameAsShipping') ?? true;

  if (billingSameAsShipping) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="text-sm text-gray-600 mb-3">Billing address</div>
      
      <div className="space-y-3">
        {/* Address - Full Width */}
        {INPUT_FIELDS.filter(field => field.name === 'address1').map(({ id, label, name, customValidation }) => (
          <InputField
            key={`billing-${id}`}
            inputLabel={label}
            inputName={`billing${name.charAt(0).toUpperCase() + name.slice(1)}`}
            customValidation={customValidation}
            className="w-full"
          />
        ))}

        {/* City, State, and Postal Code - Side by Side */}
        <div className="flex gap-3">
          {INPUT_FIELDS.filter(field => field.name === 'city').map(({ id, label, name, customValidation }) => (
            <InputField
              key={`billing-${id}`}
              inputLabel={label}
              inputName={`billing${name.charAt(0).toUpperCase() + name.slice(1)}`}
              customValidation={customValidation}
            />
          ))}
          <div className="flex-1 relative">
            <select
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-black focus:border-black block w-full pl-3 pr-10 py-2 appearance-none cursor-pointer"
              {...register('billingState', {
                required: 'State is required'
              })}
            >
              <option value="">State</option>
              {US_STATES.map((state) => (
                <option key={state.value} value={state.value}>{state.value}</option>
              ))}
            </select>
            {/* Dropdown Arrow */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {errors.billingState && (
              <p className="text-red-600 text-xs mt-1">{errors.billingState.message as string}</p>
            )}
          </div>
          {INPUT_FIELDS.filter(field => field.name === 'postcode').map(({ id, label, name, customValidation }) => (
            <InputField
              key={`billing-${id}`}
              inputLabel={label}
              inputName={`billing${name.charAt(0).toUpperCase() + name.slice(1)}`}
              customValidation={customValidation}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BillingAddressFields;

