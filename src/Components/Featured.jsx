import React from "react";
import { FaMedal, FaShoppingBag, FaTruck, FaCamera } from "react-icons/fa";

export const Featured = () => {
  const data = [
    {
      icon: <FaMedal />,
      title: "Best quality",
      desc: "Not only fast for us quality",
    },
    {
      icon: <FaShoppingBag />,
      title: "Easy to order",
      desc: "You only need a few steps",
    },
    {
      icon: <FaTruck />,
      title: "Fastest delivery",
      desc: "Delivery that is always",
    },
    {
      icon: <FaCamera />,
      title: "Choose products",
      desc: "Selected product up to",
    },
  ];

  return (
    <section className="bg-black py-16 px-4 sm:px-8 lg:px-[25rem]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {data.map((item, i) => (
          <div
            key={i}
            className="bg-zinc-900 border border-white/10 rounded-2xl p-8 text-white hover:bg-zinc-800 hover:scale-105 transition duration-300"
          >
            {/* Icon */}
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white-600/20 text-white-500 text-2xl mb-6">
              {item.icon}
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold">
              {item.title}
            </h3>

            {/* Desc */}
            <p className="text-base text-gray-400 mt-3">
              {item.desc}
            </p>
          </div>
        ))}

      </div>
    </section>
  );
};