import React, { useState } from 'react';
import { HiX } from 'react-icons/hi';

const PromotionalBanner = () => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="relative bg-black text-white">
            <div className="max-w-7xl mx-auto py-2 px-3 sm:px-6 lg:px-8">
                <div className="text-center text-sm font-medium">
                    <span>FREE STANDARD SHIPPING WITH GLAFO CLUB</span>
                    <span className="block sm:ml-2 sm:inline-block">
                        <a href="/register" className="text-white font-bold underline">
                            JOIN GLAFO CLUB FOR FREE
                        </a>
                    </span>
                </div>
            </div>
            <button
                type="button"
                className="absolute right-0 top-0 p-2 text-white"
                onClick={() => setIsVisible(false)}
            >
                <HiX className="h-5 w-5" />
            </button>
        </div>
    );
};

export default PromotionalBanner; 