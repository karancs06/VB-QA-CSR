import React from "react";
import { Link } from "react-router-dom";
import { CardProps } from "../typescript/card";

export default function CardSection({ cards, dataCslp }: CardProps) {
  const cardCslps = dataCslp ?? {};
  return (
    <div
      className="demo-section"
      {...cardCslps["cards"]}
      data-testid="card-section"
    >
      {cards?.map((card, index) => (
        <div
          className="cards"
          key={`demo-section-cards-${index}`}
          {...cardCslps[`cards__${index}`]}
          data-testid={`card-${index}`}
        >
          {card.title_h3 && (
            <h3
              {...(card?.$?.title_h3 ?? {})}
              data-testid={`card-title-${index}`}
            >
              {card.title_h3}
            </h3>
          )}
          {card.description && (
            <p
              {...(card?.$?.description ?? {})}
              data-testid={`card-description-${index}`}
            >
              {card.description}
            </p>
          )}
          <div className="card-cta" data-testid={`card-cta-${index}`}>
            {card.call_to_action.title && card.call_to_action.href && (
              <Link
                to={card.call_to_action.href}
                className="btn primary-btn"
                {...(card?.$?.call_to_action ?? {})}
                data-testid={`card-cta-link-${index}`}
              >
                {card.call_to_action.title}
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
