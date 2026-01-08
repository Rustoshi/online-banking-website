'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { ThemeProvider } from '@/components/public/ThemeProvider';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import '@/app/(public)/globals-public.css';
import {
  Shield,
  Smartphone,
  TrendingUp,
  CreditCard,
  PiggyBank,
  Building2,
  Users,
  Award,
  ArrowRight,
  CheckCircle2,
  Star,
  Clock,
  Phone,
  Mail,
} from 'lucide-react';

const services = [
  {
    icon: PiggyBank,
    title: 'Savings Account',
    description: 'Grow your money with competitive interest rates and flexible savings options.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: CreditCard,
    title: 'Credit Cards',
    description: 'Find the perfect card with rewards, cashback, and low interest rates.',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: TrendingUp,
    title: 'Loans',
    description: 'Personal, auto, and home loans with competitive rates tailored for you.',
    color: 'from-purple-500 to-pink-600',
  },
  {
    icon: Building2,
    title: 'Business Banking',
    description: 'Comprehensive solutions to help your business thrive and grow.',
    color: 'from-orange-500 to-red-600',
  },
  {
    icon: Shield,
    title: 'Wealth Management',
    description: 'Expert investment and retirement planning for your future.',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    icon: Smartphone,
    title: 'Mobile Banking',
    description: 'Bank anytime, anywhere with our secure and intuitive mobile app.',
    color: 'from-violet-500 to-purple-600',
  },
];

const features = [
  { icon: Shield, title: 'Bank-Level Security', description: '256-bit encryption and multi-factor authentication' },
  { icon: Clock, title: '24/7 Support', description: 'Round-the-clock customer service whenever you need' },
  { icon: Smartphone, title: 'Mobile First', description: 'Full-featured mobile app for banking on the go' },
  { icon: Award, title: 'Award Winning', description: 'Recognized for excellence in customer service' },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Small Business Owner',
    content: 'This bank has been instrumental in helping my business grow. Their business banking solutions are top-notch!',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Software Engineer',
    content: 'The mobile app is fantastic! I can manage all my finances seamlessly. Best banking experience ever.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Healthcare Professional',
    content: 'Excellent customer service and competitive rates. I switched from my old bank and never looked back.',
    rating: 5,
  },
];

const stats = [
  { value: '2M+', label: 'Happy Customers' },
  { value: '$50B+', label: 'Assets Managed' },
  { value: '500+', label: 'Branch Locations' },
  { value: '99.9%', label: 'Uptime Guarantee' },
];

