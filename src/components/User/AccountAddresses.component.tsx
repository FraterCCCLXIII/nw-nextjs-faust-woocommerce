import { useQuery, useMutation } from '@apollo/client';
import { useState, useEffect } from 'react';
// import { getApolloAuthClient } from '@faustwp/core'; // Removed Faust.js auth client
import { GET_CURRENT_USER } from '@/utils/gql/GQL_QUERIES';
import { UPDATE_CUSTOMER } from '@/utils/gql/GQL_MUTATIONS';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.component';

// US States with their codes
const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
];

interface AddressFormData {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  postcode: string;
  country: string;
  state: string;
  email?: string;
  phone?: string;
}

const AccountAddresses = () => {
  // const authClient = getApolloAuthClient(); // Removed Faust.js auth client
  
  const { data, loading, error, refetch } = useQuery(GET_CURRENT_USER, {
    // client: authClient, // Removed client specific to Faust.js auth
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  });

  const [updateCustomer, { loading: updating }] = useMutation(UPDATE_CUSTOMER, {
    // client: authClient, // Removed client specific to Faust.js auth
  });

  const [editingAddress, setEditingAddress] = useState<'billing' | 'shipping' | null>(null);
  const [billingForm, setBillingForm] = useState<AddressFormData>({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    postcode: '',
    country: 'US',
    state: '',
    email: '',
    phone: '',
  });
  const [shippingForm, setShippingForm] = useState<AddressFormData>({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    postcode: '',
    country: 'US',
    state: '',
  });
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const customer = data?.customer;

  // Initialize forms when customer data loads (using useEffect to avoid render issues)
  useEffect(() => {
    if (customer && billingForm.firstName === '' && customer.billing) {
      setBillingForm({
        firstName: customer.billing.firstName || customer.firstName || '',
        lastName: customer.billing.lastName || customer.lastName || '',
        address1: customer.billing.address1 || '',
        address2: customer.billing.address2 || '',
        city: customer.billing.city || '',
        postcode: customer.billing.postcode || '',
        country: customer.billing.country || 'US',
        state: customer.billing.state || '',
        email: customer.billing.email || customer.email || '',
        phone: customer.billing.phone || '',
      });
    }
  }, [customer]);

  useEffect(() => {
    if (customer && shippingForm.firstName === '' && customer.shipping) {
      setShippingForm({
        firstName: customer.shipping.firstName || customer.firstName || '',
        lastName: customer.shipping.lastName || customer.lastName || '',
        address1: customer.shipping.address1 || '',
        address2: customer.shipping.address2 || '',
        city: customer.shipping.city || '',
        postcode: customer.shipping.postcode || '',
        country: customer.shipping.country || 'US',
        state: customer.shipping.state || '',
      });
    }
  }, [customer]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !customer) {
    return (
      <div className="woocommerce-MyAccount-content">
        <p className="text-red-600">Error loading addresses. Please try again later.</p>
      </div>
    );
  }

  const handleAddressSubmit = async (type: 'billing' | 'shipping') => {
    setUpdateMessage(null);
    setUpdateError(null);

    try {
      const input: any = {};
      
      // Prepare address data - only include non-empty fields
      if (type === 'billing') {
        input.billing = {
          firstName: billingForm.firstName || '',
          lastName: billingForm.lastName || '',
          address1: billingForm.address1 || '',
          address2: billingForm.address2 || '',
          city: billingForm.city || '',
          postcode: billingForm.postcode || '',
          country: billingForm.country || '',
          state: billingForm.state || '',
          email: billingForm.email || '',
          phone: billingForm.phone || '',
        };
      } else {
        input.shipping = {
          firstName: shippingForm.firstName || '',
          lastName: shippingForm.lastName || '',
          address1: shippingForm.address1 || '',
          address2: shippingForm.address2 || '',
          city: shippingForm.city || '',
          postcode: shippingForm.postcode || '',
          country: shippingForm.country || '',
          state: shippingForm.state || '',
        };
      }

      console.log(`[AccountAddresses] Updating ${type} address with input:`, JSON.stringify(input, null, 2));

      const { data: updateData, errors } = await updateCustomer({
        variables: { input },
      });

      console.log(`[AccountAddresses] Update ${type} address response:`, {
        hasData: !!updateData,
        hasErrors: !!errors,
        errors: errors?.map((e: any) => e.message),
        customer: updateData?.updateCustomer?.customer,
      });

      if (errors && errors.length > 0) {
        const errorMessages = errors.map((e: any) => e.message).join(', ');
        console.error(`[AccountAddresses] GraphQL errors updating ${type} address:`, errorMessages);
        setUpdateError(errorMessages || `Failed to update ${type} address. Please try again.`);
        return;
      }

      if (updateData?.updateCustomer?.customer) {
        setUpdateMessage(`${type === 'billing' ? 'Billing' : 'Shipping'} address updated successfully!`);
        setEditingAddress(null);
        await refetch();
      } else {
        console.error(`[AccountAddresses] No customer data in response for ${type} address update`);
        setUpdateError(`Failed to update ${type} address. Please try again.`);
      }
    } catch (err: any) {
      console.error(`[AccountAddresses] Error updating ${type} address:`, err);
      console.error(`[AccountAddresses] Error details:`, {
        message: err.message,
        graphQLErrors: err.graphQLErrors,
        networkError: err.networkError,
      });
      
      // Extract more detailed error message
      let errorMessage = err.message || `Failed to update ${type} address. Please try again.`;
      if (err.graphQLErrors && err.graphQLErrors.length > 0) {
        errorMessage = err.graphQLErrors.map((e: any) => e.message).join(', ');
      } else if (err.networkError) {
        errorMessage = err.networkError.message || errorMessage;
      }
      
      setUpdateError(errorMessage);
    }
  };

  const hasBillingAddress = customer.billing?.address1;
  const hasShippingAddress = customer.shipping?.address1;

  return (
    <div className="woocommerce-MyAccount-content">
      <h2 className="text-2xl font-bold mb-6">Addresses</h2>
      <p className="text-sm text-gray-600 mb-6">
        The following addresses will be used on the checkout page by default.
      </p>

      {updateMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg">{updateMessage}</div>
      )}
      {updateError && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg">{updateError}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Billing Address */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Billing address</h3>
            {editingAddress !== 'billing' && (
              <button
                onClick={() => setEditingAddress('billing')}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                {hasBillingAddress ? 'Edit' : 'Add'}
              </button>
            )}
          </div>

          {editingAddress === 'billing' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddressSubmit('billing');
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                  <input
                    type="text"
                    value={billingForm.firstName}
                    onChange={(e) => setBillingForm({ ...billingForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                  <input
                    type="text"
                    value={billingForm.lastName}
                    onChange={(e) => setBillingForm({ ...billingForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address line 1</label>
                <input
                  type="text"
                  value={billingForm.address1}
                  onChange={(e) => setBillingForm({ ...billingForm, address1: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address line 2</label>
                <input
                  type="text"
                  value={billingForm.address2}
                  onChange={(e) => setBillingForm({ ...billingForm, address2: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={billingForm.city}
                    onChange={(e) => setBillingForm({ ...billingForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
                  <input
                    type="text"
                    value={billingForm.postcode}
                    onChange={(e) => setBillingForm({ ...billingForm, postcode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <select
                    value={billingForm.country}
                    onChange={(e) => setBillingForm({ ...billingForm, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    required
                  >
                    <option value="US">United States</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <select
                    value={billingForm.state}
                    onChange={(e) => setBillingForm({ ...billingForm, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Select a state</option>
                    {US_STATES.map((state) => (
                      <option key={state.code} value={state.code}>
                        {state.code} - {state.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={billingForm.email}
                    onChange={(e) => setBillingForm({ ...billingForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={billingForm.phone}
                    onChange={(e) => setBillingForm({ ...billingForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save address'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingAddress(null);
                    setUpdateMessage(null);
                    setUpdateError(null);
                  }}
                  disabled={updating}
                  className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="text-sm text-gray-600">
              {hasBillingAddress ? (
                <address className="not-italic">
                  {customer.billing.firstName} {customer.billing.lastName}
                  <br />
                  {customer.billing.address1}
                  {customer.billing.address2 && (
                    <>
                      <br />
                      {customer.billing.address2}
                    </>
                  )}
                  <br />
                  {customer.billing.city}, {customer.billing.postcode}
                  {customer.billing.state && (
                    <>
                      <br />
                      {customer.billing.state}
                    </>
                  )}
                  <br />
                  {customer.billing.country}
                  {customer.billing.email && (
                    <>
                      <br />
                      <br />
                      Email: {customer.billing.email}
                    </>
                  )}
                  {customer.billing.phone && (
                    <>
                      <br />
                      Phone: {customer.billing.phone}
                    </>
                  )}
                </address>
              ) : (
                <p>You have not set up this type of address yet.</p>
              )}
            </div>
          )}
        </div>

        {/* Shipping Address */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Shipping address</h3>
            {editingAddress !== 'shipping' && (
              <button
                onClick={() => setEditingAddress('shipping')}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                {hasShippingAddress ? 'Edit' : 'Add'}
              </button>
            )}
          </div>

          {editingAddress === 'shipping' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddressSubmit('shipping');
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                  <input
                    type="text"
                    value={shippingForm.firstName}
                    onChange={(e) => setShippingForm({ ...shippingForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                  <input
                    type="text"
                    value={shippingForm.lastName}
                    onChange={(e) => setShippingForm({ ...shippingForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address line 1</label>
                <input
                  type="text"
                  value={shippingForm.address1}
                  onChange={(e) => setShippingForm({ ...shippingForm, address1: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address line 2</label>
                <input
                  type="text"
                  value={shippingForm.address2}
                  onChange={(e) => setShippingForm({ ...shippingForm, address2: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={shippingForm.city}
                    onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
                  <input
                    type="text"
                    value={shippingForm.postcode}
                    onChange={(e) => setShippingForm({ ...shippingForm, postcode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <select
                    value={shippingForm.country}
                    onChange={(e) => setShippingForm({ ...shippingForm, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    required
                  >
                    <option value="US">United States</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <select
                    value={shippingForm.state}
                    onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Select a state</option>
                    {US_STATES.map((state) => (
                      <option key={state.code} value={state.code}>
                        {state.code} - {state.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save address'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingAddress(null);
                    setUpdateMessage(null);
                    setUpdateError(null);
                  }}
                  disabled={updating}
                  className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="text-sm text-gray-600">
              {hasShippingAddress ? (
                <address className="not-italic">
                  {customer.shipping.firstName} {customer.shipping.lastName}
                  <br />
                  {customer.shipping.address1}
                  {customer.shipping.address2 && (
                    <>
                      <br />
                      {customer.shipping.address2}
                    </>
                  )}
                  <br />
                  {customer.shipping.city}, {customer.shipping.postcode}
                  {customer.shipping.state && (
                    <>
                      <br />
                      {customer.shipping.state}
                    </>
                  )}
                  <br />
                  {customer.shipping.country}
                </address>
              ) : (
                <p>You have not set up this type of address yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountAddresses;

