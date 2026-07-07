/**
 * @typedef {import('../types/index.js').Product} Product
 */

/**
 * Stub — the actual display image is computed at render time via productImg().
 */
const IMG = () => undefined;

/**
 * Clean SVG silhouette icons for each product category.
 * Each icon is a simple path rendered on a dark rounded square.
 * SVG data URIs render reliably in <img> tags (unlike emoji in <text>).
 */
const CATEGORY_ICON = {
  'Tops': '<path d="M30 24 L18 42 L34 46 L34 78 L66 78 L66 46 L82 42 L70 24 L54 32 L50 26 L46 32 Z" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>',
  'Bottoms': '<path d="M26 22 L20 78 L36 78 L40 52 L50 52 L50 78 L64 78 L68 52 L80 78 L74 22 Z" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>',
  'Dresses': '<path d="M34 22 L18 58 L28 80 L50 68 L72 80 L82 58 L66 22 Z" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>',
  'Shoes': '<path d="M16 62 Q20 54 30 54 L62 54 Q74 54 80 62 L90 64 Q94 66 94 74 L94 80 L12 80 Z" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M30 54 L30 44 Q34 40 42 40 L56 40 Q66 40 72 48 L80 62" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>',
  'Bags': '<path d="M30 36 L36 20 L64 20 L70 36 L86 42 L86 78 L14 78 L14 42 Z" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M40 36 L60 36" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>',
  'Outerwear': '<path d="M28 24 L16 44 L34 48 L38 62 L50 56 L62 62 L66 48 L84 44 L72 24 L56 30 L50 22 L44 30 Z" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>',
  'Accessories': '<circle cx="50" cy="50" r="26" fill="none" stroke="#fff" stroke-width="4.5"/><circle cx="50" cy="50" r="12" fill="none" stroke="#fff" stroke-width="3"/><circle cx="50" cy="50" r="4" fill="#fff"/>',
  'Sport': '<circle cx="50" cy="22" r="9" fill="none" stroke="#fff" stroke-width="4"/><path d="M50 30 L40 48 L44 76 L52 76 L56 62 L58 72 L68 72 L72 62 L62 56 L58 46 L58 30" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>',
  'Loungewear': '<path d="M28 26 L16 52 L22 76 L38 76 L44 56 L56 56 L62 76 L78 76 L84 52 L72 26 L56 34 L50 28 L44 34 Z" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>',
};

/**
 * Generate an SVG data URI with the category icon.
 * Example output: data:image/svg+xml,... (a t-shirt icon for Tops)
 */
function iconSVG(category) {
  const icon = CATEGORY_ICON[category] || CATEGORY_ICON['Tops'];
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="18" fill="#1C1C1C"/>${icon}</svg>`
  )}`;
}

/**
 * Get the display image for a product — called at render time so it works
 * reliably regardless of bundling or caching.
 */
export function productImg(p) {
  return iconSVG(p.cat);
}

