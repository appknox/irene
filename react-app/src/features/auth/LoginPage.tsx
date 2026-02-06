/**
 * Login Page - Component Showcase
 * Displays custom ak-* components as they are built
 */

import { useState } from 'react';
import { AkButton } from '@components/ak-button';
import { AkTypography } from '@components/ak-typography';
import { AkLoader, AkLoaderLinear } from '@components/ak-loader';
import { AkStack } from '@components/ak-stack';
import './LoginPage.scss';

export function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="login-page">
      <AkStack
        tag="div"
        direction="column"
        spacing={4}
        className="login-container"
      >
        <h1 className="login-title">Appknox Component Showcase</h1>
        <p className="login-subtitle">
          Custom ak-* components built to match Ember implementation exactly
        </p>

        {/* AkButton Component Showcase */}
        <section className="component-section">
          <h2 className="section-title">AkButtons Component</h2>

          {/* Filled Variants */}
          <AkStack direction="column" spacing={3} className="button-group">
            <h3 className="group-title">Filled Buttons</h3>
            <AkStack spacing={2} flexWrap="wrap" className="buttons-row">
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
            </AkStack>
          </AkStack>

          {/* Outlined Variants */}
          <AkStack direction="column" spacing={3} className="button-group">
            <h3 className="group-title">Outlined Buttons</h3>
            <AkStack spacing={2} flexWrap="wrap" className="buttons-row">
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
            </AkStack>
          </AkStack>

          {/* Text Variants */}
          <AkStack direction="column" spacing={3} className="button-group">
            <h3 className="group-title">Text Buttons</h3>
            <AkStack spacing={2} flexWrap="wrap" className="buttons-row">
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
            </AkStack>
          </AkStack>

          {/* Button States */}
          <AkStack direction="column" spacing={3} className="button-group">
            <h3 className="group-title">Button States</h3>
            <AkStack spacing={2} flexWrap="wrap" className="buttons-row">
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
            </AkStack>
          </AkStack>

          {/* Buttons with Icons */}
          <AkStack direction="column" spacing={3} className="button-group">
            <h3 className="group-title">Buttons with Icons (placeholders)</h3>
            <AkStack spacing={2} flexWrap="wrap" className="buttons-row">
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
            </AkStack>
          </AkStack>

          {/* Different Tags */}
          <AkStack direction="column" spacing={3} className="button-group">
            <h3 className="group-title">Different HTML Tags</h3>
            <AkStack spacing={2} flexWrap="wrap" className="buttons-row">
              <AkButton tag="button" variant="filled" color="primary">
                Button Tag
              </AkButton>
              <AkButton tag="a" variant="outlined" color="primary" href="#">
                Anchor Tag
              </AkButton>
              <AkButton tag="div" variant="text" color="primary">
                Div Tag
              </AkButton>
            </AkStack>
          </AkStack>
        </section>

        {/* AkTypography Component Showcase */}
        <section className="component-section">
          <h2 className="section-title">AkTypography Component</h2>

          {/* All Variants */}
          <AkStack direction="column" spacing={2} className="typography-group">
            <h3 className="group-title">All Variants</h3>
            <AkStack direction="column" spacing={1}>
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
                Lorem Ipsum is simply dummy text of the printing and
                typesetting industry. Lorem Ipsum has been the industry's
                standard dummy text ever since the 1500s.
              </AkTypography>
              <AkTypography variant="body2" gutterBottom>
                Lorem Ipsum is simply dummy text of the printing and
                typesetting industry. Lorem Ipsum has been the industry's
                standard dummy text ever since the 1500s.
              </AkTypography>
              <AkTypography variant="body3" gutterBottom>
                Lorem Ipsum is simply dummy text of the printing and
                typesetting industry. Lorem Ipsum has been the industry's
                standard dummy text ever since the 1500s.
              </AkTypography>
            </AkStack>
          </AkStack>

          {/* Colors */}
          <AkStack direction="column" spacing={2} className="typography-group">
            <h3 className="group-title">Colors</h3>
            <AkStack direction="column" spacing={1}>
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
            </AkStack>
          </AkStack>

          {/* Font Weights */}
          <AkStack direction="column" spacing={2} className="typography-group">
            <h3 className="group-title">Font Weights</h3>
            <AkStack direction="column" spacing={1}>
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
            </AkStack>
          </AkStack>

          {/* Truncated Text */}
          <AkStack direction="column" spacing={2} className="typography-group">
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
          </AkStack>

          {/* Text Alignment */}
          <AkStack direction="column" spacing={2} className="typography-group">
            <h3 className="group-title">Text Alignment</h3>
            <AkStack direction="column" spacing={1}>
              <AkTypography align="left" gutterBottom>
                Left Aligned Text
              </AkTypography>
              <AkTypography align="center" gutterBottom>
                Center Aligned Text
              </AkTypography>
              <AkTypography align="right" gutterBottom>
                Right Aligned Text
              </AkTypography>
            </AkStack>
          </AkStack>

          {/* Underline */}
          <AkStack direction="column" spacing={2} className="typography-group">
            <h3 className="group-title">Underline Styles</h3>
            <AkStack direction="column" spacing={1}>
              <AkTypography underline="none" gutterBottom>
                No Underline
              </AkTypography>
              <AkTypography underline="always" gutterBottom>
                Always Underlined
              </AkTypography>
              <AkTypography underline="hover" gutterBottom>
                Underline on Hover
              </AkTypography>
            </AkStack>
          </AkStack>
        </section>

        {/* AkLoader Component Showcase */}
        <section className="component-section">
          <h2 className="section-title">AkLoader Component</h2>

          {/* Default Indeterminate Loaders */}
          <AkStack direction="column" spacing={2} className="typography-group">
            <h3 className="group-title">Indeterminate Loaders</h3>
            <AkStack spacing={4} flexWrap="wrap" className="loader-row">
              <AkStack
                direction="column"
                spacing={1}
                alignItems="center"
                className="loader-item"
              >
                <AkLoader size={40} color="primary" />
                <AkTypography variant="body3" color="textSecondary">
                  Primary
                </AkTypography>
              </AkStack>
              <AkStack
                direction="column"
                spacing={1}
                alignItems="center"
                className="loader-item"
              >
                <AkLoader size={40} color="secondary" />
                <AkTypography variant="body3" color="textSecondary">
                  Secondary
                </AkTypography>
              </AkStack>
              <AkStack
                direction="column"
                spacing={1}
                alignItems="center"
                className="loader-item"
              >
                <AkLoader size={40} color="success" />
                <AkTypography variant="body3" color="textSecondary">
                  Success
                </AkTypography>
              </AkStack>
              <AkStack
                direction="column"
                spacing={1}
                alignItems="center"
                className="loader-item"
              >
                <AkLoader size={40} color="error" />
                <AkTypography variant="body3" color="textSecondary">
                  Error
                </AkTypography>
              </AkStack>
              <AkStack
                direction="column"
                spacing={1}
                alignItems="center"
                className="loader-item"
              >
                <AkLoader size={40} color="warn" />
                <AkTypography variant="body3" color="textSecondary">
                  Warning
                </AkTypography>
              </AkStack>
              <AkStack
                direction="column"
                spacing={1}
                alignItems="center"
                className="loader-item"
              >
                <AkLoader size={40} color="info" />
                <AkTypography variant="body3" color="textSecondary">
                  Info
                </AkTypography>
              </AkStack>
            </AkStack>
          </AkStack>

          {/* Indeterminate with Label */}
          <AkStack direction="column" spacing={2} className="typography-group">
            <h3 className="group-title">Indeterminate with Label</h3>
            <AkStack spacing={4} flexWrap="wrap" className="loader-row">
              <AkLoader size={100} color="primary" thickness={3}>
                <AkTypography variant="h6">Loading</AkTypography>
              </AkLoader>
            </AkStack>
          </AkStack>

          {/* Determinate Loaders */}
          <AkStack direction="column" spacing={2} className="typography-group">
            <h3 className="group-title">Determinate Loaders</h3>
            <AkStack spacing={4} flexWrap="wrap" className="loader-row">
              <AkStack
                direction="column"
                spacing={1}
                alignItems="center"
                className="loader-item"
              >
                <AkLoader
                  size={100}
                  variant="determinate"
                  progress={25}
                  color="primary"
                  thickness={3}
                />
                <AkTypography variant="body3" color="textSecondary">
                  25%
                </AkTypography>
              </AkStack>
              <AkStack
                direction="column"
                spacing={1}
                alignItems="center"
                className="loader-item"
              >
                <AkLoader
                  size={100}
                  variant="determinate"
                  progress={50}
                  color="success"
                  thickness={3}
                />
                <AkTypography variant="body3" color="textSecondary">
                  50%
                </AkTypography>
              </AkStack>
              <AkStack
                direction="column"
                spacing={1}
                alignItems="center"
                className="loader-item"
              >
                <AkLoader
                  size={100}
                  variant="determinate"
                  progress={75}
                  color="info"
                  thickness={3}
                />
                <AkTypography variant="body3" color="textSecondary">
                  75%
                </AkTypography>
              </AkStack>
              <AkStack
                direction="column"
                spacing={1}
                alignItems="center"
                className="loader-item"
              >
                <AkLoader
                  size={100}
                  variant="determinate"
                  progress={100}
                  color="error"
                  thickness={3}
                />
                <AkTypography variant="body3" color="textSecondary">
                  100%
                </AkTypography>
              </AkStack>
            </AkStack>
          </AkStack>

          {/* Determinate with Label */}
          <AkStack direction="column" spacing={2} className="typography-group">
            <h3 className="group-title">Determinate with Label</h3>
            <AkStack spacing={4} flexWrap="wrap" className="loader-row">
              <AkLoader
                size={100}
                variant="determinate"
                progress={22.5}
                color="primary"
                thickness={3}
              >
                <AkTypography variant="h6">22.5%</AkTypography>
              </AkLoader>
            </AkStack>
          </AkStack>

          {/* Different Sizes */}
          <AkStack direction="column" spacing={2} className="typography-group">
            <h3 className="group-title">Different Sizes</h3>
            <AkStack
              spacing={4}
              flexWrap="wrap"
              alignItems="center"
              className="loader-row"
            >
              <AkLoader size={20} color="primary" />
              <AkLoader size={40} color="primary" />
              <AkLoader size={60} color="primary" />
              <AkLoader size={80} color="primary" />
              <AkLoader size={100} color="primary" />
            </AkStack>
          </AkStack>
        </section>

        {/* AkLoaderLinear Component Showcase */}
        <section className="component-section">
          <h2 className="section-title">AkLoaderLinear Component</h2>

          {/* Determinate Linear with Label */}
          <AkStack direction="column" spacing={2} className="typography-group">
            <h3 className="group-title">Determinate Linear with Label</h3>
            <AkStack direction="column" spacing={2}>
              <AkLoaderLinear
                variant="determinate"
                height={4}
                progress={22.5}
                color="primary"
              >
                <AkTypography variant="h6">22.5%</AkTypography>
              </AkLoaderLinear>
              <AkLoaderLinear
                variant="determinate"
                height={4}
                progress={50}
                color="success"
              >
                <AkTypography variant="h6">50%</AkTypography>
              </AkLoaderLinear>
              <AkLoaderLinear
                variant="determinate"
                height={4}
                progress={75}
                color="info"
              >
                <AkTypography variant="h6">75%</AkTypography>
              </AkLoaderLinear>
            </AkStack>
          </AkStack>

          {/* Indeterminate Linear */}
          <AkStack direction="column" spacing={2} className="typography-group">
            <h3 className="group-title">Indeterminate Linear</h3>
            <AkStack direction="column" spacing={2}>
              <AkLoaderLinear height={4} color="primary" />
              <AkLoaderLinear height={6} color="secondary" />
              <AkLoaderLinear height={8} color="success" />
            </AkStack>
          </AkStack>
        </section>

        <footer className="login-footer">
          <p>
            Component Status: ✓ AkButton | ✓ AkTypography | ✓ AkLoader | ✓
            AkLoaderLinear | ✓ AkStack
          </p>
          <p>Next: More components will be added one by one for review</p>
        </footer>
      </AkStack>
    </div>
  );
}
