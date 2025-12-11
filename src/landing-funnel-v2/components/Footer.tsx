import React from 'react';

export const Footer = () => {
    return (
        <footer className="bg-gray-900 border-t border-gray-800">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                        <span className="text-2xl font-bold text-white">Tippen</span>
                    </div>
                    <div className="flex space-x-6">
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                            Product
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                            Features
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                            Pricing
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                            Login
                        </a>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-800 pt-8 md:flex md:items-center md:justify-between">
                    <p className="text-base text-gray-400">
                        &copy; {new Date().getFullYear()} Tippen. All rights reserved.
                    </p>
                    <div className="mt-4 md:mt-0 flex space-x-6">
                        <a href="#" className="text-gray-500 hover:text-gray-400">
                            Privacy Policy
                        </a>
                        <a href="#" className="text-gray-500 hover:text-gray-400">
                            Terms of Service
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
