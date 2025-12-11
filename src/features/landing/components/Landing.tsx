import { useState, useEffect } from 'react';
import {
  Play,
  Users,
  Zap,
  Building2,
  Video,
  ArrowRight,
  Check,
  Star,
  Globe,
  Shield,
  Clock,
  TrendingUp,
  ChevronDown,
  Sparkles,
  Eye,
  MousePointerClick
} from 'lucide-react';

// Tippen Tracking Configuration
const TIPPEN_API_KEY = 'tippen_1761470373757_1uesxoaubbrgmhefazgz6';
const TIPPEN_BACKEND = 'https://tippen-backend.benjiemalinao879557.workers.dev';

const COMPANIES = [
  'Stripe',
  'Notion',
  'Linear',
  'Vercel',
  'Figma',
  'Slack'
];

const FEATURES = [
  {
    icon: Eye,
    title: 'Real-Time Visitor Intelligence',
    description: 'See who\'s on your website right now. Get company names, revenue, employee count, and industry—instantly.',
    color: 'from-violet-500 to-purple-600'
  },
  {
    icon: Video,
    title: 'One-Click Video Calls',
    description: 'Start a video conversation with any visitor in seconds. No downloads, no friction—just connection.',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    icon: Building2,
    title: 'Company Enrichment',
    description: 'Transform anonymous IP addresses into rich company profiles. Know exactly who you\'re talking to.',
    color: 'from-emerald-500 to-teal-600'
  },
  {
    icon: Zap,
    title: '10-Minute Setup',
    description: 'Copy one script tag. That\'s it. Start seeing visitors in your dashboard within minutes.',
    color: 'from-amber-500 to-orange-600'
  }
];

const STATS = [
  { value: '47%', label: 'Average conversion lift' },
  { value: '<100ms', label: 'Real-time latency' },
  { value: '10min', label: 'Time to go live' },
  { value: '8KB', label: 'Script size' }
];

const TESTIMONIALS = [
  {
    quote: "Tippen changed how we do sales. We went from chasing cold leads to having warm conversations with visitors who are already interested.",
    author: "Sarah Chen",
    role: "Head of Sales",
    company: "TechScale",
    avatar: "SC"
  },
  {
    quote: "The moment I saw which companies were browsing our pricing page, I knew this was a game-changer. We closed 3 enterprise deals in week one.",
    author: "Marcus Johnson",
    role: "Founder & CEO",
    company: "DataFlow",
    avatar: "MJ"
  },
  {
    quote: "Finally, a tool that tells me WHO is on my site, not just how many. The video call feature is pure magic.",
    author: "Elena Rodriguez",
    role: "VP of Growth",
    company: "CloudNine",
    avatar: "ER"
  }
];

const FAQS = [
  {
    question: "How does visitor identification work?",
    answer: "Tippen uses IP-to-company matching combined with our enrichment API to identify the company behind each visitor. We reveal company name, industry, revenue range, and employee count—all in real-time."
  },
  {
    question: "Do visitors need to install anything for video calls?",
    answer: "No! That's the magic. When you initiate a video call, a subtle popup appears on their screen. One click and they're connected. No downloads, no apps, no friction."
  },
  {
    question: "Is Tippen GDPR compliant?",
    answer: "Absolutely. We only collect business-related data (company information), not personal data. We're fully GDPR and CCPA compliant, with optional consent banners if you need them."
  },
  {
    question: "How long does setup take?",
    answer: "Under 10 minutes. Copy our tracking script into your website's <head> tag, and you're live. Works with WordPress, Shopify, React, Next.js, and any other platform."
  },
  {
    question: "What's the catch? Why is there a free trial?",
    answer: "No catch. We're confident that once you see who's on your website and connect with them, you'll never go back. The free trial gives you full access to prove it."
  }
];

