/**
 * @file src/app/page.tsx
 * @fileoverview Landing page with animations using Framer Motion and custom icons.
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import SignInForm from "@/components/auth/SignInForm";
import SignUpForm from "@/components/auth/SignUpForm";


export default function LandingPage() {
    const [formType, setFormType] = useState<"signin" | "signup" | null>(null);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center pt-20 pb-10 px-6 ">
        <motion.h1
          className="text-4xl sm:text-6xl font-bold mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Gérez vos véhicules facilement
        </motion.h1>

        <motion.p
          className="max-w-xl text-gray-600 dark:text-gray-300 text-lg mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          Une solution simple, rapide et intuitive pour suivre et gérer vos véhicules.
        </motion.p>

        <motion.div
          className="flex gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setFormType(formType === "signin" ? null : "signin")}
            className="px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-600 transition"
          >
            Connexion
          </button>
          <button
            onClick={() => setFormType(formType === "signup" ? null : "signup")}
            className="px-6 py-2 bg-transparent border border-blue-700 text-blue-700 rounded hover:bg-blue-50 dark:hover:bg-blue-950 transition"
          >
            Inscription
          </button>
        </div>
        </motion.div>
      </section>

      <AnimatePresence mode="wait">
        {formType && (
            <motion.div
            key={formType}
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: {
              height: "auto",
              opacity: 1,
              transition: {
                height: { duration: 0.45, delay: 0.15 },
                opacity: { duration: 0.25, delay: 0.15 },
              },
              },
              collapsed: {
              height: 0,
              opacity: 0,
              transition: {
                // fade out first
                opacity: { duration: 0.2 },
                // then collapse height so content below moves up after a delay
                height: { duration: 0.35, delay: 0.2 },
              },
              },
            }}
            className="w-full flex justify-center overflow-hidden"
            >
              <motion.div
                key={formType}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2, delay: 0.15 }}
                className="w-full flex justify-center"
              >
                {formType === "signin" && <SignInForm />}
                {formType === "signup" && <SignUpForm />}
              </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {[
            {
              icon: "/icons/dashboard.svg",
              title: "Tableau de bord clair",
              desc: "Visualisez toutes vos données au même endroit.",
            },
            {
              icon: "/icons/secure.svg",
              title: "Sécurité des données",
              desc: "Vos informations sont protégées et cryptées.",
            },
            {
              icon: "/icons/responsive.svg",
              title: "Responsive",
              desc: "Utilisable sur PC, tablette et mobile.",
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex justify-center mb-4 dark:invert">
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  width={64}
                  height={64}
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm mt-auto">
        © {new Date().getFullYear()} ma-voiture-sandy. Tous droits réservés.
      </footer>
    </main>
  );
}