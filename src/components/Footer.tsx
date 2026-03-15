import { Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  services: [
    { label: "SEO", href: "#" },
    { label: "Google Ads", href: "#" },
    { label: "Social Media", href: "#" },
    { label: "Web Design", href: "#" },
    { label: "Content Marketing", href: "#" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
  ],
  quickLinks: [
    { label: "Free Consultation", href: "#" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="section-container py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <img src="/logo.png" alt="ZORX Logo" className="h-16 w-auto brightness-0 invert" />
            </div>
            <p className="text-background/70 mb-6 max-w-sm">
              Dubai's leading digital marketing agency. We help ambitious brands scale with data-driven strategies that convert.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-background/70">
                <MapPin className="w-5 h-5 text-primary-light" />
                <span>Dubai Silicon Oasis, Dubai, UAE</span>
              </div>
              <div className="flex items-center gap-3 text-background/70">
                <Mail className="w-5 h-5 text-primary-light" />
                <a href="mailto:info@zorxmedia.com" className="hover:text-primary-light transition-colors">
                  info@zorxmedia.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-background/70">
                <Phone className="w-5 h-5 text-primary-light" />
                <a href="https://wa.me/971542763828" className="hover:text-primary-light transition-colors">
                  +971 54 276 3828
                </a>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold text-lg mb-4">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-background/70 hover:text-primary-light transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-lg mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-background/70 hover:text-primary-light transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-background/70 hover:text-primary-light transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/50 text-sm">
            © {new Date().getFullYear()} Zorx Media. All Rights Reserved.
          </p>

          {/* Social links */}
          <div className="flex gap-4">
            {['LinkedIn', 'Instagram', 'Twitter'].map((social) => (
              <a
                key={social}
                href="#"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary-light hover:text-foreground transition-colors"
              >
                <span className="sr-only">{social}</span>
                <div className="w-5 h-5 bg-current rounded-sm opacity-70" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
