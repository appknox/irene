/**
 * Login Page - Component Showcase
 * Displays custom ak-* components as they are built
 */

import { useState } from 'react';
import { AkButton } from '@components/ak-button';
import './LoginPage.scss';

export function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">Appknox Component Showcase</h1>
        <p className="login-subtitle">
          Custom ak-* components built to match Ember implementation exactly
        </p>

        {/* AkButton Component Showcase */}
        <section className="component-section">
          <h2 className="section-title">AkButtons Component</h2>

          {/* Filled Variants */}
          <div className="button-group">
            <h3 className="group-title">Filled Buttons</h3>
            <div className="buttons-row">
              <AkButton variant="filled" color="primary">
                Primary
              </AkButton>
              <AkButton variant="filled" color="secondary">
                Secondary
              </AkButton>
              <AkButton variant="filled" color="success">
                Success
              </AkButton>
              <AkButton variant="filled" color="error">
                Error
              </AkButton>
              <AkButton variant="filled" color="warn">
                Warning
              </AkButton>
              <AkButton variant="filled" color="info">
                Info
              </AkButton>
            </div>
          </div>

          {/* Outlined Variants */}
          <div className="button-group">
            <h3 className="group-title">Outlined Buttons</h3>
            <div className="buttons-row">
              <AkButton variant="outlined" color="primary">
                Primary
              </AkButton>
              <AkButton variant="outlined" color="secondary">
                Secondary
              </AkButton>
              <AkButton variant="outlined" color="success">
                Success
              </AkButton>
              <AkButton variant="outlined" color="error">
                Error
              </AkButton>
              <AkButton variant="outlined" color="neutral">
                Neutral
              </AkButton>
            </div>
          </div>

          {/* Text Variants */}
          <div className="button-group">
            <h3 className="group-title">Text Buttons</h3>
            <div className="buttons-row">
              <AkButton variant="text" color="primary">
                Primary Text
              </AkButton>
              <AkButton variant="text" color="secondary">
                Secondary Text
              </AkButton>
              <AkButton variant="text" color="error">
                Error Text
              </AkButton>
              <AkButton variant="text" color="primary" underline="none">
                No Underline
              </AkButton>
            </div>
          </div>

          {/* Button States */}
          <div className="button-group">
            <h3 className="group-title">Button States</h3>
            <div className="buttons-row">
              <AkButton variant="filled" color="primary">
                Normal
              </AkButton>
              <AkButton variant="filled" color="primary" disabled>
                Disabled
              </AkButton>
              <AkButton
                variant="filled"
                color="primary"
                loading={loading}
                onClick={handleClick}
              >
                {loading ? 'Loading...' : 'Click to Load'}
              </AkButton>
            </div>
          </div>

          {/* Buttons with Icons */}
          <div className="button-group">
            <h3 className="group-title">Buttons with Icons (placeholders)</h3>
            <div className="buttons-row">
              <AkButton
                variant="filled"
                color="primary"
                leftIcon={<span>←</span>}
              >
                Back
              </AkButton>
              <AkButton
                variant="filled"
                color="primary"
                rightIcon={<span>→</span>}
              >
                Next
              </AkButton>
              <AkButton
                variant="outlined"
                color="primary"
                leftIcon={<span>✓</span>}
                rightIcon={<span>↗</span>}
              >
                With Both Icons
              </AkButton>
            </div>
          </div>

          {/* Different Tags */}
          <div className="button-group">
            <h3 className="group-title">Different HTML Tags</h3>
            <div className="buttons-row">
              <AkButton tag="button" variant="filled" color="primary">
                Button Tag
              </AkButton>
              <AkButton tag="a" variant="outlined" color="primary" href="#">
                Anchor Tag
              </AkButton>
              <AkButton tag="div" variant="text" color="primary">
                Div Tag
              </AkButton>
            </div>
          </div>
        </section>

        <footer className="login-footer">
          <p>Component Status: ✓ AkButton implemented</p>
          <p>Next: More components will be added one by one for review</p>
        </footer>
      </div>
    </div>
  );
}
