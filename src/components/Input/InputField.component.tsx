import { FieldValues, useFormContext, UseFormRegister } from 'react-hook-form';

interface ICustomValidation {
  required?: boolean;
  minlength?: number;
}

interface IErrors {}

export interface IInputRootObject {
  inputLabel: string;
  inputName: string;
  customValidation: ICustomValidation;
  errors?: IErrors;
  register?: UseFormRegister<FieldValues>;
  type?: string;
  className?: string;
  showLabel?: boolean;
}

/**
 * Input field component displays a text input in a form, with label.
 * The various properties of the input field can be determined with the props:
 * @param {ICustomValidation} [customValidation] - the validation rules to apply to the input field
 * @param {IErrors} errors - the form errors object provided by react-hook-form
 * @param {string} inputLabel - used for the display label
 * @param {string} inputName - the key of the value in the submitted data. Must be unique
 * @param {UseFormRegister<FieldValues>} register - register function from react-hook-form
 * @param {boolean} [required=true] - whether or not this field is required. default true
 * @param {string} [type='text'] - the input type. defaults to text
 */
export const InputField = ({
  customValidation,
  inputLabel,
  inputName,
  type,
  className = '',
  showLabel = false,
}: IInputRootObject) => {
  const { register, formState: { errors } } = useFormContext();

  // Convert HTML attributes to React props
  const reactProps: any = {};
  if (customValidation) {
    Object.keys(customValidation).forEach((key) => {
      // Convert minlength to minLength for React
      if (key === 'minlength') {
        reactProps.minLength = customValidation.minlength;
      } else {
        reactProps[key] = customValidation[key as keyof typeof customValidation];
      }
    });
  }

  const fieldError = errors[inputName];

  return (
    <div className={`${className || 'flex-1'}`}>
      {showLabel && (
        <label htmlFor={inputName} className="block text-sm text-gray-600 mb-1">
          {inputLabel}
        </label>
      )}
      <input
        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-black focus:border-black block w-full px-3 py-2 placeholder-gray-400"
        id={inputName}
        placeholder={inputLabel}
        type={type ?? 'text'}
        {...reactProps}
        {...register(inputName)}
      />
      {fieldError && (
        <p className="text-red-600 text-xs mt-1">{fieldError.message as string}</p>
      )}
    </div>
  );
};
