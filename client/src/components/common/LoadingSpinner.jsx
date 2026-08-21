import React from 'react';

export default function LoadingSpinner({ fullScreen = false, text = 'Loading...' }) {
  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-vistaro-border border-t-vistaro-accent rounded-full animate-spin" />
        <p className="text-sm font-medium text-vistaro-muted">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-6 h-6 border-2 border-vistaro-border border-t-vistaro-accent rounded-full animate-spin" />
    </div>
  );
}
