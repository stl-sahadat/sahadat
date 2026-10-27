/**
 * Type Definitions for Md Sahadat Hossain's Portfolio Architecture
 * High-concurrency AI Agent Architect & Prompt Engineer Portfolio
 */

export interface ProfileData {
  name: string;
  greeting: string;
  title_split: string;
  title_line1: string;
  title_line2: string;
  avatar_img: string;
  hero_img: string;
  hero_cutout: string;
  about_img: string;
  hero_video?: string;
  resume_url: string;
  location: string;
  specialization: string;
  badge: string;
  bio: string;
  quote_badge: string;
  stats: Array<{
    number: string;
    label: string;
  }>;
}

export interface ProjectItem {
  id: number | string;
  num: string;
  category: string;
  title: string;
  stack_tag: string;
  desc: string;
  img: string;
  live: string;
  github: string;
  tags?: string[];
}

export interface ExperienceItem {
  id: number | string;
  period: string;
  company: string;
  role: string;
  badge: string;
  desc: string;
  points: string[];
}

export interface SkillItem {
  name: string;
  level: string;
  icon?: string;
}

export interface SkillCategory {
  title: string;
  skills: SkillItem[];
}

export interface RouteMapping {
  id: string;
  path: string;
  label: string;
}

export interface PortfolioAnalyticsEngine {
  trackPageView: (path: string) => void;
  trackSection: (sectionId: string) => void;
  trackInteraction: (action: string, category: string, label?: string) => void;
}

declare global {
  interface Window {
    PortfolioAnalytics?: PortfolioAnalyticsEngine;
    ScrollReveal?: any;
    Swiper?: any;
    THREE?: any;
    gsap?: any;
  }
}
