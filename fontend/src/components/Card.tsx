import React from "react";
import { FaChevronDown } from "react-icons/fa";

interface CardProps {
  title: string;
  icon: JSX.Element;
  color: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  icon,
  color,
  isOpen,
  onToggle,
  children,
}) => (
  <div className="rounded-2xl border border-gray-200 mb-4 overflow-hidden">
    <button
      className="w-full flex items-center justify-between p-4"
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <span className="font-semibold text-gray-800">{title}</span>
      </div>
      <FaChevronDown
        className={`
          text-gray-400 transition-transform
          ${isOpen ? "rotate-180" : ""}
        `}
      />
    </button>
    {isOpen && (
      <div className="px-6 pb-4 space-y-2">
        {children}
      </div>
    )}
  </div>
);

export default Card;
