'use client';

import { BNISelectOption } from '@/lib/types';

interface SelectFormProps {
  selectedOption: BNISelectOption;
  onSelect: (option: BNISelectOption) => void;
  disabled?: boolean;
}

export default function SelectForm({ selectedOption, onSelect, disabled }: SelectFormProps) {
  const options: { value: BNISelectOption; label: string; description: string }[] = [
    {
      value: 'BNI全般',
      label: 'BNI全般',
      description: 'BNIのルールや規定について質問できます'
    },
    {
      value: 'SILVISチャプター',
      label: 'SILVISチャプター',
      description: 'SILVISチャプター特有のルールについて質問できます'
    },
    {
      value: 'エデュケーション何でも教える君',
      label: 'エデュケーション何でも教える君',
      description: '学習コンテンツの作成支援を受けられます'
    }
  ];

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
        質問のカテゴリーを選んでください
      </h2>
      
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            disabled={disabled}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
              selectedOption === option.value
                ? 'border-bni-primary bg-bni-primary text-white'
                : 'border-gray-200 bg-white text-gray-700 hover:border-bni-secondary hover:bg-bni-secondary hover:text-white'
            } ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <div className="font-medium mb-1">{option.label}</div>
            <div className={`text-sm ${
              selectedOption === option.value ? 'text-green-100' : 'text-gray-500'
            }`}>
              {option.description}
            </div>
          </button>
        ))}
      </div>
      
      {selectedOption && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-bni-primary">
            ✓ {selectedOption} を選択しました
          </p>
        </div>
      )}
    </div>
  );
}