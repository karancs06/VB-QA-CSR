import React from "react";

export default function Error() {
  return (
    <div className="error-page" data-testid="error-page">
      <div className="error-message" data-testid="error-message">
        <h1 data-testid="error-title">404: Not Found</h1>
        <p data-testid="error-description">
          You just hit a route that doesn&#39;t exist... the sadness.
        </p>
      </div>
    </div>
  );
}
