const footerLinks = {
  Product: ["Search rides", "Offer a ride", "Pricing", "Safety"],
  Company: ["About", "Blog", "Careers", "Press"],
  Support: ["Help center", "Contact", "Terms", "Privacy"],
};

export default function Footer() {
  return (
    <footer className="px-5 py-12 border-t border-border-subtle">
      <div className="max-w-[1000px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-10 mb-12">
          <div className="max-w-[240px]">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-accent-mint flex items-center justify-center">
                <span className="text-[#040404] text-sm font-bold tracking-tight leading-none">
                  D
                </span>
              </div>
              <span className="text-text-primary text-[15px] font-semibold tracking-[-0.02em]">
                drift
              </span>
            </div>
            <p className="text-[13px] text-text-tertiary leading-relaxed">
              Ridesharing built for college students. Split fares, share rides,
              save money.
            </p>
          </div>

          <div className="flex gap-16">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-[12px] text-text-tertiary uppercase tracking-wide mb-4">
                  {category}
                </h4>
                <ul className="flex flex-col gap-2.5">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-[13px] text-text-secondary hover:text-text-primary transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[12px] text-text-tertiary">
            2026 drift. All rights reserved.
          </span>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-[12px] text-text-tertiary hover:text-text-secondary transition-colors"
            >
              Twitter
            </a>
            <a
              href="#"
              className="text-[12px] text-text-tertiary hover:text-text-secondary transition-colors"
            >
              Instagram
            </a>
            <a
              href="#"
              className="text-[12px] text-text-tertiary hover:text-text-secondary transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
