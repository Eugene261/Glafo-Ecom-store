import React from 'react';
import mainLogo from '../../assets/BrandKit/main-logo-black-transparent.svg';
import { Link } from 'react-router-dom';

const PageHeader = ({ title }) => {
    return (
        <div className="bg-white border-b border-gray-200 mb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0">
                            <img src={mainLogo} alt="Glafo" className="h-12 w-auto" />
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    <div className="w-12"></div> {/* Spacer to center the title */}
                </div>
            </div>
        </div>
    );
};

export default PageHeader; 