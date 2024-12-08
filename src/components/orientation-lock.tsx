import React from 'react';

export function OrientationLock() {
  return (
    <div className="fixed inset-0 bg-zinc-900 text-zinc-50 flex items-center justify-center p-6 z-50">
      <div className="text-center">
        <h2 className="text-xl font-mono tracking-wider uppercase mb-3">
          Please Rotate Your Device
        </h2>
        <p className="text-zinc-400">
          BearChat works best in portrait mode
        </p>
      </div>
    </div>
  );
}
