'use client';

import React from 'react';
import { LanguageState } from '@/types/echosphere';
import { formatLanguageLabel } from '@/lib/echosphere/language';
import { Globe, ArrowLeftRight } from 'lucide-react';

interface LanguageIndicatorProps {
  language: LanguageState;
}

export function LanguageIndicator({ language }: LanguageIndicatorProps) {
  const label = formatLanguageLabel(language);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary shadow-sm backdrop-blur-sm">
      <Globe className="h-3.5 w-3.5 text-primary/80" />
      <span className="font-medium">{label}</span>
      {language.codeSwitching && (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
          <ArrowLeftRight className="h-2.5 w-2.5" />
          Code-Switched
        </span>
      )}
    </div>
  );
}
