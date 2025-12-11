import React from 'react';
import { ArrowRight } from 'lucide-react';

export const CTA = () => {
    return (
        <div className="bg-blue-600">
            <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                    <span className="block">Ready to stop losing leads?</span>
                    <span className="block text-blue-200">Start converting visitors today.</span>
                </h2>
                <p className="mt-4 text-lg leading-6 text-blue-100">
                    Join hundreds of sales teams using Tippen to crush their quotas. No credit card required to start.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-blue-600 transition-all duration-200 bg-white rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white shadow-lg">
                        Get Started for Free
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </button>
                </div>
                <p className="mt-4 text-sm text-blue-200">
                    Free 14-day trial • No credit card required • Cancel anytime
                </p>
            </div>
        </div>
    );
};
