import React from "react";
import clsx from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, id, error, className, ...props }) => {
  const inputClasses = clsx(
    "block w-full px-4 py-2 border rounded-md shadow-sm transition duration-150 ease-in-out",
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
    {
      "border-red-500 text-red-600 focus:ring-red-500 focus:border-red-500": error,
      "border-gray-300": !error,
    },
    className
  );

  return (
    <div className="w-full">
      <label htmlFor={id} className="block mb-1 text-sm font-medium text-gray-700">
        {label}
      </label>
      <input id={id} className={inputClasses} {...props} />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};