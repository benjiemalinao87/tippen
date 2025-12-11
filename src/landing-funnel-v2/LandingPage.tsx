import React from 'react';
import { Hero } from './components/Hero';
import { SocialProof } from './components/SocialProof';
import { ProblemSolution } from './components/ProblemSolution';
import { Features } from './components/Features';
import { HowItWorks } from './components/HowItWorks';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';

export const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
            <Hero />
            <SocialProof />
            <ProblemSolution />
            <Features />
            <HowItWorks />
            <CTA />
            <Footer />
        </div>
    );
};
