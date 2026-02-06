/**
 * Login Page - Component Showcase
 * Displays custom ak-* components as they are built
 */

import { useState } from 'react';
import { AkButton } from '@components/ak-button';
import { AkTypography } from '@components/ak-typography';
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

        {/* AkTypography Component Showcase */}
        <section className="component-section">
          <h2 className="section-title">AkTypography Component</h2>

          {/* All Variants */}
          <div className="typography-group">
            <h3 className="group-title">All Variants</h3>
            <AkTypography variant="h1" gutterBottom>
              This is heading 1
            </AkTypography>
            <AkTypography variant="h2" gutterBottom>
              This is heading 2
            </AkTypography>
            <AkTypography variant="h3" gutterBottom>
              This is heading 3
            </AkTypography>
            <AkTypography variant="h4" gutterBottom>
              This is heading 4
            </AkTypography>
            <AkTypography variant="h5" gutterBottom>
              This is heading 5
            </AkTypography>
            <AkTypography variant="h6" gutterBottom>
              This is heading 6
            </AkTypography>

            <AkTypography variant="subtitle1" gutterBottom>
              This is subtitle 1
            </AkTypography>
            <AkTypography variant="subtitle2" gutterBottom>
              This is subtitle 2
            </AkTypography>

            <AkTypography variant="body1" gutterBottom>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s.
            </AkTypography>
            <AkTypography variant="body2" gutterBottom>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s.
            </AkTypography>
            <AkTypography variant="body3" gutterBottom>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s.
            </AkTypography>
          </div>

          {/* Colors */}
          <div className="typography-group">
            <h3 className="group-title">Colors</h3>
            <div className="typography-row">
              <AkTypography color="textPrimary" gutterBottom>
                Text Primary
              </AkTypography>
              <AkTypography color="textSecondary" gutterBottom>
                Text Secondary
              </AkTypography>
              <AkTypography color="primary" gutterBottom>
                Primary Color
              </AkTypography>
              <AkTypography color="secondary" gutterBottom>
                Secondary Color
              </AkTypography>
              <AkTypography color="success" gutterBottom>
                Success Color
              </AkTypography>
              <AkTypography color="error" gutterBottom>
                Error Color
              </AkTypography>
              <AkTypography color="warn" gutterBottom>
                Warning Color
              </AkTypography>
              <AkTypography color="info" gutterBottom>
                Info Color
              </AkTypography>
            </div>
          </div>

          {/* Font Weights */}
          <div className="typography-group">
            <h3 className="group-title">Font Weights</h3>
            <div className="typography-row">
              <AkTypography fontWeight="light" gutterBottom>
                Light Weight
              </AkTypography>
              <AkTypography fontWeight="regular" gutterBottom>
                Regular Weight
              </AkTypography>
              <AkTypography fontWeight="medium" gutterBottom>
                Medium Weight
              </AkTypography>
              <AkTypography fontWeight="bold" gutterBottom>
                Bold Weight
              </AkTypography>
            </div>
          </div>

          {/* Truncated Text */}
          <div className="typography-group">
            <h3 className="group-title">Truncated Text (noWrap)</h3>
            <AkTypography color="textSecondary" gutterBottom>
              Big line
            </AkTypography>
            <AkTypography variant="body1" noWrap>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s, when an unknown printer took a galley of
              type and scrambled it to make a type specimen book.
            </AkTypography>
          </div>

          {/* Text Alignment */}
          <div className="typography-group">
            <h3 className="group-title">Text Alignment</h3>
            <AkTypography align="left" gutterBottom>
              Left Aligned Text
            </AkTypography>
            <AkTypography align="center" gutterBottom>
              Center Aligned Text
            </AkTypography>
            <AkTypography align="right" gutterBottom>
              Right Aligned Text
            </AkTypography>
          </div>

          {/* Underline */}
          <div className="typography-group">
            <h3 className="group-title">Underline Styles</h3>
            <div className="typography-row">
              <AkTypography underline="none" gutterBottom>
                No Underline
              </AkTypography>
              <AkTypography underline="always" gutterBottom>
                Always Underlined
              </AkTypography>
              <AkTypography underline="hover" gutterBottom>
                Underline on Hover
              </AkTypography>
            </div>
          </div>
        </section>

        <footer className="login-footer">
          <p>Component Status: ✓ AkButton | ✓ AkTypography</p>
          <p>Next: More components will be added one by one for review</p>
        </footer>
      </div>
    </div>
  );
}
