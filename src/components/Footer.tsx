import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[var(--navy)] text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded bg-[var(--navy-mid)] flex items-center justify-center">
                <span className="text-[var(--red-brand)] font-black text-xs">V</span>
              </div>
              <span className="text-lg font-bold">
                <span className="text-[#6B8E23]">vin</span>
                <span className="text-white">FMEA</span>
                <sup className="text-xs text-gray-500">{"\u2122"}</sup>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Professional FMEA & Control Plan Suite.
              AIAG-VDA compliant with ISO 26262 functional safety.
            </p>
            <p className="text-xs mt-4 text-gray-500">
              &copy; {new Date().getFullYear()} VinReliability. All rights reserved.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/#standards" className="hover:text-white transition-colors">Standards</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Free Trial</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="text-gray-500">Documentation (Coming Soon)</span></li>
              <li><span className="text-gray-500">API Reference (Coming Soon)</span></li>
              <li><Link href="https://vinreliability.net" target="_blank" className="hover:text-white transition-colors">VinReliability Suite</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#contact" className="hover:text-white transition-colors">Request a Demo</Link></li>
              <li><a href="mailto:sales@vinfmea.com" className="hover:text-white transition-colors">sales@vinfmea.com</a></li>
              <li><a href="mailto:support@vinfmea.com" className="hover:text-white transition-colors">support@vinfmea.com</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
