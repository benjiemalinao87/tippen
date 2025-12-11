import React from 'react';
import { X, Check, ArrowDown } from 'lucide-react';

export const ProblemSolution = () => {
    return (
        <div className="bg-gray-50 dark:bg-gray-900 py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                        The Old Way of Lead Gen is Broken
                    </h2>
                    <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">
                        You're spending money to drive traffic, but 98% of it leaves without a trace.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* The Problem */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                            <span className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center mr-3">
                                <X className="w-5 h-5" />
                            </span>
                            Traditional Forms
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <X className="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
                                <span className="text-gray-600 dark:text-gray-300">Visitors hate filling out long forms.</span>
                            </li>
                            <li className="flex items-start">
                                <X className="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
                                <span className="text-gray-600 dark:text-gray-300">Response times are slow (hours or days).</span>
                            </li>
                            <li className="flex items-start">
                                <X className="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
                                <span className="text-gray-600 dark:text-gray-300">You have no idea who is browsing right now.</span>
                            </li>
                            <li className="flex items-start">
                                <X className="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
                                <span className="text-gray-600 dark:text-gray-300">High-intent leads bounce and go to competitors.</span>
                            </li>
                        </ul>
                    </div>

                    {/* The Solution */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border-2 border-blue-500 relative overflow-hidden transform md:scale-105 z-10">
                        <div className="absolute top-0 left-0 w-full h-2 bg-blue-500"></div>
                        <div className="absolute top-4 right-4 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                            The Tippen Way
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                            <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mr-3">
                                <Check className="w-5 h-5" />
                            </span>
                            Instant Engagement
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <Check className="w-5 h-5 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                                <span className="text-gray-600 dark:text-gray-300"><strong>See exactly who</strong> is on your site in real-time.</span>
                            </li>
                            <li className="flex items-start">
                                <Check className="w-5 h-5 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                                <span className="text-gray-600 dark:text-gray-300"><strong>Connect instantly</strong> via video with one click.</span>
                            </li>
                            <li className="flex items-start">
                                <Check className="w-5 h-5 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                                <span className="text-gray-600 dark:text-gray-300"><strong>Zero friction</strong> for the visitor (no downloads).</span>
                            </li>
                            <li className="flex items-start">
                                <Check className="w-5 h-5 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                                <span className="text-gray-600 dark:text-gray-300"><strong>Strike while the iron is hot</strong> and close more deals.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
