import React from 'react';

export const HowItWorks = () => {
    return (
        <div className="bg-gray-50 dark:bg-gray-900 py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                        From Visitor to Video Call in Seconds
                    </h2>
                    <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">
                        Getting started is easier than you think.
                    </p>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 z-0"></div>

                    <div className="grid md:grid-cols-3 gap-12 relative z-10">
                        {/* Step 1 */}
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md text-center border border-gray-100 dark:border-gray-700">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 border-4 border-white dark:border-gray-800">
                                1
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Install Script</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Copy and paste our lightweight tracking code into your website header. It takes less than 2 minutes.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md text-center border border-gray-100 dark:border-gray-700">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 border-4 border-white dark:border-gray-800">
                                2
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Watch Live</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                See visitors appear in your dashboard instantly. We reveal their company details automatically.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md text-center border border-gray-100 dark:border-gray-700">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 border-4 border-white dark:border-gray-800">
                                3
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Connect & Close</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Click "Call" to ring their browser. They answer, and you're in a face-to-face meeting instantly.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
