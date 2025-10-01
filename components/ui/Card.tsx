import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({ children, className = '', padding = 'md', ...props }) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;