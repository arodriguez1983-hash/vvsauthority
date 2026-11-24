/* VVS Authority product catalog.
 * The marquise diamond has a live PayPal checkout and an official price.
 * Items with contactToBuy: true have an official listed price but no PayPal link yet — buyers should contact us to purchase.
 * Other prices marked EXAMPLE PRICE are display-only placeholders, not checkout amounts.
 * Items with messageForPrice: true have no listed price — buyers should contact us.
 */
const PRODUCTS = [
  {
    id: "marquise-131",
    name: "1.31 CT Marquise Lab Diamond",
    category: "diamonds",
    price: 1895, // Official PayPal checkout amount (USD 1895.00)
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85",
    description: "1.31 Carat Lab Diamond, Marquise Cut, IGI Certified",
    paypalLink: "https://www.paypal.com/ncp/payment/DZG7BAA653M3W",
    placeholder: false,
    featured: true
  },
  {
    id: "moissanite-round-1ct-gra",
    name: "1 CT Round Moissanite, GRA Certified",
    category: "moissanite",
    price: 25, // Official listed price — contact to buy (no PayPal link yet)
    image: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=900&q=85",
    description: "1 carat round brilliant moissanite, GRA certified.",
    paypalLink: "#",
    placeholder: true,
    contactToBuy: true,
    featured: true
  },
  {
    id: "oval-150",
    name: "1.50 CT Oval Lab Diamond",
    category: "diamonds",
    price: 1650, // EXAMPLE PRICE — not a live checkout amount
    image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=900&q=85",
    description: "Elongated oval lab diamond with bright face-up presence, suited for a custom ring or pendant.",
    paypalLink: "#",
    placeholder: true,
    featured: false
  },
  {
    id: "moissanite-round-200",
    name: "2.00 CT Round Moissanite",
    category: "moissanite",
    price: 189, // EXAMPLE PRICE — not a live checkout amount
    image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=85",
    description: "High-fire round moissanite loose stone with sharp brilliance for custom jewelry builds.",
    paypalLink: "#",
    placeholder: true,
    featured: false
  },
  {
    id: "moissanite-studs",
    name: "Moissanite Halo Stud Earrings",
    category: "moissanite",
    price: 149, // EXAMPLE PRICE — not a live checkout amount
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=85",
    description: "Brilliant moissanite studs with a halo setting — everyday sparkle for daily wear or gifting.",
    paypalLink: "#",
    placeholder: true,
    featured: false
  },
  {
    id: "moissanite-pendant",
    name: "Moissanite Solitaire Pendant",
    category: "moissanite",
    price: 129, // EXAMPLE PRICE — not a live checkout amount
    image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=900&q=85",
    description: "Clean solitaire pendant with lively fire, ready to wear on a chain or style as a charm.",
    paypalLink: "#",
    placeholder: true,
    featured: false
  },
  {
    id: "blue-sapphire-180",
    name: "1.80 CT Blue Sapphire",
    category: "gemstones",
    price: 560, // EXAMPLE PRICE — not a live checkout amount
    image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=85",
    description: "Rich blue sapphire loose stone. Ask about available sizes, cuts, and current inventory.",
    paypalLink: "#",
    placeholder: true,
    featured: false
  },
  {
    id: "tennis-bracelet",
    name: "Moissanite Tennis Bracelet",
    category: "jewelry",
    price: 395, // EXAMPLE PRICE — not a live checkout amount
    image: "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?auto=format&fit=crop&w=900&q=85",
    description: "Continuous line of moissanite stones in a classic tennis bracelet silhouette.",
    paypalLink: "#",
    placeholder: true,
    featured: false
  },
  {
    id: "halo-ring",
    name: "Halo Engagement-Style Ring",
    category: "jewelry",
    price: 275, // EXAMPLE PRICE — not a live checkout amount
    image: "https://images.unsplash.com/photo-1608042314453-ae338d80c427?auto=format&fit=crop&w=900&q=85",
    description: "Statement halo ring with a brilliant center and a surrounding frame of sparkle.",
    paypalLink: "#",
    placeholder: true,
    featured: false
  },
  {
    id: "gold-chain",
    name: "14K Gold Figaro Chain",
    category: "jewelry",
    price: 320, // EXAMPLE PRICE — not a live checkout amount
    image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=900&q=85",
    description: "Classic figaro-link chain in 14K gold — a versatile everyday or layering piece.",
    paypalLink: "#",
    placeholder: true,
    featured: false
  }
];
