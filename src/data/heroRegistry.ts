import React from 'react';

// Restaurant
import RestaurantHero1 from '../components/hero/heroes/restaurant/RestaurantHero1';
import RestaurantHero2 from '../components/hero/heroes/restaurant/RestaurantHero2';
import RestaurantHero3 from '../components/hero/heroes/restaurant/RestaurantHero3';

// SaaS
import SaasHero1 from '../components/hero/heroes/saas/SaasHero1';
import SaasHero2 from '../components/hero/heroes/saas/SaasHero2';
import SaasHero3 from '../components/hero/heroes/saas/SaasHero3';

// Real Estate
import RealEstateHero1 from '../components/hero/heroes/realestate/RealEstateHero1';
import RealEstateHero2 from '../components/hero/heroes/realestate/RealEstateHero2';
import RealEstateHero3 from '../components/hero/heroes/realestate/RealEstateHero3';

// E-commerce
import EcommerceHero1 from '../components/hero/heroes/ecommerce/EcommerceHero1';
import EcommerceHero2 from '../components/hero/heroes/ecommerce/EcommerceHero2';
import EcommerceHero3 from '../components/hero/heroes/ecommerce/EcommerceHero3';

// Healthcare
import HealthcareHero1 from '../components/hero/heroes/healthcare/HealthcareHero1';
import HealthcareHero2 from '../components/hero/heroes/healthcare/HealthcareHero2';
import HealthcareHero3 from '../components/hero/heroes/healthcare/HealthcareHero3';

export interface HeroRegistryItem {
  id: string;
  industry: 'restaurant' | 'saas' | 'realestate' | 'ecommerce' | 'healthcare';
  component: React.ComponentType<any>;
  label: string;
  tags: string[];
  layout: string;
}

export const heroRegistry: HeroRegistryItem[] = [
  // Restaurant
  {
    id: "restaurant-hero-1",
    industry: "restaurant",
    component: RestaurantHero1,
    label: "Restaurant — Bold Full Bleed",
    tags: ["dark", "full-bleed", "image-heavy"],
    layout: "full-bleed-image-bg"
  },
  {
    id: "restaurant-hero-2",
    industry: "restaurant",
    component: RestaurantHero2,
    label: "Restaurant — Warm Split",
    tags: ["warm", "split", "modern"],
    layout: "split-content-image"
  },
  {
    id: "restaurant-hero-3",
    industry: "restaurant",
    component: RestaurantHero3,
    label: "Restaurant — Minimal Light",
    tags: ["minimal", "light", "centered"],
    layout: "centered-minimal"
  },

  // SaaS
  {
    id: "saas-hero-1",
    industry: "saas",
    component: SaasHero1,
    label: "SaaS — Dark Product Mockup",
    tags: ["dark", "gradient", "social-proof"],
    layout: "centered-mockup"
  },
  {
    id: "saas-hero-2",
    industry: "saas",
    component: SaasHero2,
    label: "SaaS — Split Animated UI",
    tags: ["split", "email-capture", "animated-ui"],
    layout: "split-interactive"
  },
  {
    id: "saas-hero-3",
    industry: "saas",
    component: SaasHero3,
    label: "SaaS — Floating Features",
    tags: ["light", "cards", "clean"],
    layout: "floating-cards"
  },

  // Real Estate
  {
    id: "realestate-hero-1",
    industry: "realestate",
    component: RealEstateHero1,
    label: "Real Estate — Full Bleed Search",
    tags: ["full-bleed", "search-bar", "dark-overlay"],
    layout: "full-bleed-search"
  },
  {
    id: "realestate-hero-2",
    industry: "realestate",
    component: RealEstateHero2,
    label: "Real Estate — Split Properties",
    tags: ["split", "cards", "modern"],
    layout: "split-cards"
  },
  {
    id: "realestate-hero-3",
    industry: "realestate",
    component: RealEstateHero3,
    label: "Real Estate — Minimal Grid",
    tags: ["minimal", "light", "grid"],
    layout: "minimal-grid"
  },

  // E-commerce
  {
    id: "ecommerce-hero-1",
    industry: "ecommerce",
    component: EcommerceHero1,
    label: "E-commerce — Bold Lifestyle",
    tags: ["lifestyle", "bold", "trust-badges"],
    layout: "full-bleed-lifestyle"
  },
  {
    id: "ecommerce-hero-2",
    industry: "ecommerce",
    component: EcommerceHero2,
    label: "E-commerce — Split Product",
    tags: ["split", "product-focus", "reviews"],
    layout: "split-product"
  },
  {
    id: "ecommerce-hero-3",
    industry: "ecommerce",
    component: EcommerceHero3,
    label: "E-commerce — Category Pills",
    tags: ["minimal", "categories", "featured-product"],
    layout: "centered-categories"
  },

  // Healthcare
  {
    id: "healthcare-hero-1",
    industry: "healthcare",
    component: HealthcareHero1,
    label: "Healthcare — Trust Centered",
    tags: ["light", "trust", "centered"],
    layout: "centered-trust"
  },
  {
    id: "healthcare-hero-2",
    industry: "healthcare",
    component: HealthcareHero2,
    label: "Healthcare — Split Booking",
    tags: ["split", "booking-form", "professional"],
    layout: "split-booking"
  },
  {
    id: "healthcare-hero-3",
    industry: "healthcare",
    component: HealthcareHero3,
    label: "Healthcare — Calm Minimal",
    tags: ["calm", "minimal", "stats"],
    layout: "calm-minimal"
  }
];