export default function Home() {
  const { settings } = useSiteSettings();
  const companyName = settings.siteName;

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[var(--public-bg)]">
        <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen lg:min-h-[700px] flex items-center pb-20 lg:pb-0">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          {/* Mobile: shift image left to center the woman on the right */}
          <div className="absolute inset-0 bg-[url('/images/hero.jpg')] bg-cover bg-[position:65%_center] lg:bg-center bg-no-repeat" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-slate-900/40 lg:bg-slate-900/60 lg:bg-none" />
        </div>

        {/* Content */}
        <div className="relative w-full pt-28 pb-32 lg:pb-32">
          {/* Mobile Layout - Centered */}
          <div className="lg:hidden text-center px-5">
            {/* Bank Icon */}
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-5 border border-white/20">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-2">
              {companyName}
            </h1>
            <p className="text-lg sm:text-xl text-white font-semibold mb-4">
              Your Digital Banking Partner
            </p>
            <p className="text-base sm:text-lg text-white/90 mb-8 max-w-sm mx-auto leading-relaxed font-medium">
              We do banking differently. We believe that people come first, and that everyone deserves a great experience every step of the way.
            </p>
            
            {/* Action Buttons - Full Width */}
            <div className="flex flex-col gap-3 mb-10 max-w-sm mx-auto">
              <Link
                href="/register"
                className="flex items-center justify-center gap-2 w-full py-4 bg-[var(--public-primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all duration-300 text-base shadow-lg"
              >
                <Users className="w-5 h-5" />
                Open Account Today
              </Link>
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full py-4 bg-white/15 backdrop-blur-md border border-white/30 text-white font-bold rounded-xl hover:bg-white/25 transition-all duration-300 text-base"
              >
                <ArrowRight className="w-5 h-5" />
                Login to Banking
              </Link>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-10">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-white">50K+</p>
                <p className="text-sm text-white/70 font-medium">Happy Customers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-white">$2.5B+</p>
                <p className="text-sm text-white/70 font-medium">Assets Managed</p>
              </div>
            </div>
          </div>

          {/* Desktop Layout - Left aligned */}
          <div className="hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                {companyName}
              </h1>
              <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-lg">
                We do banking differently. We believe that people come first, and that everyone deserves a great experience every step of the way.
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-row gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[var(--public-primary)] text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-300"
                >
                  <Users className="w-5 h-5" />
                  Open Account Today
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300"
                >
                  <ArrowRight className="w-5 h-5" />
                  Login to Banking
                </Link>
              </div>
            </div>
          </div>

          {/* Info Cards at Bottom - Desktop only */}
          <div className="hidden lg:block absolute bottom-0 left-0 right-0 translate-y-1/2">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-3 gap-4">
                {/* Routing Number Card */}
                <div className="bg-[var(--public-primary)] rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm font-medium uppercase tracking-wide">Routing #</p>
                    <p className="text-2xl font-bold text-white">251480576</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Branch Hours Card */}
                <div className="bg-emerald-500 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm font-medium uppercase tracking-wide">Branch Hours</p>
                    <p className="text-xl font-bold text-white">Mon-Fri: 9AM-5PM</p>
                    <p className="text-white/70 text-sm">Sat: 9AM-1PM</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* 24/7 Support Card */}
                <div className="bg-violet-500 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm font-medium uppercase tracking-wide">24/7 Support</p>
                    <p className="text-xl font-bold text-white">1-800-BANKING</p>
                    <p className="text-white/70 text-sm">Always here to help</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Fixed Bottom Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 grid grid-cols-2">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 py-4 bg-slate-900 text-[var(--public-primary)] font-semibold border-t border-slate-700"
          >
            <ArrowRight className="w-5 h-5" />
            Login
          </Link>
          <Link
            href="/register"
            className="flex items-center justify-center gap-2 py-4 bg-[var(--public-primary)] text-white font-semibold"
          >
            <Users className="w-5 h-5" />
            Register
          </Link>
        </div>
      </section>

      {/* Spacer for the overlapping cards - Desktop only */}
      <div className="hidden lg:block h-20 bg-[var(--public-bg)]" />

      {/* Rates Section */}
      <section className="py-16 lg:py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-emerald-400 text-sm font-medium mb-6">
              <Mail className="w-4 h-4" />
              {companyName} Rates
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              {companyName} Member Care
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Discover competitive rates designed to help your money grow faster
            </p>
          </div>

          {/* Rate Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* High Yield Savings */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center hover:border-slate-600 transition-colors">
              <div className="w-14 h-14 bg-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <PiggyBank className="w-7 h-7 text-cyan-400" />
              </div>
              <p className="text-4xl font-bold text-cyan-400 mb-1">3.75%</p>
              <p className="text-slate-400 text-sm mb-4">APY*</p>
              <h3 className="text-white font-semibold uppercase tracking-wide text-sm mb-1">High Yield Savings</h3>
              <p className="text-slate-500 text-sm mb-4">High Yield Savings Rate</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded-full">
                <Star className="w-3 h-3" />
                FEATURED
              </span>
            </div>

            {/* 18 Month Certificate */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center hover:border-slate-600 transition-colors">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-7 h-7 text-emerald-400" />
              </div>
              <p className="text-4xl font-bold text-emerald-400 mb-1">3.65%</p>
              <p className="text-slate-400 text-sm mb-4">APY*</p>
              <h3 className="text-white font-semibold uppercase tracking-wide text-sm mb-1">18 Month Certificate</h3>
              <p className="text-slate-500 text-sm mb-4">{companyName} Certificate Rates</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">
                <PiggyBank className="w-3 h-3" />
                SAVINGS
              </span>
            </div>

            {/* Credit Cards */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center hover:border-slate-600 transition-colors">
              <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-7 h-7 text-amber-400" />
              </div>
              <p className="text-4xl font-bold text-amber-400 mb-1">4.00%</p>
              <p className="text-slate-400 text-sm mb-4">APR*</p>
              <h3 className="text-white font-semibold uppercase tracking-wide text-sm mb-1">Credit Cards</h3>
              <p className="text-slate-500 text-sm mb-4">{companyName} Credit Card Rates</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full">
                <CreditCard className="w-3 h-3" />
                CREDIT
              </span>
            </div>

            {/* Loans */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center hover:border-slate-600 transition-colors">
              <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-7 h-7 text-orange-400" />
              </div>
              <p className="text-4xl font-bold text-orange-400 mb-1">15.49%</p>
              <p className="text-slate-400 text-sm mb-4">APR*</p>
              <h3 className="text-white font-semibold uppercase tracking-wide text-sm mb-1">Loans</h3>
              <p className="text-slate-500 text-sm mb-4">{companyName} Standard Loan Rates</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 text-orange-400 text-xs font-medium rounded-full">
                <TrendingUp className="w-3 h-3" />
                MORTGAGE
              </span>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
            <div className="w-5 h-5 bg-slate-700 rounded-full flex items-center justify-center">
              <span className="text-xs">i</span>
            </div>
            <p>*Annual Percentage Yield. Rates subject to change. Terms and conditions apply.</p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-[var(--public-bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-[var(--public-primary-soft)] text-[var(--public-primary)] text-sm font-medium rounded-full mb-4">
              Our Services
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--public-text-primary)] mb-4">
              How Can We Help You Today?
            </h2>
            <p className="text-lg text-[var(--public-text-secondary)] max-w-2xl mx-auto">
              Comprehensive banking solutions designed to meet all your financial needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="group bg-[var(--public-surface)] rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-[var(--public-border)] hover:border-transparent hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--public-text-primary)] mb-3">{service.title}</h3>
                <p className="text-[var(--public-text-secondary)] mb-4">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden">
                <Image
                  src="/images/hero-woman-banking.jpg"
                  alt="Happy customer using online banking"
                  width={600}
                  height={450}
                  className="w-full h-auto object-cover rounded-2xl"
                />
              </div>
            </div>

            {/* Content */}
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-sm font-medium mb-6">
                <span className="text-emerald-400">$</span>
                Get $200* With a Checking Account Built for You
              </span>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Start Building Your{' '}
                <span className="text-emerald-400">Financial Strength</span>
              </h2>
              
              <p className="text-lg text-slate-400 mb-8">
                For a limited time, get a $200 when you open any new account, and what helps you reach your financial goals. You can open a new account online or in person at any of our locations.
              </p>

              {/* Benefits List */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-300">No minimum balance required</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-300">Free online and mobile banking</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-300">24/7 customer support</span>
                </div>
              </div>

              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--public-primary)] text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-300"
              >
                <ArrowRight className="w-5 h-5" />
                Open Account Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-[var(--public-surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-[var(--public-primary-soft)] text-[var(--public-primary)] text-sm font-medium rounded-full mb-4">
                Why Choose Us
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--public-text-primary)] mb-6">
                Building Strength Together
              </h2>
              <p className="text-lg text-[var(--public-text-secondary)] mb-8">
                {companyName} is a full-service bank built on the foundation of providing our members with exceptional service at every step of their financial journey.
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-12 h-12 bg-[var(--public-primary-soft)] rounded-xl flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-[var(--public-primary)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--public-text-primary)] mb-1">{feature.title}</h3>
                      <p className="text-sm text-[var(--public-text-secondary)]">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--public-primary)] to-purple-500 rounded-3xl blur-2xl opacity-20" />
              <Image
                src="/images/team-meeting.jpg"
                alt="Team collaboration"
                width={600}
                height={500}
                className="relative rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-[var(--public-bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-[var(--public-primary-soft)] text-[var(--public-primary)] text-sm font-medium rounded-full mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--public-text-primary)] mb-4">
              Hear From Our Customers
            </h2>
            <p className="text-lg text-[var(--public-text-secondary)] max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust {companyName} with their finances
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-[var(--public-surface)] rounded-2xl p-8 shadow-sm border border-[var(--public-border)]"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-[var(--public-warning)] fill-[var(--public-warning)]" />
                  ))}
                </div>
                <p className="text-[var(--public-text-secondary)] mb-6">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--public-primary)] to-indigo-600 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--public-text-primary)]">{testimonial.name}</p>
                    <p className="text-sm text-[var(--public-text-secondary)]">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-[var(--public-surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 sm:p-12 lg:p-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                  Get In Touch With Us
                </h2>
                <p className="text-gray-300 mb-8">
                  Have questions? Our team is here to help you 24/7. Reach out through any of our channels.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-gray-300">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-[var(--public-primary)]" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Banking Hours</p>
                      <p className="text-sm">Mon - Fri: 9AM - 6PM EST</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-gray-300">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                      <Phone className="w-6 h-6 text-[var(--public-primary)]" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Phone Banking</p>
                      <p className="text-sm">+1 (800) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-gray-300">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                      <Mail className="w-6 h-6 text-[var(--public-primary)]" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Email Support</p>
                      <p className="text-sm">{settings.siteEmail || 'support@example.com'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-[var(--public-surface)] rounded-2xl p-8">
                <h3 className="text-xl font-semibold text-[var(--public-text-primary)] mb-6">Send us a message</h3>
                <form className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="First Name"
                      className="w-full px-4 py-3 border border-[var(--public-border)] rounded-xl focus:ring-2 focus:ring-[var(--public-primary)] focus:border-transparent outline-none transition bg-[var(--public-bg)] text-[var(--public-text-primary)]"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      className="w-full px-4 py-3 border border-[var(--public-border)] rounded-xl focus:ring-2 focus:ring-[var(--public-primary)] focus:border-transparent outline-none transition bg-[var(--public-bg)] text-[var(--public-text-primary)]"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full px-4 py-3 border border-[var(--public-border)] rounded-xl focus:ring-2 focus:ring-[var(--public-primary)] focus:border-transparent outline-none transition bg-[var(--public-bg)] text-[var(--public-text-primary)]"
                  />
                  <textarea
                    placeholder="Your Message"
                    rows={4}
                    className="w-full px-4 py-3 border border-[var(--public-border)] rounded-xl focus:ring-2 focus:ring-[var(--public-primary)] focus:border-transparent outline-none transition resize-none bg-[var(--public-bg)] text-[var(--public-text-primary)]"
                  />
                  <button
                    type="submit"
                    className="w-full py-4 bg-[var(--public-primary)] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[var(--public-primary)]/30 transition-all duration-300"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

        <Footer />
      </div>
    </ThemeProvider>
  );
}
