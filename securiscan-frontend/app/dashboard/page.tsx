"use client";
import { useState } from "react";

export default function DashboardPage() {
  // Store the active card index only
  const [activeCard, setActiveCard] = useState<number | null>(null);

  const colors = [
    { name: "Blue", bg: "bg-blue-500/5", bright: "bg-blue-500/95" },
    { name: "Red", bg: "bg-red-500/5", bright: "bg-red-500/95" },
    { name: "Green", bg: "bg-green-500/5", bright: "bg-green-500/95" },
    { name: "Yellow", bg: "bg-yellow-500/5", bright: "bg-yellow-500/95" },
    { name: "Purple", bg: "bg-purple-500/5", bright: "bg-purple-500/95" },
    { name: "Orange", bg: "bg-orange-500/5", bright: "bg-orange-500/95" },
    { name: "Pink", bg: "bg-pink-500/5", bright: "bg-pink-500/95" },
    { name: "Cyan", bg: "bg-cyan-500/5", bright: "bg-cyan-500/95" },
    { name: "Teal", bg: "bg-teal-500/5", bright: "bg-teal-500/95" },
    { name: "Indigo", bg: "bg-indigo-500/5", bright: "bg-indigo-500/95" },
  ];

  const handleCardClick = (index: number) => {
    setActiveCard(index);
    setTimeout(() => {
      setActiveCard(null);
    }, 500);
  };

  return (
    <main className="relative flex-1 p-6 bg-white text-black">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center mb-6 relative overflow-hidden">
        {/* Decorative Shapes */}
        <div className="absolute inset-0 flex justify-around items-center opacity-50">
          <div className="absolute top-[-10px] left-[-20px] w-56 h-56 rounded-full bg-blue-500/15 backdrop-blur-sm" />
          <div className="absolute top-[30px] right-[-30px] w-40 h-40 rounded-tr-lg rounded-bl-lg bg-red-500/15 backdrop-blur-sm" />
          <div className="absolute bottom-[-10px] left-[40px] w-44 h-44 rounded-br-full bg-green-500/15 backdrop-blur-sm" />
          <div className="absolute bottom-[20px] right-[10px] w-56 h-56 rounded-lg bg-gradient-to-br from-blue-500/20 to-red-500/20 backdrop-blur-md" />
        </div>

        <div className="relative z-10">
          <h1 className="text-3xl font-bold">Welcome to the Dashboard</h1>
          <p className="text-lg text-gray-700">
            Select a vulnerability from the sidebar to begin scanning.
          </p>
        </div>
      </div>

      {/* Color Test */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Optional: Color Blindness Test</h2>
        <p className="text-gray-600">
          Test your color perception! Click a square to confirm the color you see.
        </p>
      </div>

      <div className="text-center text-xs text-gray-500 italic mb-2">
        **This is the ultimate challenge!** Colors are nearly invisible. Can you still tell what they are?
      </div>

      {/* Grid */}
      <div className="grid grid-cols-5 gap-0 w-full max-w-5xl mx-auto">
        {colors.map((color, index) => (
          <div
            key={index}
            className={`w-full h-[120px] sm:h-[140px] md:h-[160px] lg:h-[180px] rounded-md 
              ${activeCard === index ? color.bright : color.bg} 
              backdrop-blur-[6px] mix-blend-overlay brightness-50 
              transition-all duration-300 cursor-pointer flex items-center justify-center`}
            onClick={() => handleCardClick(index)}
          >
            {activeCard === index && (
              <span className="text-white font-bold text-lg">{color.name}</span>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
