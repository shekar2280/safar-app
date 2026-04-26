"use client";

import React, { useEffect } from 'react';
import Image from 'next/image';
import { Play, Info, Cpu, Sparkles, Map, Github, Linkedin, Mail, Download } from 'lucide-react';

export default function SafarLanding() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    return () => {
      revealElements.forEach(el => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  return (
    <div className="bg-black text-[#e8e2d5] selection:bg-[#C9A84C] selection:text-black">
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 md:px-16 py-5 bg-black/60 backdrop-blur-xl border-b border-[rgba(201,168,76,0.15)]">
        <a className="flex items-center gap-3 no-underline" href="#">
          <Image src="/app_logo.png" alt="Safar Logo" width={40} height={40} className="h-10 w-auto" style={{ width: 'auto' }} priority />
          <span className="font-playfair text-2xl font-bold tracking-[0.3em] text-[#C9A84C]">SAFAR</span>
        </a>
        <ul className="hidden md:flex gap-10 list-none uppercase text-[0.8rem] tracking-[0.1em]">
          <li><a href="#ai" className="text-[#6b6560] no-underline hover:text-[#C9A84C] transition-colors">Itineraries</a></li>
          <li><a href="#suite" className="text-[#6b6560] no-underline hover:text-[#C9A84C] transition-colors">Features</a></li>
          <li><a href="#tech" className="text-[#6b6560] no-underline hover:text-[#C9A84C] transition-colors">Tech</a></li>
        </ul>
        <a className="bg-[#C9A84C] text-black px-6 py-2.5 rounded-full font-['DM_Sans'] text-[0.8rem] font-medium tracking-wide hover:bg-[#EAB308] transition-all no-underline" href="https://expo.dev/accounts/shekar-safar/projects/safar/builds/0d0fd110-0b84-4032-96f1-fafb0add09cc" target="_blank" rel="noopener noreferrer">Download APK</a>
      </nav>

      <section className="min-h-screen flex flex-col items-center justify-center text-center px-8 md:px-16 pt-32 pb-16 relative overflow-hidden">
        <div className="hero-glow" />
        <p className="reveal hero-eyebrow text-[0.7rem] tracking-[0.35em] uppercase text-[#C9A84C] mb-6 font-medium">AI-Powered Travel Intelligence</p>
        <h1 className="reveal reveal-delay-1 font-playfair text-5xl md:text-9xl font-black leading-[0.9] mb-8 flex flex-col items-center">
          <span className="hero-headline">If You Never Go,</span>
          <span className="text-outline italic font-normal mt-2 md:-mt-4 relative z-10">You Will Never Know.</span>
        </h1>
        <p className="reveal reveal-delay-2 text-lg md:text-xl text-[#6b6560] max-w-[520px] mx-auto mb-12 leading-relaxed">
          Safar blends <span className="text-[#C9A84C]">Advanced AI</span> with luxury travel design — crafting real-time itineraries, tracking your budget, and surfacing unexplored gems.
        </p>

        <div className="reveal reveal-delay-3 flex gap-4 justify-center flex-wrap mb-20">
          <a className="bg-[#C9A84C] text-black px-8 py-3.5 rounded-full font-medium flex items-center gap-2 hover:bg-[#EAB308] hover:-translate-y-0.5 transition-all shadow-lg shadow-[#C9A84C]/30 no-underline" href="#suite">
            <Play size={16} fill="currentColor" /> Explore Features
          </a>
          <a className="border border-[rgba(201,168,76,0.15)] text-white px-8 py-3.5 rounded-full font-medium flex items-center gap-2 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all backdrop-blur-md no-underline" href="#ai">
            <Info size={16} /> How it Works
          </a>
        </div>

        <div className="reveal reveal-delay-4 w-px h-20 bg-gradient-to-b from-transparent via-[#C9A84C] to-transparent mx-auto mb-12" />

        <div className="reveal reveal-delay-4 flex gap-8 justify-center items-end">
          <div className="phone-wrapper animate-[floatA_5s_ease-in-out_infinite] -rotate-3">
            <div className="absolute -inset-5 bg-[radial-gradient(circle,rgba(201,168,76,0.08)_0%,transparent_70%)] rounded-[50px] pointer-events-none" />
            <div className="phone-frame">
              <Image src="/homepage.jpg" alt="Home" width={260} height={560} className="w-full block" style={{ height: 'auto' }} priority />
            </div>
            <p className="mt-4 text-[0.7rem] tracking-widest text-[#6b6560] uppercase text-center">Journey Hub</p>
          </div>
          <div className="phone-wrapper animate-[floatB_5s_ease-in-out_infinite] rotate-3 hidden sm:block">
            <div className="phone-frame">
              <Image src="/activeTrips.jpg" alt="Trips" width={260} height={560} className="w-full block" style={{ height: 'auto' }} priority />
            </div>
            <p className="mt-4 text-[0.7rem] tracking-widest text-[#6b6560] uppercase text-center">Live Sync</p>
          </div>
        </div>
      </section>

      <section id="ai" className="py-24 md:py-32 px-8 md:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[0.7rem] tracking-[0.35em] uppercase text-[#C9A84C] mb-4">Core Intelligence</p>
            <h2 className="font-playfair text-4xl md:text-6xl font-bold leading-tight mb-6">Designed for the<br />Digital Nomad.</h2>
            <div className="w-16 h-px bg-[#C9A84C] my-6" />
            <p className="text-[#6b6560] text-lg leading-relaxed mb-10 max-w-lg">
              Safar uses advanced LLMs to parse your preferences and environmental data, providing a seamless travel experience that learns from you.
            </p>

            <div className="flex flex-col gap-6">
              {[
                { icon: <Cpu size={20} />, title: "Contextual Logic", desc: "Itineraries that adapt to weather, transit, and local events." },
                { icon: <Sparkles size={20} />, title: "Hidden Gems", desc: "Our AI prioritizes off-the-beaten-path locations over tourist traps." },
                { icon: <Map size={20} />, title: "Offline First", desc: "Access your critical travel data even without an internet connection." }
              ].map((item, i) => (
                <div key={i} className="reveal flex gap-4 p-5 bg-white/5 border border-[rgba(201,168,76,0.15)] rounded-2xl backdrop-blur-md hover:border-[#C9A84C] transition-all hover:translate-x-1">
                  <div className="w-10 h-10 bg-[rgba(201,168,76,0.15)] rounded-lg flex items-center justify-center text-[#C9A84C]">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1">{item.title}</h4>
                    <p className="text-xs text-[#6b6560] leading-normal">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="reveal flex justify-center relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(201,168,76,0.08)_0%,transparent_70%)] pointer-events-none" />
            <div className="w-64 md:w-72 rounded-[30px] border-2 border-[rgba(201,168,76,0.2)] overflow-hidden shadow-2xl bg-black ai-phone">
              <Image src="/activeTripDetails-1.jpg" alt="AI Detail" width={288} height={620} className="w-full block" style={{ height: 'auto' }} />
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24 md:pb-32 pt-8 px-8 md:px-16 max-w-7xl mx-auto overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <p className="text-[0.7rem] tracking-[0.35em] uppercase text-[#C9A84C] mb-4">Curated Vibes</p>
            <h2 className="font-playfair text-4xl md:text-6xl font-bold leading-tight">Travel By<br />Your Mood.</h2>
          </div>
          <p className="text-[#6b6560] max-w-sm text-lg leading-relaxed md:pb-2">
            Whether you are chasing the energy of a music festival or looking for a quiet festive retreat, Safar finds the perfect match.
          </p>
        </div>

        <div className="flex overflow-x-auto gap-6 pb-12 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden -mx-8 px-8 md:mx-0 md:px-0">
          {[
            { img: "/trendingTripsPage.jpg", title: "Trending Destinations", subtitle: "What's Hot Now" },
            { img: "/concertTripsPage.jpg", title: "Music & Concerts", subtitle: "Live Experiences" },
            { img: "/festiveTripsPage.jpg", title: "Festive Escapes", subtitle: "Cultural Immersions" },
            { img: "/tripDetails-1.jpg", title: "Visual Itineraries", subtitle: "Beautifully Designed" }
          ].map((item, i) => (
            <div key={i} className="reveal snap-center shrink-0 w-[280px] md:w-[320px] group cursor-pointer">
              <div className="rounded-[32px] border-2 border-[rgba(201,168,76,0.15)] overflow-hidden bg-black mb-6 relative group-hover:border-[#C9A84C] transition-colors duration-500">
                <Image src={item.img} alt={item.title} width={320} height={580} className="w-full h-[580px] object-cover object-top transition-transform duration-700 group-hover:scale-105" style={{ height: 'auto' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <h4 className="font-playfair text-xl font-bold text-white mb-1 group-hover:text-[#C9A84C] transition-colors">{item.title}</h4>
              <p className="text-xs tracking-[0.15em] text-[#6b6560] uppercase">{item.subtitle}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="suite" className="pb-24 md:pb-32 pt-8 px-8 md:px-16 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[0.7rem] tracking-[0.35em] uppercase text-[#C9A84C] mb-4">Complete Ecosystem</p>
          <h2 className="font-playfair text-4xl md:text-6xl font-bold mb-6">Built for Excellence.</h2>
          <p className="text-[#6b6560] max-w-xl mx-auto">A unified suite of tools designed to remove the friction from your global explorations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { img: "/discoverTrips.jpg", badge: "EXPLORE", title: "Smart Discovery", desc: "Personalized recommendations that understand your unique vibe." },
            { img: "/activeTrips.jpg", badge: "ORGANIZE", title: "Trip Management", desc: "Collaborative planning tools to sync with friends and family." },
            { img: "/walletDetail.jpg", badge: "MONITOR", title: "Financial Hub", desc: "Real-time expense tracking with automated currency conversion." },
            { img: "/activeTripDetails-1.jpg", badge: "NAVIGATE", title: "Live Itinerary", desc: "Minute-by-minute updates as your travel day unfolds." },
            { img: "/hiddenGemsPage.jpg", badge: "CURATE", title: "Local Insights", desc: "Curated lists of spots from travelers who've been there." },
            { img: "/profilePage.jpg", badge: "IDENTITY", title: "Traveler Profile", desc: "Your digital passport, tracking every milestone and memory." }
          ].map((card, i) => (
            <div key={i} className="reveal suite-card bg-white/5 border border-[rgba(201,168,76,0.15)] rounded-3xl overflow-hidden backdrop-blur-md hover:translate-y-[-8px] hover:border-[rgba(201,168,76,0.4)] hover:shadow-2xl hover:shadow-[rgba(201,168,76,0.1)]">
              <Image src={card.img} alt={card.title} width={400} height={550} className="w-full h-[550px] object-cover object-top block" style={{ height: 'auto' }} />
              <div className="p-8">
                <span className="inline-block bg-[rgba(201,168,76,0.15)] border border-[rgba(201,168,76,0.3)] text-[#C9A84C] text-[0.65rem] tracking-[0.2em] uppercase px-3 py-1 rounded-full mb-3">{card.badge}</span>
                <h3 className="font-playfair text-xl font-bold mb-2 text-white">{card.title}</h3>
                <p className="text-sm text-[#6b6560] leading-relaxed">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="tech" className="pb-24 md:pb-32 pt-8 px-8 md:px-16 max-w-4xl mx-auto text-center">
        <p className="text-[0.7rem] tracking-[0.35em] uppercase text-[#C9A84C] mb-4">Engineering</p>
        <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-16">Cutting Edge Foundation.</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { logo: "/tech/react-native.svg", name: "React Native", desc: "Native Frontend" },
            { logo: "https://cdn.worldvectorlogo.com/logos/fastapi-1.svg", name: "FastAPI", desc: "High-Performance Backend" },
            { logo: "/tech/gemini-icon.svg", name: "Gemini LLM", desc: "Intelligence Engine" },
            { logo: "https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg", name: "PostgreSQL", desc: "Relational Database" }
          ].map((tech, i) => (
            <div key={i} className="reveal flex flex-col items-center gap-4 p-8 bg-white/5 border border-[rgba(201,168,76,0.15)] rounded-2xl backdrop-blur-md transition-all hover:border-[rgba(201,168,76,0.4)] hover:translate-y-[-4px]">
              <div className="w-12 h-12 flex items-center justify-center bg-[rgba(201,168,76,0.15)] rounded-xl">
                <Image src={tech.logo} alt={tech.name} width={32} height={32} className="w-8 h-8 object-contain" style={{ width: 'auto', height: 'auto' }} />
              </div>
              <span className="text-sm font-medium text-white tracking-wide">{tech.name}</span>
              <p className="text-[0.7rem] text-[#6b6560]">{tech.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer id="footer" className="py-12 px-8 md:px-16 bg-black relative overflow-hidden border-t border-[rgba(201,168,76,0.15)]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 items-start">
          <div className="col-span-1 lg:col-span-2">
            <a className="flex items-center gap-4 no-underline mb-4" href="#">
              <Image src="/app_logo.png" alt="Safar Logo" width={40} height={40} className="h-10 w-auto" style={{ width: 'auto' }} />
              <span className="font-playfair text-3xl font-bold tracking-[0.3em] text-[#C9A84C]">SAFAR</span>
            </a>
            <p className="text-[0.8rem] text-[#6b6560] tracking-[0.15em] uppercase mb-8">Beyond the horizon awaits.</p>
            <div className="flex gap-4">
              <a href="https://github.com/shekar2280" className="w-10 h-10 rounded-full border border-[rgba(201,168,76,0.15)] flex items-center justify-center text-[#6b6560] hover:text-[#C9A84C] hover:border-[#C9A84C] transition-all"><Github size={18} /></a>
              <a href="https://www.linkedin.com/in/t-somashekar/" className="w-10 h-10 rounded-full border border-[rgba(201,168,76,0.15)] flex items-center justify-center text-[#6b6560] hover:text-[#C9A84C] hover:border-[#C9A84C] transition-all"><Linkedin size={18} /></a>
              <a href="mailto:somashekar2025@gmail.com" className="w-10 h-10 rounded-full border border-[rgba(201,168,76,0.15)] flex items-center justify-center text-[#6b6560] hover:text-[#C9A84C] hover:border-[#C9A84C] transition-all"><Mail size={18} /></a>
            </div>
          </div>

          <div className="flex flex-col gap-6 items-start md:items-end">
            <a className="bg-[#C9A84C] text-black px-8 py-3 rounded-full font-medium hover:bg-[#EAB308] transition-all no-underline inline-flex items-center gap-2" href="https://expo.dev/accounts/shekar-safar/projects/safar/builds/0d0fd110-0b84-4032-96f1-fafb0add09cc" target="_blank" rel="noopener noreferrer">
              <Download size={18} /> Get the App
            </a>
            <p className="text-[0.65rem] text-[#6b6560]/40 tracking-widest uppercase">© 2026 Safar App. All rights reserved.</p>
          </div>
        </div>
        <div className="footer-glow absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(201,168,76,0.06)_0%,transparent_70%)] pointer-events-none" />
      </footer>
    </div>
  );
}
