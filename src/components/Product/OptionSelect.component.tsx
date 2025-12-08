"use client";

interface OptionSelectProps {
  title: string;
  options: string[];
  current?: string;
  updateOption: (value: string) => void;
  disabled?: boolean;
  "data-testid"?: string;
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  title,
  options,
  current,
  updateOption,
  "data-testid": dataTestId,
  disabled,
}) => {
  // Filter out empty or invalid options
  const validOptions = options?.filter((opt) => {
    const str = String(opt || '').trim();
    return str.length > 0;
  }) || [];

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('OptionSelect debug:', {
      title,
      options,
      validOptions,
      current,
    });
  }

  if (validOptions.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('OptionSelect: No valid options found for', title);
    }
    return null;
  }

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm text-gray-700">Select {title}</span>
      <div
        className="flex flex-wrap gap-2"
        data-testid={dataTestId}
      >
        {validOptions.map((value) => {
          const trimmedValue = String(value).trim();
          const isSelected = trimmedValue === current;
          
          return (
            <button
              onClick={() => !disabled && updateOption(trimmedValue)}
              key={trimmedValue}
              type="button"
              className={`border text-sm h-10 rounded-full px-4 min-w-[80px] transition-all font-medium ${
                isSelected
                  ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                  : "border-gray-300 bg-white text-gray-900 hover:border-gray-900 hover:bg-gray-50 hover:shadow-sm"
              } ${
                disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
              disabled={disabled}
              data-testid="option-button"
            >
              {trimmedValue || value}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OptionSelect;

