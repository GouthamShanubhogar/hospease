import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-gradient-blue rounded-lg flex items-center justify-center"></div>
              <span className="text-base font-display font-bold gradient-text">HospEase</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-gradient-blue text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="inline-block mb-4">
                <span className="bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold">
                  🚀 Smart Healthcare Management
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-display font-bold text-gray-900 mb-6 leading-tight">
                Transform Your
                <span className="gradient-text"> Hospital</span>
                <br />Management
              </h1>
              <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                Streamline patient queues, appointments, and hospital operations with our intelligent management system. Reduce wait times and improve patient satisfaction.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center bg-gradient-blue text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:shadow-glow transition-all duration-300 transform hover:-translate-y-1"
                >
                  Start Free Trial
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center border-2 border-primary-600 text-primary-600 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary-50 transition-all duration-300"
                >
                  Watch Demo
                </Link>
              </div>
              <div className="mt-8 flex items-center space-x-6 text-xs text-gray-500">
                <div className="flex items-center">
                  No credit card required
                </div>
                <div className="flex items-center">
                  14-day free trial
                </div>
              </div>
            </div>
            <div className="relative animate-fade-in">
              <div className="relative z-10">
                <div className="bg-white rounded-2xl shadow-large p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Today's Overview</h3>
                    <span className="text-green-500 text-sm font-medium">● Live</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                      <div className="text-xl font-bold text-blue-600">142</div>
                      <div className="text-xs text-gray-600 mt-1">Appointments</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                      <div className="text-xl font-bold text-purple-600">28</div>
                      <div className="text-xs text-gray-600 mt-1">Doctors Active</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                      <div className="text-xl font-bold text-green-600">95%</div>
                      <div className="text-xs text-gray-600 mt-1">Satisfaction</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
                      <div className="text-xl font-bold text-orange-600">15m</div>
                      <div className="text-xs text-gray-600 mt-1">Avg Wait Time</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow"></div>
              <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow animation-delay-2000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your Hospital
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to streamline operations and enhance patient care
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "📅",
                title: "Smart Scheduling",
                description: "AI-powered appointment scheduling that optimizes doctor availability and reduces wait times"
              },
              {
                icon: "👥",
                title: "Queue Management",
                description: "Real-time queue tracking with digital tokens and automated notifications"
              },
              {
                icon: "📊",
                title: "Analytics Dashboard",
                description: "Comprehensive insights into hospital operations, patient flow, and performance metrics"
              },
              {
                icon: "💊",
                title: "Patient Records",
                description: "Secure digital health records with easy access and complete medical history"
              },
              {
                icon: "💳",
                title: "Billing System",
                description: "Integrated billing and payment processing with insurance claim management"
              },
              {
                icon: "🔔",
                title: "Notifications",
                description: "Real-time alerts for appointments, queue updates, and important announcements"
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="bg-gray-50 rounded-xl p-5 hover:shadow-card transition-all duration-300 card-hover"
              >
                {/* icon removed intentionally */}
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-xs text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-2xl font-bold mb-2">500+</div>
              <div className="text-xs text-blue-100">Hospitals</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-2">50K+</div>
              <div className="text-xs text-blue-100">Doctors</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-2">2M+</div>
              <div className="text-xs text-blue-100">Patients</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-2">99.9%</div>
              <div className="text-xs text-blue-100">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-large p-12 text-center text-white">
          <h2 className="text-2xl font-display font-bold mb-4">
            Ready to Transform Your Hospital?
          </h2>
          <p className="text-base text-blue-100 mb-8">
            Join hundreds of hospitals already using HospEase to improve patient care
          </p>
          <Link
            to="/register"
            className="inline-flex items-center bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold text-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                  <div className="w-6 h-6 bg-gradient-blue rounded-lg flex items-center justify-center"></div>
                <span className="text-base font-bold text-white">HospEase</span>
              </div>
              <p className="text-xs">Smart Hospital Queue Management System</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/demo" className="hover:text-white transition-colors">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link to="/security" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 HospEase. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

