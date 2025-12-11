import React from 'react';
import { ArrowRight, Video, ShieldCheck, Zap } from 'lucide-react';

export const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-gray-900 pt-16 pb-32 lg:pt-24 lg:pb-40">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 mb-8">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              <span className="text-sm font-medium">Live Visitor Tracking 2.0 is here</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              Turn Anonymous <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                Traffic into Revenue
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Stop waiting for form fills. Identify high-value companies on your site instantly and start a video conversation with one click.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:scale-105 shadow-lg shadow-blue-600/30">
                Start Converting Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-gray-300 transition-all duration-200 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                <Video className="mr-2 w-5 h-5" />
                Watch Demo
              </button>
            </div>

            <div className="mt-8 flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span>No Credit Card Req.</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>Setup in 2 mins</span>
              </div>
            </div>
          </div>

          {/* Hero Image / Mockup */}
          <div className="relative lg:mt-0 mt-12 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative rounded-2xl bg-gray-900 border border-gray-800 shadow-2xl overflow-hidden">
              {/* Mock Browser Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-gray-800/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="ml-4 px-3 py-1 rounded-md bg-gray-900 text-xs text-gray-500 font-mono flex-1 text-center">
                  tippen.app/dashboard
                </div>
              </div>
              
              {/* Mock Dashboard Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Live Visitors</h3>
                    <p className="text-sm text-gray-400">3 high-value prospects online</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 rounded bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">● Live</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Visitor Card 1 */}
                  <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-blue-500/50 transition-colors cursor-pointer group/card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold">
                          A
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Acme Corp</h4>
                          <p className="text-xs text-gray-400">San Francisco, CA • $50M Rev</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium opacity-0 group-hover/card:opacity-100 transition-opacity shadow-lg shadow-blue-600/20">
                        Call Now
                      </button>
                    </div>
                  </div>

                   {/* Visitor Card 2 */}
                   <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-blue-500/50 transition-colors cursor-pointer group/card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center text-purple-400 font-bold">
                          S
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Stark Ind.</h4>
                          <p className="text-xs text-gray-400">New York, NY • $10B Rev</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium opacity-0 group-hover/card:opacity-100 transition-opacity shadow-lg shadow-blue-600/20">
                        Call Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
