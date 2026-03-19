import { Link } from 'react-router-dom';
import { Building, Users, BarChart3, ShieldCheck, ArrowRight, CheckCircle, Zap, Clock, TrendingUp, Award, MessageSquare, Bell } from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: Building,
      title: 'Hostel Management',
      description: 'Streamline complaint handling across multiple hostel blocks with organized tracking and efficient workflows.',
      gradient: 'from-primary-500 to-primary-600'
    },
    {
      icon: Users,
      title: 'Role-based Access',
      description: 'Different interfaces for students, wardens, and administrators with appropriate permissions and security.',
      gradient: 'from-secondary-500 to-secondary-600'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Comprehensive insights and reports on complaint trends, resolution rates, and performance metrics.',
      gradient: 'from-accent-500 to-accent-600'
    },
    {
      icon: ShieldCheck,
      title: 'Secure & Reliable',
      description: 'Built with modern security practices to ensure data protection, privacy, and system reliability.',
      gradient: 'from-success-500 to-success-600'
    }
  ];

  const benefits = [
    { icon: Zap, text: 'Fast Response Times' },
    { icon: Clock, text: '24/7 Availability' },
    { icon: TrendingUp, text: 'Real-time Updates' },
    { icon: Award, text: 'High Satisfaction Rate' },
    { icon: MessageSquare, text: 'Direct Communication' },
    { icon: Bell, text: 'Smart Notifications' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">HS</span>
              </div>
              <div>
                <span className="font-bold text-xl text-neutral-900">HostelSync</span>
                <p className="text-xs text-neutral-500 -mt-0.5">Complaint Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/signup"
                className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors"
              >
                Sign Up
              </Link>
              <div className="relative group">
                <button className="btn-primary px-6 py-2 text-sm font-medium">
                  Login
                </button>
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-neutral-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                  <div className="py-2">
                    <Link
                      to="/login/student"
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    >
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <span className="text-primary-600 font-semibold text-xs">S</span>
                      </div>
                      <div>
                        <p className="font-medium">Student Login</p>
                        <p className="text-xs text-neutral-500">Access student portal</p>
                      </div>
                    </Link>
                    <Link
                      to="/login/warden"
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-neutral-700 hover:bg-warning-50 hover:text-warning-600 transition-colors"
                    >
                      <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                        <span className="text-warning-600 font-semibold text-xs">W</span>
                      </div>
                      <div>
                        <p className="font-medium">Warden Login</p>
                        <p className="text-xs text-neutral-500">Manage complaints</p>
                      </div>
                    </Link>
                    <Link
                      to="/login/admin"
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-neutral-700 hover:bg-accent-50 hover:text-accent-600 transition-colors"
                    >
                      <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                        <span className="text-accent-600 font-semibold text-xs">A</span>
                      </div>
                      <div>
                        <p className="font-medium">Admin Login</p>
                        <p className="text-xs text-neutral-500">System administration</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
              Simplify Hostel
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-white mt-2">
                Complaint Management
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-primary-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              A comprehensive solution for managing hostel complaints efficiently. 
              Streamline communication between students, wardens, and administrators 
              with our intuitive platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <button className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300">
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-white mb-2">500+</div>
                <div className="text-primary-100">Active Users</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-white mb-2">95%</div>
                <div className="text-primary-100">Resolution Rate</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-white mb-2">24/7</div>
                <div className="text-primary-100">Support Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-xl mb-3">
                  <benefit.icon className="w-6 h-6 text-primary-600" />
                </div>
                <p className="text-sm font-medium text-neutral-700">{benefit.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
              Everything You Need for Effective Management
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Powerful features designed to streamline your hostel operations and enhance communication
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-8 border border-neutral-200 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">{feature.title}</h3>
                <p className="text-neutral-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Simple steps to manage complaints efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Submit Complaint</h3>
              <p className="text-neutral-600">Students can easily submit complaints with photos and detailed descriptions.</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-100 rounded-full mb-6">
                <span className="text-2xl font-bold text-secondary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Warden Review</h3>
              <p className="text-neutral-600">Wardens review and update complaint status, tracking progress in real-time.</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-100 rounded-full mb-6">
                <span className="text-2xl font-bold text-accent-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Resolution</h3>
              <p className="text-neutral-600">Once resolved, students can provide feedback to improve the system.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-secondary-600 to-accent-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Transform Your Hostel Management?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join hundreds of hostels already using HostelSync to improve their operations and enhance student satisfaction.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              Start Your Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <button className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">HS</span>
                </div>
                <div>
                  <span className="font-bold text-2xl">HostelSync</span>
                  <p className="text-neutral-400 text-sm">Complaint Management System</p>
                </div>
              </div>
              <p className="text-neutral-400 mb-6 max-w-md">
                Streamline your hostel operations with our comprehensive complaint management platform designed for modern educational institutions.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/signup" className="text-neutral-400 hover:text-primary-400 transition-colors">Sign Up</Link></li>
                <li><Link to="/login/student" className="text-neutral-400 hover:text-primary-400 transition-colors">Student Login</Link></li>
                <li><Link to="/login/warden" className="text-neutral-400 hover:text-primary-400 transition-colors">Warden Login</Link></li>
                <li><Link to="/login/admin" className="text-neutral-400 hover:text-primary-400 transition-colors">Admin Login</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-neutral-400 hover:text-primary-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-primary-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-primary-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-primary-400 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-neutral-400 text-sm">
                © 2024 HostelSync. All rights reserved.
              </p>
              <p className='text-neutral-400 text-sm'>Developed by deepu kumar</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-neutral-400 hover:text-primary-400 transition-colors">Twitter</a>
                <a href="#" className="text-neutral-400 hover:text-primary-400 transition-colors">LinkedIn</a>
                <a href="#" className="text-neutral-400 hover:text-primary-400 transition-colors">GitHub</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
