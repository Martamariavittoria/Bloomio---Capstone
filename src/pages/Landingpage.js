import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Landingpage.css';

// immagini statiche per il moodboard
import img1 from '../assets/mood1.jpeg';
import img2 from '../assets/mood2.jpeg';
import img3 from '../assets/mood3.jpeg';
import img4 from '../assets/mood4.jpeg';
import img5 from '../assets/mood5.jpeg';

const FadeInSection = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, ease: 'easeOut', delay }}
    viewport={{ once: true }}
  >
    {children}
  </motion.div>
);

export default function Landing() {
  const features = [
    {
      icon: '🎨',
      title: 'Shape Your Creative Journey',
      text: `From initial spark to final masterpiece, share every step of your process.
             Document ideas, gather feedback, and see your vision come alive.`
    },
    {
      icon: '🖼️',
      title: 'Craft Stunning Moodboards',
      text: `Collect, arrange and refine your visual inspirations with drag-and-drop ease.
             Play with layouts, textures and color stories until it feels just right.`
    },
    {
      icon: '🌈',
      title: 'Generate Bespoke Color Palettes',
      text: `Extract evocative swatches from any image in seconds.
             Mix, match and save palettes that perfectly capture your aesthetic.`
    },
    {
      icon: '🌐',
      title: 'Connect and Inspire',
      text: `Join a vibrant community of creators.  
             Collaborate on new ideas, spark conversations, and let your work travel the globe.`
    },
  ];

  const moodImages = [img1, img2, img3, img4, img5];

  return (
    <div className="landing-root">

      {/* === HERO: full-width, sfondo animato === */}
      <section className="hero-hero section hero-full">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1>Bloomio – Where your creativity blooms.</h1>
          <p>Share your projects, create unique moodboards, and inspire the world with your vision.</p>
          <div className="landing-buttons">
            <Link to="/auth?form=signup" className="landing-button">
              Start Now
            </Link>
            <Link to="/auth?form=login" className="landing-button transparent">
              Already have an account?
            </Link>
          </div>
        </div>
      </section>

      <div className="landing-container">

        {/* divider */}
        <hr className="section-divider" />

        {/* === FEATURES === */}
        <section className="features section-alt">
          <h2 className="section-title">What you can do on Bloomio</h2>
          <div className="features-grid">
            {features.map((f, i) => (
              <FadeInSection key={i} delay={0.2 + i*0.1}>
                <div className="feature-card">
                  <div className="feature-icon">{f.icon}</div>
                  <h3 className="feature-title">{f.title}</h3>
                  <p className="feature-text">{f.text}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </section>

        <hr className="section-divider" />

        {/* === MOODBOARD STATICO === */}
        <section className="moodboard section-alt">
          <FadeInSection delay={0.6}>
            <h2 className="section-title">Visual Moodboard</h2>
            <p className="section-sub">
              Questo è il moodboard statico di Bloomio, con le immagini che meglio rappresentano il nostro stile.
            </p>
            <div className="moodboard-grid">
              {moodImages.map((src, idx) => (
                <div key={idx} className="moodboard-card">
                  <img src={src} alt={`Mood ${idx + 1}`} />
                </div>
              ))}
            </div>
          </FadeInSection>
        </section>

        <hr className="section-divider" />

        {/* === ABOUT / MISSION === */}
        <section className="about section-alt">
          <div className="about-container">
            <FadeInSection delay={0.2}>
              <div className="about-card">
                <h3>Who We Are</h3>
                <p>
                  At Bloomio, we believe creativity is the ultimate form of self-expression.
                  Born from a passion for visual storytelling and a wish to connect dreamers worldwide,
                  our platform is a sanctuary where every brushstroke, sketch and pixel finds its voice.
                </p>
              </div>
            </FadeInSection>
            <FadeInSection delay={0.4}>
              <div className="about-card">
                <h3>Our Mission</h3>
                <p>
                  We empower artists of all backgrounds to share, collaborate and evolve.
                  With seamless tools for moodboards, color palettes and project publishing,
                  we remove barriers—so your creativity can truly bloom without bounds.
                </p>
              </div>
            </FadeInSection>
          </div>
        </section>

        <hr className="section-divider" />

        {/* === PHILOSOPHY === */}
        <section className="philosophy section-alt">
          <FadeInSection delay={0.2}>
            <h2 className="section-title">Our Creative Philosophy</h2>
            <p className="section-sub">
              We celebrate the beauty of imperfection and the thrill of unexpected inspiration.
              Every palette tells an emotional story; every layout sparks fresh ideas.
              At Bloomio, experimentation is king, rules are suggestions, and the only limit is your imagination.
            </p>
          </FadeInSection>
          <FadeInSection delay={0.4}>
            <h2 className="section-title">Create. Inspire. Share.</h2>
            <p className="section-sub">
              Whether you work in paint, pixels or code, this is your playground.
              Launch your next project, forge new collaborations, and share your artistic journey
              with a community that’s as passionate as you are.  
            </p>
          </FadeInSection>
        </section>

      </div>{/* fine landing-container */}
    </div>
  );
}
