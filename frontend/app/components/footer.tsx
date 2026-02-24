import Link from "next/link";

const footerLinks = {
  Product: ["Search rides", "Offer a ride", "Pricing", "Safety"],
  Company: ["About", "Blog", "Careers", "Press"],
  Support: ["Help center", "Contact", "Terms", "Privacy"],
};

export default function Footer() {
  return (
    <footer className="px-4 py-12 border-t border-border-subtle safe-bottom">
      <div className="max-w-[1000px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-10 mb-12">
          <div className="max-w-[260px]">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-accent-mint flex items-center justify-center glow-mint">
                <span className="text-[#040404] text-[15px] font-black tracking-tighter leading-none">
                  d
                </span>
              </div>
              <span className="text-text-primary text-[16px] font-bold tracking-[-0.03em]">
                drift
              </span>
            </Link>
            <p className="text-[13px] text-text-tertiary leading-relaxed">
              Ridesharing built for college students. Split fares, share rides,
              save money.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8 md:gap-16">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-[11px] text-text-tertiary uppercase tracking-widest font-bold mb-4">
                  {category}
                </h4>
                <ul className="flex flex-col gap-3">
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
          <div className="flex items-center gap-5">
            {["Twitter", "Instagram", "LinkedIn"].map((social) => (
              <a
                key={social}
                href="#"
                className="text-[12px] text-text-tertiary hover:text-text-secondary transition-colors font-medium"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
