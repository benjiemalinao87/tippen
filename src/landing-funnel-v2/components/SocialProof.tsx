import React from 'react';

export const SocialProof = () => {
    return (
        <div className="bg-gray-900 py-12 border-y border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-center text-sm font-semibold text-gray-500 tracking-wider uppercase mb-8">
                    Trusted by high-growth sales teams at
                </p>
                <div className="grid grid-cols-2 gap-8 md:grid-cols-6 lg:grid-cols-5">
                    {/* Placeholder Logos - using text for now but styled to look like logos */}
                    <div className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
                        <span className="text-2xl font-bold text-gray-400 flex items-center gap-2">
                            <span className="w-6 h-6 bg-gray-700 rounded-full"></span>
                            TechFlow
                        </span>
                    </div>
                    <div className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
                        <span className="text-2xl font-bold text-gray-400 flex items-center gap-2">
                            <span className="w-6 h-6 bg-gray-700 rounded-md"></span>
                            ScaleAI
                        </span>
                    </div>
                    <div className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
                        <span className="text-2xl font-bold text-gray-400 flex items-center gap-2">
                            <span className="w-6 h-6 bg-gray-700 rounded-tr-xl"></span>
                            GrowthX
                        </span>
                    </div>
                    <div className="col-span-1 flex justify-center md:col-span-3 lg:col-span-1">
                        <span className="text-2xl font-bold text-gray-400 flex items-center gap-2">
                            <span className="w-6 h-6 bg-gray-700 rounded-full border-2 border-gray-500"></span>
                            RevOps
                        </span>
                    </div>
                    <div className="col-span-2 flex justify-center md:col-span-3 lg:col-span-1">
                        <span className="text-2xl font-bold text-gray-400 flex items-center gap-2">
                            <span className="w-6 h-6 bg-gray-700 transform rotate-45"></span>
                            DataSync
                        </span>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3 text-center divide-y sm:divide-y-0 sm:divide-x divide-gray-800">
                    <div className="pt-8 sm:pt-0">
                        <p className="text-4xl font-extrabold text-white">300%</p>
                        <p className="mt-2 text-sm font-medium text-gray-400">Increase in Lead Quality</p>
                    </div>
                    <div className="pt-8 sm:pt-0">
                        <p className="text-4xl font-extrabold text-white">2.5x</p>
                        <p className="mt-2 text-sm font-medium text-gray-400">More Meetings Booked</p>
                    </div>
                    <div className="pt-8 sm:pt-0">
                        <p className="text-4xl font-extrabold text-white">30s</p>
                        <p className="mt-2 text-sm font-medium text-gray-400">Average Response Time</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
