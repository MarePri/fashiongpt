/**
 * @typedef {Object} Product
 * @property {number} id
 * @property {string} brand
 * @property {string} name
 * @property {string} cat - Category (Tops, Bottoms, Dresses, Shoes, Outerwear, Bags, Accessories, Loungewear, Sport)
 * @property {string} color
 * @property {number} price
 * @property {number} trend
 * @property {string[]} style - Style tags
 * @property {string} fit
 * @property {string} img - Emoji icon
 */

/**
 * @typedef {Object} Occasion
 * @property {string} id
 * @property {string} label
 * @property {string} icon
 * @property {string} vibe
 */

/**
 * @typedef {Object} Trend
 * @property {string} name
 * @property {"up"|"down"} dir
 * @property {number} pct
 * @property {string} desc
 * @property {string[]} brands
 */

/**
 * @typedef {Object} Archetype
 * @property {string} id
 * @property {string} name
 * @property {string} icon
 * @property {string[]} colors
 * @property {string[]} brands
 * @property {string} desc
 */

/**
 * @typedef {Object} OutfitItem
 * @property {number} [id]
 * @property {string} brand
 * @property {string} name
 * @property {string} [cat]
 * @property {string} [color]
 * @property {number} [price]
 * @property {string} [img]
 */

/**
 * @typedef {Object} Outfit
 * @property {OutfitItem[]} [items]
 * @property {string} [name]
 * @property {string} [why]
 * @property {Object} [scores]
 * @property {number} [scores.Style]
 * @property {number} [scores.Trend]
 * @property {number} [scores.Versatility]
 */

/**
 * @typedef {Object} ChatMessage
 * @property {"user"|"ai"} role
 * @property {string} content
 * @property {Outfit} [outfit]
 */

/**
 * @typedef {Object} OccasionResult
 * @property {Outfit} outfit
 * @property {Object} meta
 * @property {string} [meta.name]
 * @property {string} [meta.why]
 * @property {string} [meta.style_tip]
 * @property {string} [meta.trend_note]
 */

/**
 * @typedef {Object} DnaResult
 * @property {Archetype} archetype
 * @property {Object} meta
 * @property {string} [meta.headline]
 * @property {string} [meta.missing]
 * @property {string} [meta.trend_match]
 * @property {number} [meta.confidence]
 */

/**
 * @typedef {Object} CapsuleResult
 * @property {Product[]} picks
 * @property {number} total
 * @property {number} combos
 */

export {};
