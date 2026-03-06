import React from 'react';

interface TabInfoProps {
  tabType: 'review' | 'raise';
}

/**
 * TabContent Helper Component
 * Displays helper text and description for each tab
 */
export default function ReflectionsTabContent({ tabType }: TabInfoProps) {
  const content = {
    review: {
      title: 'REVIEW',
      description: 'Share your experience',
      icon: '✨',
    },
    raise: {
      title: 'RAISE',
      description: 'Signal blockers and confusion',
      icon: '⚡',
    },
  };

  const tab = content[tabType];

  return (
    <div className="flex items-center gap-2">
      <span>{tab.icon}</span>
      <div>
        <div className="font-semibold text-slate-900">{tab.title}</div>
        <div className="text-xs text-slate-500">{tab.description}</div>
      </div>
    </div>
  );
}
