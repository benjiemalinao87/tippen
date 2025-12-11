import React from 'react';
import { Eye, Video, Zap, Globe, Lock, BarChart } from 'lucide-react';

const features = [
    {
        name: 'Real-Time Identification',
        description: 'Know exactly which companies are visiting your site. We enrich IP addresses to reveal company name, size, revenue, and industry instantly.',
        icon: Eye,
    },
    {
        name: 'One-Click Video Calls',
        description: 'Skip the scheduling back-and-forth. Initiate a high-quality video call directly in the visitor\'s browser. No plugins or downloads required.',
        icon: Video,
    },
    {
        name: 'Instant Notifications',
        description: 'Get alerted the moment a high-value prospect lands on your site via Slack or our dashboard. Never miss a VIP visitor again.',
        icon: Zap,
    },
    {
        name: 'Global Reach',
        description: 'Our low-latency infrastructure ensures crystal clear video and real-time data updates, no matter where your visitors are located.',
        icon: Globe,
    },
    {
        name: 'Enterprise Security',
        description: 'Built with privacy and security first. We are GDPR compliant and use end-to-end encryption for all video sessions.',
        icon: Lock,
    },
    {
        name: 'Deep Analytics',
        description: 'Track visitor behavior, session duration, and conversion rates. Understand what drives engagement and optimize your funnel.',
        icon: BarChart,
    },
];

export const Features = () => {
    return (
        <div className="py-24 bg-white dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:text-center">
                    <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        Everything you need to capture demand
                    </p>
                    <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 lg:mx-auto">
                        Tippen gives your sales team superpowers. See through the anonymity and connect with your future customers instantly.
                    </p>
                </div>

                <div className="mt-20">
                    <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                        {features.map((feature) => (
                            <div key={feature.name} className="relative">
                                <dt>
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                                        <feature.icon className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">{feature.name}</p>
                                </dt>
                                <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">
                                    {feature.description}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </div>
    );
};
