// pages/index.js
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>IELTS Mock Test Platform - Practice Like the Real Exam</title>
        <meta name="description" content="Book your IELTS computer-based mock test today. Academic & General IELTS mock tests with instant booking and results via email." />
      </Head>
      <div className="min-h-screen bg-white">

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Book Your IELTS Computer-Based Mock Test Today
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
                Academic & General IELTS Mock Tests — Practice Like the Real Exam
              </p>
              <p className="text-lg mb-10 text-blue-50 max-w-2xl mx-auto">
                Experience authentic computer-based IELTS mock tests designed to simulate the actual exam environment. 
                Get detailed results via email and boost your confidence before the real test.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a
                  href="/register"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition transform hover:scale-105 shadow-lg"
                >
                  Register Now
                </a>
                <a
                  href="/login"
                  className="bg-transparent border-2 border-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition transform hover:scale-105"
                >
                  Login
                </a>
              </div>
            </div>
          </div>
          {/* Wave divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
            </svg>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose Our Platform?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Everything you need to prepare for your IELTS exam with confidence
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Computer-Based Tests</h3>
                <p className="text-gray-600">
                  Experience IELTS tests in real computer-based format, exactly like the actual exam
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Instant Booking</h3>
                <p className="text-gray-600">
                  Book your test online easily with secure login and get instant confirmation
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Results via Email</h3>
                <p className="text-gray-600">
                  Receive your detailed test results directly to your email inbox
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Academic & General</h3>
                <p className="text-gray-600">
                  Choose from Academic or General Training modules based on your needs
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Simple steps to start your IELTS mock test journey
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Register</h3>
                <p className="text-gray-600">
                  Create your account with basic details
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Choose Test</h3>
                <p className="text-gray-600">
                  Select Academic or General mock test
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Make Payment</h3>
                <p className="text-gray-600">
                  Pay securely and upload payment slip
                </p>
              </div>

              {/* Step 4 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  4
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Take Test</h3>
                <p className="text-gray-600">
                  Attempt test and get results via email
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Success Stories
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                See what our students say about their experience
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    S
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900">Sarah Ahmed</h4>
                    <p className="text-sm text-gray-600">Band 8.0</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "The mock tests were incredibly helpful! The computer-based format prepared me perfectly for the actual exam. Got 8.0 overall!"
                </p>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    M
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900">Muhammad Khan</h4>
                    <p className="text-sm text-gray-600">Band 7.5</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "Great platform! The instant booking and detailed results helped me identify my weak areas and improve before the real test."
                </p>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    A
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900">Ayesha Malik</h4>
                    <p className="text-sm text-gray-600">Band 7.0</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "Excellent service! The test environment was realistic and the results came quickly via email. Highly recommend!"
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Your IELTS Preparation?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Join hundreds of students who have improved their IELTS scores with our mock tests
            </p>
            <a
              href="/register"
              className="inline-block bg-white text-blue-600 px-10 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition transform hover:scale-105 shadow-lg"
            >
              Get Started Today
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-4 gap-8">
              {/* About */}
              <div>
                <h3 className="text-xl font-bold mb-4">IELTS Mock Platform</h3>
                <p className="text-gray-400">
                  Your trusted partner for IELTS preparation with authentic computer-based mock tests.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <li><a href="/" className="text-gray-400 hover:text-white transition">Home</a></li>
                  <li><a href="/about" className="text-gray-400 hover:text-white transition">About Us</a></li>
                  <li><a href="/register" className="text-gray-400 hover:text-white transition">Register</a></li>
                  <li><a href="/login" className="text-gray-400 hover:text-white transition">Login</a></li>
                </ul>
              </div>

              {/* Services */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Our Services</h4>
                <ul className="space-y-2">
                  <li className="text-gray-400">Academic Mock Tests</li>
                  <li className="text-gray-400">General Training Tests</li>
                  <li className="text-gray-400">Instant Results</li>
                  <li className="text-gray-400">Email Support</li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
                <ul className="space-y-2">
                  <li><a href="/contact" className="text-gray-400 hover:text-white transition">Contact Page</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition">WhatsApp Support</a></li>
                  <li className="text-gray-400">Email: info@ieltsmock.com</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-center">
              <p className="text-gray-400">© 2025 IELTS Mock Test Platform. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