export function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [visitorCount, setVisitorCount] = useState(0);
  const [currentCompanyIndex, setCurrentCompanyIndex] = useState(0);

  // Animate visitor counter
  useEffect(() => {
    const targetCount = 2847;
    const duration = 2000;
    const steps = 60;
    const increment = targetCount / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetCount) {
        setVisitorCount(targetCount);
        clearInterval(timer);
      } else {
        setVisitorCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  // Rotate company names
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentCompanyIndex((prev) => (prev + 1) % COMPANIES.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // 🎯 Load Tippen Tracking Script - Track landing page visitors!
  useEffect(() => {
    // Check if script already exists
    if (document.querySelector('script[data-tippen-api-key]')) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://tippen.pages.dev/tippen-tracker.js';
    script.setAttribute('data-tippen-api-key', TIPPEN_API_KEY);
    script.setAttribute('data-tippen-backend', TIPPEN_BACKEND);
    script.async = true;

    document.head.appendChild(script);

    console.log('🎯 Tippen tracking script loaded on landing page');

    return () => {
      // Cleanup on unmount (optional)
      const existingScript = document.querySelector('script[data-tippen-api-key]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const scrollToSignup = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStartTrial = () => {
    window.location.href = '/onboarding';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-600/15 rounded-full blur-[128px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[128px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight">Tippen</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">How it Works</a>
              <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a>
              <a href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Login</a>
            </div>
            <button
              onClick={handleStartTrial}
              className="px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-full hover:bg-gray-100 transition-all hover:scale-105 active:scale-95"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-gray-300">
              <span className="text-white font-medium">{visitorCount.toLocaleString()}</span> visitors identified today
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
            <span className="text-white">See </span>
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                who's on your website
              </span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path d="M2 10C50 4 150 2 298 10" stroke="url(#paint0_linear)" strokeWidth="3" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="paint0_linear" x1="2" y1="10" x2="298" y2="10" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8b5cf6"/>
                    <stop offset="1" stopColor="#06b6d4"/>
                  </linearGradient>
                </defs>
              </svg>
            </span>
            <br />
            <span className="text-white">then talk to them.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Turn anonymous traffic into qualified conversations. Know the company behind every visitor and start video calls with one click.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={handleStartTrial}
              className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-full hover:from-violet-500 hover:to-purple-500 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-violet-600/25"
            >
              Start Free — No Card Required
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 px-8 py-4 text-gray-300 font-medium hover:text-white transition-colors"
            >
              <Play className="w-4 h-4" />
              Watch 2-min demo
            </button>
          </div>

          {/* Live Demo Preview */}
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-cyan-600/20 rounded-2xl blur-xl" />
            <div className="relative bg-[#12121a] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#0d0d14] border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 bg-white/5 rounded-lg text-xs text-gray-500">
                    tippen.io/dashboard
                  </div>
                </div>
              </div>
              {/* Dashboard Preview */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Stat Cards */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="text-sm text-gray-400 mb-1">Live Visitors</div>
                    <div className="text-3xl font-bold text-white flex items-center gap-2">
                      23
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="text-sm text-gray-400 mb-1">Identified</div>
                    <div className="text-3xl font-bold text-emerald-400">87%</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="text-sm text-gray-400 mb-1">Video Calls Today</div>
                    <div className="text-3xl font-bold text-violet-400">12</div>
                  </div>
                </div>

                {/* Visitor Table Preview */}
                <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                    <span className="text-sm font-medium">Live Visitors</span>
                    <span className="text-xs text-gray-500">Updated just now</span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {/* Visitor Row 1 */}
                    <div className="px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-sm font-bold">
                          S
                        </div>
                        <div>
                          <div className="font-medium text-white">{COMPANIES[currentCompanyIndex]}</div>
                          <div className="text-xs text-gray-500">Viewing: /pricing • 4m 23s</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-400 rounded-full">$10M-50M</span>
                        <button className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded-lg flex items-center gap-1 transition-colors">
                          <Video className="w-3 h-3" />
                          Call
                        </button>
                      </div>
                    </div>
                    {/* Visitor Row 2 */}
                    <div className="px-4 py-3 flex items-center justify-between opacity-60">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                          A
                        </div>
                        <div>
                          <div className="font-medium text-white">Acme Corp</div>
                          <div className="text-xs text-gray-500">Viewing: /features • 2m 11s</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full">$50M-100M</span>
                        <button className="px-3 py-1.5 bg-white/10 text-white text-xs font-medium rounded-lg flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          Call
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 px-6 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            97% of your website visitors leave without talking to you.
          </h2>
          <p className="text-xl text-gray-400 mb-8 leading-relaxed">
            Right now, qualified buyers are browsing your site. They're reading your pricing. They're interested. 
            <span className="text-white font-medium"> But you have no idea who they are.</span>
          </p>
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-violet-600/20 to-purple-600/20 rounded-2xl border border-violet-500/30">
            <TrendingUp className="w-6 h-6 text-violet-400" />
            <span className="text-lg">
              <span className="text-white font-semibold">What if</span>
              <span className="text-gray-300"> you could see exactly who they are—and start a conversation?</span>
            </span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-violet-500/10 text-violet-400 text-sm font-medium rounded-full mb-4">
              FEATURES
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything you need to convert visitors
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              From identification to conversation in seconds.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-white/10 transition-all hover:bg-white/[0.04]"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="relative py-24 px-6 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-cyan-500/10 text-cyan-400 text-sm font-medium rounded-full mb-4">
              HOW IT WORKS
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Three steps to more conversations
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-xl font-bold shadow-lg shadow-violet-600/25">
                1
              </div>
              <div className="pt-12 pl-4">
                <h3 className="text-xl font-bold mb-3">Add One Script Tag</h3>
                <p className="text-gray-400 mb-4">
                  Copy our lightweight tracking code into your website. Works with any platform—WordPress, Shopify, React, anything.
                </p>
                <div className="p-4 bg-[#0d0d14] rounded-xl border border-white/5 font-mono text-sm text-gray-400">
                  <span className="text-purple-400">&lt;script </span>
                  <span className="text-cyan-400">src</span>
                  <span className="text-white">=</span>
                  <span className="text-emerald-400">"tippen.js"</span>
                  <span className="text-purple-400">&gt;&lt;/script&gt;</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-xl font-bold shadow-lg shadow-cyan-600/25">
                2
              </div>
              <div className="pt-12 pl-4">
                <h3 className="text-xl font-bold mb-3">See Visitors in Real-Time</h3>
                <p className="text-gray-400 mb-4">
                  Watch your dashboard light up with live visitors. See company names, revenue, employee count, and what pages they're viewing.
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm text-gray-500">Live updates every &lt;100ms</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-xl font-bold shadow-lg shadow-emerald-600/25">
                3
              </div>
              <div className="pt-12 pl-4">
                <h3 className="text-xl font-bold mb-3">Start a Conversation</h3>
                <p className="text-gray-400 mb-4">
                  Click the video button. A gentle popup appears on their screen. No downloads needed—they click "Join" and you're talking.
                </p>
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-violet-400" />
                  <span className="text-sm text-gray-500">Browser-based video, works everywhere</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section id="demo" className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">See Tippen in action</h2>
            <p className="text-gray-400">2 minutes that could transform your sales pipeline</p>
          </div>
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#12121a] border border-white/10">
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="group flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all hover:scale-110">
                <Play className="w-8 h-8 text-white ml-1" />
              </button>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium">Tippen Product Demo</div>
                  <div className="text-sm text-gray-400">2:14 mins</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-24 px-6 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-amber-500/10 text-amber-400 text-sm font-medium rounded-full mb-4">
              TESTIMONIALS
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Loved by sales teams
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, index) => (
              <div key={index} className="p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-medium">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-emerald-500/10 text-emerald-400 text-sm font-medium rounded-full mb-4">
              PRICING
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-400">
              Start free. Upgrade when you're ready.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="p-8 bg-white/[0.02] rounded-2xl border border-white/5">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Starter</h3>
                <p className="text-gray-400">Perfect to test the waters</p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-bold">$0</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  '100 visitor identifications/month',
                  'Real-time dashboard',
                  'Company enrichment',
                  '5 video calls/month',
                  'Email support'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <Check className="w-5 h-5 text-emerald-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleStartTrial}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors"
              >
                Start Free
              </button>
            </div>

            {/* Pro Plan */}
            <div className="relative p-8 bg-gradient-to-br from-violet-600/10 to-purple-600/10 rounded-2xl border border-violet-500/30">
              <div className="absolute -top-3 right-6 px-3 py-1 bg-gradient-to-r from-violet-600 to-purple-600 text-xs font-bold rounded-full">
                POPULAR
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Growth</h3>
                <p className="text-gray-400">For serious sales teams</p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-bold">$99</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited visitor identifications',
                  'Real-time dashboard',
                  'Full company enrichment',
                  'Unlimited video calls',
                  'Slack notifications',
                  'Priority support',
                  'Custom integrations'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <Check className="w-5 h-5 text-violet-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleStartTrial}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-violet-600/25"
              >
                Start 14-Day Free Trial
              </button>
              <p className="text-center text-sm text-gray-500 mt-3">No credit card required</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="relative py-16 px-6 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-8 text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <span>99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span>Enterprise Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <div
                key={index}
                className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.02]"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-medium pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-gray-400 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 bg-gradient-to-br from-violet-600/20 to-purple-600/20 rounded-3xl border border-violet-500/30">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to see who's on your website?
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join hundreds of B2B companies turning anonymous visitors into qualified conversations.
            </p>
            <button
              onClick={handleStartTrial}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-all hover:scale-105 active:scale-95"
            >
              Start Free — No Credit Card
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight">Tippen</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} Tippen. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* 🟢 Live Demo Badge - Shows visitors they're being tracked */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full shadow-lg shadow-violet-600/30 animate-pulse">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="text-sm font-medium text-white">
            🎯 Live Demo Active — We can see you!
          </span>
        </div>
      </div>
    </div>
  );
}

