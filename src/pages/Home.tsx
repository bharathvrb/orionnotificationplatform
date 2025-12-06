import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const actionCards = [
    {
      title: 'New ONP Event Onboarding',
      description: 'Configure and onboard new events to the platform with ease',
      icon: '🚀',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      onClick: () => navigate('/onboard'),
    },
    {
      title: 'View Event Details',
      description: 'Browse and search existing event configurations',
      icon: '📋',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      onClick: () => navigate('/events'),
    },
    {
      title: 'Check MongoDB Details',
      description: 'View MongoDB connection and data details',
      icon: '🍃',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      onClick: () => navigate('/mongodb'),
    },
    {
      title: 'Check Kafka Details',
      description: 'Monitor Kafka topics and consumer groups',
      icon: '⚡',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      onClick: () => navigate('/kafka'),
    },
  ];

  return (
    <div 
      id="home-page"
      style={{ 
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #60a5fa 50%, #3b82f6 75%, #2563eb 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
        padding: '0',
        margin: '0',
        position: 'relative',
        display: 'block',
        overflow: 'hidden'
      }}
    >
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>
      
      {/* Decorative Background Elements */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'pulse 4s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-30%',
        left: '-10%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'pulse 5s ease-in-out infinite'
      }}></div>

      {/* Hero Section */}
      <div style={{ paddingTop: '2.5rem', paddingBottom: '2rem', width: '100%', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ marginBottom: '1rem', animation: 'float 3s ease-in-out infinite' }}>
              <div style={{
                display: 'inline-block',
                fontSize: '4rem',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
              }}>
                🚀
              </div>
            </div>
            <h1 style={{ 
              fontSize: '2.75rem', 
              fontWeight: '800', 
              color: 'white', 
              marginBottom: '0.75rem', 
              textShadow: '0 4px 12px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)',
              letterSpacing: '-0.02em'
            }}>
              Orion Notification Platform
            </h1>
            <p style={{ 
              fontSize: '1.125rem', 
              color: 'rgba(255,255,255,0.95)', 
              fontWeight: '400', 
              maxWidth: '650px', 
              margin: '0 auto',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              lineHeight: '1.6'
            }}>
              Fast, Secure, and Reliable Communication Platform
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 2.5rem', width: '100%', position: 'relative', zIndex: 1 }}>
        {/* About Section */}
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.98)', 
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem', 
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          padding: '2rem',
          marginBottom: '2rem',
          width: '100%',
          boxSizing: 'border-box',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 25px 30px -5px rgba(0, 0, 0, 0.2), 0 15px 15px -5px rgba(0, 0, 0, 0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)';
        }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{
              width: '5px',
              height: '2rem',
              background: 'linear-gradient(to bottom, #3b82f6, #2563eb)',
              borderRadius: '9999px',
              marginRight: '1rem',
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
            }}></div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              color: '#1e40af',
              margin: 0,
              letterSpacing: '-0.01em'
            }}>
              About ONP
            </h2>
          </div>
          <p style={{ 
            fontSize: '1rem', 
            color: '#4b5563', 
            lineHeight: '1.7', 
            marginBottom: '0',
            fontWeight: '400'
          }}>
            ONP (Orion Notification Platform) enables applications to send notifications to other systems within Comcast. 
            ONP guarantees <strong style={{ color: '#2563eb', fontWeight: '600' }}>fast, secure, and reliable</strong> communication. 
            With just a few configuration steps, consumers can start sending messages to destination systems.
          </p>
        </div>

        {/* Action Cards */}
        <div style={{ marginBottom: '0', width: '100%' }}>
          <h2 style={{ 
            fontSize: '1.75rem', 
            fontWeight: '700', 
            color: 'white', 
            marginBottom: '1.5rem', 
            textAlign: 'center', 
            textShadow: '0 4px 12px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)',
            letterSpacing: '-0.01em'
          }}>
            Get Started
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {actionCards.map((card, index) => (
              <div
                key={index}
                onClick={card.onClick}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '1rem',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '1.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 25px 35px -5px rgba(0, 0, 0, 0.25), 0 15px 15px -5px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)';
                }}
              >
                {/* Gradient Accent */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: card.gradient,
                  borderRadius: '1rem 1rem 0 0'
                }}></div>
                
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ 
                    fontSize: '2.5rem',
                    width: '64px',
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: card.gradient,
                    padding: '0.75rem',
                    borderRadius: '0.75rem',
                    boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.2)',
                    flexShrink: 0,
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'rotate(5deg) scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'rotate(0) scale(1)';
                  }}
                  >
                    {card.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '700', 
                      color: '#1e40af', 
                      marginBottom: '0.5rem',
                      letterSpacing: '-0.01em',
                      lineHeight: '1.3'
                    }}>
                      {card.title}
                    </h3>
                    <p style={{ 
                      fontSize: '0.9375rem', 
                      color: '#6b7280', 
                      marginBottom: '1rem', 
                      lineHeight: '1.6',
                      fontWeight: '400'
                    }}>
                      {card.description}
                    </p>
                    <div style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      color: '#2563eb', 
                      fontWeight: '600', 
                      fontSize: '0.9375rem',
                      padding: '0.5rem 0',
                      transition: 'transform 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                    >
                      <span>Get Started</span>
                      <svg style={{ width: '1.125rem', height: '1.125rem', marginLeft: '0.5rem', transition: 'transform 0.2s ease' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
