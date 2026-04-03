"use client";

import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-[#0B1120] text-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <h3
              className="text-xl tracking-[0.2em] mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              VASTRA VIRASAT
            </h3>
            <p className="text-white/40 text-sm leading-relaxed">
              A curated lookbook of handcrafted Indian garments. Each piece is a
              story of human patience and artistry.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] tracking-[0.25em] uppercase text-white/60 mb-4">
              Shop
            </h4>
            <ul className="space-y-2.5 text-sm text-white/40">
              <li><a href="#" className="hover:text-white transition-colors">Women</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Men</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Accessories</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Bridal</a></li>
              <li><a href="#" className="hover:text-white transition-colors text-[#D4A537]">Sale</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] tracking-[0.25em] uppercase text-white/60 mb-4">
              Help
            </h4>
            <ul className="space-y-2.5 text-sm text-white/40">
              <li><span>Shipping Info</span></li>
              <li><span>Returns & Exchanges</span></li>
              <li><span>Size Guide</span></li>
              <li><span>Contact Us</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] tracking-[0.25em] uppercase text-white/60 mb-4">
              Get 10% Off
            </h4>
            <p className="text-white/40 text-sm mb-4">
              Subscribe for new arrivals and exclusive offers.
            </p>
            {subscribed ? (
              <p className="text-sm text-[#D4A537]">Welcome to the family.</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30"
                />
                <button
                  type="submit"
                  className="bg-white text-[#0B1120] px-5 py-2.5 text-[10px] tracking-[0.2em] uppercase hover:bg-[#D4A537] hover:text-black transition-colors"
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-white/20 tracking-wide">
            &copy; 2026 Vastra Virasat. All rights reserved.
          </p>
          <p className="text-[10px] text-white/20 tracking-wide">
            Handcrafted with love across India
          </p>
        </div>
      </div>
    </footer>
  );
}
