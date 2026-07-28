'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Hero3DSection from '../components/hero/Hero3DSection';
import FeaturedCollections from '../components/home/FeaturedCollections';
import BestSellers from '../components/home/BestSellers';
import BrandStory from '../components/home/BrandStory';
import Testimonials from '../components/home/Testimonials';

export default function HomeClient() {
  return (
    <div className="space-y-12 bg-white text-black w-full">
      {/* Hero 3D Section */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Hero3DSection />
      </motion.div>

      {/* Featured Collections with TikTok Edit Reveal */}
      <motion.div
        initial={{ opacity: 0, y: 45, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <FeaturedCollections />
      </motion.div>

      {/* Best Sellers Watch Catalog */}
      <motion.div
        initial={{ opacity: 0, y: 45, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <BestSellers />
      </motion.div>

      {/* Brand Horology Story */}
      <motion.div
        initial={{ opacity: 0, y: 45, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <BrandStory />
      </motion.div>

      {/* Client Testimonials */}
      <motion.div
        initial={{ opacity: 0, y: 45, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Testimonials />
      </motion.div>
    </div>
  );
}
