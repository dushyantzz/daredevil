'use client';

import { usePathname } from 'next/navigation';
import PillNav from '@/components/PillNav';

export default function ExampleNavbarPage() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <PillNav
        logo="/logo.svg"
        logoAlt="Company Logo"
        items={navItems}
        activeHref={pathname}
        baseColor="#000000"
        pillColor="#ffffff"
        hoveredPillTextColor="#ffffff"
        initialLoadAnimation={true}
      />

      <main style={{ paddingTop: '150px', maxWidth: '1200px', margin: '0 auto', padding: '150px 2rem 2rem' }}>
        <div style={{ 
          background: 'white', 
          padding: '3rem', 
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#000' }}>
            Redesigned Pill Navigation
          </h1>
          
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
            Your navbar has been redesigned to match the UI you provided!
          </p>

          <div style={{ 
            background: '#f9f9f9', 
            padding: '2rem', 
            borderRadius: '12px',
            marginBottom: '2rem'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#000' }}>
              ✨ Key Features:
            </h2>
            <ul style={{ fontSize: '1.1rem', color: '#444', lineHeight: '2' }}>
              <li>✅ Connected logo and navigation design</li>
              <li>✅ Clean black border around entire nav</li>
              <li>✅ Transparent pills with hover fill animation</li>
              <li>✅ Active state with filled background</li>
              <li>✅ Logo rotation on hover</li>
              <li>✅ Smooth GSAP animations</li>
              <li>✅ Mobile responsive with hamburger menu</li>
              <li>✅ Fixed positioning at top center</li>
            </ul>
          </div>

          <div style={{ 
            background: '#000', 
            color: '#fff',
            padding: '2rem', 
            borderRadius: '12px',
            marginBottom: '2rem'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
              🎨 Customization:
            </h2>
            <p style={{ fontSize: '1rem', lineHeight: '1.8', opacity: 0.9 }}>
              You can easily customize colors, sizes, and animations by passing props to the PillNav component.
              Check the NAVBAR_IMPLEMENTATION_GUIDE.md for all available options!
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginTop: '2rem'
          }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '2rem',
              borderRadius: '12px',
              color: 'white'
            }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Desktop</h3>
              <p style={{ opacity: 0.9 }}>Full navigation with smooth hover effects</p>
            </div>

            <div style={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              padding: '2rem',
              borderRadius: '12px',
              color: 'white'
            }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Mobile</h3>
              <p style={{ opacity: 0.9 }}>Hamburger menu with dropdown</p>
            </div>

            <div style={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              padding: '2rem',
              borderRadius: '12px',
              color: 'white'
            }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Animations</h3>
              <p style={{ opacity: 0.9 }}>GSAP-powered smooth transitions</p>
            </div>
          </div>

          <div style={{ 
            marginTop: '3rem',
            padding: '2rem',
            background: '#fff3cd',
            border: '2px solid #ffc107',
            borderRadius: '12px'
          }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#856404' }}>
              💡 Pro Tip:
            </h3>
            <p style={{ fontSize: '1rem', color: '#856404', lineHeight: '1.6' }}>
              Try hovering over the navigation items and logo to see the smooth animations in action!
              The navbar is fixed at the top, so it will stay visible as you scroll.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

