import React from 'react';

export default function LoadingSpinner({ fullScreen = false, text = 'Loading...' }) {
  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-zinc-200 border-t-[#dc3545] rounded-full animate-spin" />
        <p className="text-sm font-medium text-zinc-500">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-6 h-6 border-2 border-zinc-200 border-t-[#dc3545] rounded-full animate-spin" />
    </div>
  );
}
