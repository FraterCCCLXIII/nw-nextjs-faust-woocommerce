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
  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm text-gray-700">Select {title}</span>
      <div
        className="flex flex-wrap justify-between gap-2"
        data-testid={dataTestId}
      >
        {options.map((value) => {
          const isSelected = value === current;
          return (
            <button
              onClick={() => updateOption(value)}
              key={value}
              className={`border text-sm h-10 rounded-full px-4 flex-1 transition-all ${
                isSelected
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-300 bg-gray-50 text-gray-900 hover:border-gray-900 hover:shadow-sm"
              }`}
              disabled={disabled}
              data-testid="option-button"
            >
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OptionSelect;

