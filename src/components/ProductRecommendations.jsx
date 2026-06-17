import React from 'react';

/**
 * ProductRecommendations — list of recommended products with prices.
 * Used inside OutfitCard to display individual product items.
 * @param {{
 *   items: Array<{
 *     id?: number,
 *     name?: string,
 *     brand?: string,
 *     cat?: string,
 *     price?: number,
 *     img?: string
 *   }>
 * }} props
 */
function ProductRecommendations({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="outfit-items">
      {items.map((item, i) => (
        <div className="outfit-item" key={item.id || i}>
          <div className="outfit-item-icon">{item.img || '👗'}</div>
          <div className="outfit-item-info">
            <div className="name">{item.name}</div>
            <div className="brand-price">{item.brand} · {item.cat}</div>
          </div>
          <div className="outfit-item-price">€{item.price?.toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
}

export default React.memo(ProductRecommendations);
