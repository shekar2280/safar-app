import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Mail, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-[#e8e2d5] font-sans selection:bg-[#C9A84C] selection:text-black">
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 md:px-16 py-5 bg-black/60 backdrop-blur-xl border-b border-[rgba(201,168,76,0.15)]">
        <Link className="flex items-center gap-3 no-underline" href="/">
          <Image src="/app_logo.png" alt="Safar Logo" width={40} height={40} className="h-10 w-auto" style={{ width: 'auto' }} />
          <span className="font-playfair text-2xl font-bold tracking-[0.3em] text-[#C9A84C]">SAFAR</span>
        </Link>
        <Link className="border border-[rgba(201,168,76,0.15)] text-white px-5 py-2 rounded-full font-medium flex items-center gap-2 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all text-xs tracking-wider" href="/">
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[rgba(201,168,76,0.15)] rounded-lg flex items-center justify-center text-[#C9A84C]">
            <Shield size={20} />
          </div>
          <p className="text-xs tracking-[0.35em] uppercase text-[#C9A84C] font-semibold">Legal & Compliance</p>
        </div>

        <h1 className="font-playfair text-4xl md:text-5xl font-black mb-2 text-white">Privacy Policy</h1>
        <p className="text-xs text-[#6b6560] tracking-widest uppercase mb-12">Last Updated: June 11, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-[#a8a295]">
          <section>
            <h2 className="font-playfair text-xl font-bold text-white mb-3">1. Introduction</h2>
            <p>
              Safar is an AI-powered travel intelligence companion designed to make journey planning and local tracking seamless. 
              We value your trust and are fully committed to protecting your personal information. This Privacy Policy outlines 
              how we collect, use, store, and safeguard your data when using the Safar mobile application and services.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-xl font-bold text-white mb-3">2. Information We Collect</h2>
            <p className="mb-3">To provide you with personalized itineraries, budget tracking, and real-time navigation support, we collect the following categories of data:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-white">Account Details:</strong> When you authenticate via Google, we collect your full name, email address, and profile photo URL to create and maintain your secure user profile.
              </li>
              <li>
                <strong className="text-white">Location Information:</strong> With your permission, Safar accesses your device's geographical coordinates (GPS) to track visited sights on your active trip and issue location-aware notifications. This data is processed locally on your device and securely stored within your database instance.
              </li>
              <li>
                <strong className="text-white">Trip and Budget Data:</strong> We store your generated travel itineraries, travel group details, budgets, local spending lists, and active progress logs to keep your data synced across your devices.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-playfair text-xl font-bold text-white mb-3">3. How We Use Your Data</h2>
            <p className="mb-3">We utilize the collected information strictly for service delivery and experience optimization:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>To generate customized travel itineraries using artificial intelligence.</li>
              <li>To provide active location tracking and highlight proximity sights on your map.</li>
              <li>To allow real-time expense tracking and budget analytics.</li>
              <li>To synchronize your personal trips securely via our cloud database.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-playfair text-xl font-bold text-white mb-3">4. Data Sharing and Protection</h2>
            <p>
              Your personal data, including location coordinates, is private. We do not sell, trade, or share your personal data with any third-party marketing companies. 
              Data is stored securely using cloud infrastructure (Firebase) utilizing strict security protocols.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-xl font-bold text-white mb-3">5. Data Retention and Deletion (Right to Be Forgotten)</h2>
            <p>
              We believe in complete ownership of your personal data. You can delete your account and all associated records permanently at any time directly inside the application:
            </p>
            <p className="mt-2 bg-[#121212] border border-[rgba(201,168,76,0.15)] p-4 rounded-xl text-xs text-[#C9A84C] font-mono">
              Navigate to: Profile Tab &gt; Delete Account &gt; Confirm Account Termination
            </p>
            <p className="mt-2">
              Upon confirming account deletion, all saved trips, budget ledgers, identity info, and server-side files are permanently deleted.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-xl font-bold text-white mb-3">6. Contact Us</h2>
            <p className="flex items-center gap-2">
              If you have any questions or feedback regarding this policy, feel free to contact us:
            </p>
            <div className="mt-4 flex items-center gap-3 bg-[#121212] p-4 rounded-xl border border-[rgba(201,168,76,0.1)]">
              <Mail size={16} className="text-[#C9A84C]" />
              <a href="mailto:somashekar528234@gmail.com" className="text-white hover:text-[#C9A84C] transition-colors font-medium">somashekar528234@gmail.com</a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