/** @type {import('../types/index.js').Product[]} */
export const PRODUCTS = [
  // ───── Zara ─────
  { id: 1,  brand: "Zara",      name: "Fluid Linen Blazer",         cat: "Outerwear",  color: "Ecru",       price: 89.95,  trend: 92, style: ["smart casual","office","date"],                      fit: "relaxed",  img: IMG("blazer,ecru",1) },
  { id: 2,  brand: "Zara",      name: "High-Waist Wide Leg Trousers",cat: "Bottoms",    color: "Black",      price: 49.95,  trend: 88, style: ["minimal","office","evening"],                       fit: "wide",     img: IMG("trousers,black",2) },
  { id: 3,  brand: "Zara",      name: "Asymmetric Draped Dress",     cat: "Dresses",    color: "Ivory",      price: 69.95,  trend: 95, style: ["evening","wedding","date"],                           fit: "draped",   img: IMG("dress,ivory",3) },
  { id: 4,  brand: "Zara",      name: "Structured Leather Tote",     cat: "Bags",       color: "Tan",        price: 79.95,  trend: 85, style: ["office","minimal","everyday"],                         fit: "n/a",      img: IMG("tote-bag,leather",4) },
  { id: 5,  brand: "Zara",      name: "Satin Slip Midi Skirt",      cat: "Bottoms",    color: "Champagne",  price: 45.95,  trend: 90, style: ["evening","date","wedding"],                             fit: "slim",     img: IMG("skirt,satin",5) },
  { id: 6,  brand: "Zara",      name: "Oversized Striped Shirt",    cat: "Tops",       color: "White/Navy", price: 35.95,  trend: 78, style: ["casual","vacation","weekend"],                           fit: "oversized",img: IMG("shirt,striped",6) },
  { id: 7,  brand: "Zara",      name: "Block Heel Mule",            cat: "Shoes",      color: "Beige",      price: 59.95,  trend: 82, style: ["office","date","smart casual"],                          fit: "n/a",      img: IMG("heels,mules",7) },
  { id: 8,  brand: "Zara",      name: "Ribbed Mock-Neck Top",       cat: "Tops",       color: "Chocolate",  price: 25.95,  trend: 80, style: ["casual","minimal","layering"],                            fit: "fitted",   img: IMG("turtleneck,knit",8) },

  // ───── Pull&Bear ─────
  { id: 9,  brand: "Pull&Bear", name: "Baggy Carpenter Jeans",      cat: "Bottoms",    color: "Washed Blue", price: 39.99,  trend: 94, style: ["streetwear","casual","concert"],                          fit: "baggy",    img: IMG("jeans,baggy",9) },
  { id: 10, brand: "Pull&Bear", name: "Graphic Tee — Vintage Motor",cat: "Tops",       color: "Faded Black", price: 17.99,  trend: 88, style: ["streetwear","casual","festival"],                          fit: "relaxed",  img: IMG("t-shirt,graphic",10) },
  { id: 11, brand: "Pull&Bear", name: "Varsity Bomber Jacket",      cat: "Outerwear",  color: "Navy/White", price: 59.99, trend: 91, style: ["streetwear","casual","festival"],                          fit: "regular",  img: IMG("bomber-jacket,varsity",11) },
  { id: 12, brand: "Pull&Bear", name: "Chunky Sole Sneaker",        cat: "Shoes",      color: "White",      price: 49.99,  trend: 89, style: ["streetwear","casual","everyday"],                           fit: "n/a",      img: IMG("sneakers,chunky",12) },
  { id: 13, brand: "Pull&Bear", name: "Linen Shorts",               cat: "Bottoms",    color: "Sand",       price: 25.99,  trend: 85, style: ["casual","beach","vacation"],                              fit: "relaxed",  img: IMG("shorts,linen",13) },
  { id: 14, brand: "Pull&Bear", name: "Ribbed Tank Top",            cat: "Tops",       color: "White",      price: 12.99,  trend: 76, style: ["casual","beach","layering"],                               fit: "slim",     img: IMG("tank-top,ribbed",14) },
  { id: 15, brand: "Pull&Bear", name: "Baseball Cap",               cat: "Accessories",color: "Black",      price: 14.99,  trend: 83, style: ["streetwear","casual","sport"],                              fit: "n/a",      img: IMG("cap,baseball",15) },
  { id: 16, brand: "Pull&Bear", name: "Cord Overshirt",             cat: "Tops",       color: "Rust",       price: 35.99,  trend: 87, style: ["casual","weekend","fall"],                                  fit: "regular",  img: IMG("shirt,corduroy",16) },

  // ───── Bershka ─────
  { id: 17, brand: "Bershka",   name: "Y2K Flare Jeans",            cat: "Bottoms",    color: "Light Wash", price: 32.99,  trend: 96, style: ["y2k","concert","festival"],                               fit: "flare",    img: IMG("jeans,flare",17) },
  { id: 18, brand: "Bershka",   name: "Cut-Out Bodysuit",           cat: "Tops",       color: "Black",      price: 22.99,  trend: 90, style: ["evening","festival","date"],                               fit: "fitted",   img: IMG("bodysuit,black",18) },
  { id: 19, brand: "Bershka",   name: "Faux Leather Jacket",        cat: "Outerwear",  color: "Black",      price: 55.99,  trend: 85, style: ["streetwear","concert","evening"],                            fit: "slim",     img: IMG("leather-jacket,black",19) },
  { id: 20, brand: "Bershka",   name: "Platform Boots",             cat: "Shoes",      color: "Black",      price: 59.99,  trend: 88, style: ["y2k","concert","streetwear"],                               fit: "n/a",      img: IMG("boots,platform",20) },
  { id: 21, brand: "Bershka",   name: "Crochet Mini Dress",         cat: "Dresses",    color: "Cream",      price: 39.99,  trend: 91, style: ["festival","vacation","beach"],                              fit: "relaxed",  img: IMG("dress,crochet",21) },
  { id: 22, brand: "Bershka",   name: "Chain Shoulder Bag",         cat: "Bags",       color: "Silver",     price: 29.99,  trend: 84, style: ["evening","festival","date"],                               fit: "n/a",      img: IMG("bag,chain",22) },

  // ───── Stradivarius ─────
  { id: 23, brand: "Stradivarius",name: "Balloon Sleeve Blouse",    cat: "Tops",       color: "White",      price: 27.99,  trend: 82, style: ["romantic","date","office"],                                fit: "balloon",  img: IMG("blouse,balloon-sleeve",23) },
  { id: 24, brand: "Stradivarius",name: "Mom Jeans",                cat: "Bottoms",    color: "Medium Wash",price: 35.99,  trend: 79, style: ["casual","everyday","weekend"],                              fit: "mom",      img: IMG("jeans,mom",24) },
  { id: 25, brand: "Stradivarius",name: "Strappy Heeled Sandal",    cat: "Shoes",      color: "Gold",       price: 42.99,  trend: 86, style: ["evening","wedding","date"],                                fit: "n/a",      img: IMG("sandals,heels",25) },
  { id: 26, brand: "Stradivarius",name: "Floral Maxi Dress",        cat: "Dresses",    color: "Multicolor", price: 49.99,  trend: 89, style: ["vacation","wedding guest","festival"],                        fit: "flowy",    img: IMG("maxi-dress,floral",26) },
  { id: 27, brand: "Stradivarius",name: "Knit Cardigan",            cat: "Tops",       color: "Camel",      price: 32.99,  trend: 84, style: ["casual","minimal","layering"],                               fit: "relaxed",  img: IMG("cardigan,knit",27) },
  { id: 28, brand: "Stradivarius",name: "Hoop Earrings Set",        cat: "Accessories",color: "Gold",       price: 12.99,  trend: 77, style: ["everyday","evening","casual"],                                fit: "n/a",      img: IMG("earrings,hoop",28) },

  // ───── Massimo Dutti ─────
  { id: 29, brand: "Massimo Dutti",name: "Cashmere V-Neck Sweater", cat: "Tops",       color: "Navy",       price: 99.00,  trend: 81, style: ["office","smart casual","minimal"],                            fit: "regular",  img: IMG("sweater,cashmere",29) },
  { id: 30, brand: "Massimo Dutti",name: "Tailored Wool Trousers",  cat: "Bottoms",    color: "Charcoal",   price: 119.00, trend: 80, style: ["office","formal","smart casual"],                              fit: "tailored", img: IMG("trousers,wool",30) },
  { id: 31, brand: "Massimo Dutti",name: "Oxford Leather Brogues",  cat: "Shoes",      color: "Cognac",     price: 149.00, trend: 78, style: ["office","formal","smart casual"],                              fit: "n/a",      img: IMG("brogues,oxford",31) },
  { id: 32, brand: "Massimo Dutti",name: "Silk Printed Blouse",     cat: "Tops",       color: "Blue Print", price: 89.00,  trend: 83, style: ["office","evening","smart casual"],                             fit: "relaxed",  img: IMG("blouse,silk",32) },

  // ───── Oysho ─────
  { id: 33, brand: "Oysho",     name: "Modal Lounge Set",           cat: "Loungewear", color: "Dusty Pink", price: 55.00,  trend: 87, style: ["lounge","wellness","casual"],                                fit: "relaxed",  img: IMG("loungewear,modal",33) },
  { id: 34, brand: "Oysho",     name: "Sports High-Impact Bra",     cat: "Sport",      color: "Black",      price: 35.00,  trend: 85, style: ["sport","gym","wellness"],                                    fit: "fitted",   img: IMG("sports-bra,black",34) },
  { id: 35, brand: "Oysho",     name: "Linen Beach Dress",          cat: "Dresses",    color: "White",      price: 45.00,  trend: 90, style: ["beach","vacation","casual"],                                 fit: "flowy",    img: IMG("beach-dress,linen",35) },
  { id: 36, brand: "Oysho",     name: "Seamless Leggings",          cat: "Sport",      color: "Slate",      price: 39.00,  trend: 86, style: ["sport","gym","casual"],                                         fit: "fitted",   img: IMG("leggings,seamless",36) },
];
