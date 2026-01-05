import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showAbout, setShowAbout] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showUserGuide, setShowUserGuide] = useState(false);

  // Function to download image
  const downloadImage = async (imagePath: string, imageName: string) => {
    try {
      const response = await fetch(imagePath);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = imageName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  // Icon components for each action card - SVG icons representing each task
  const OnboardIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
      <circle cx="12" cy="19" r="1" fill="white" />
    </svg>
  );

  const ViewEventsIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );

  const MongoDBIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <ellipse cx="12" cy="19" rx="9" ry="3" />
      <circle cx="12" cy="12" r="1" fill="white" />
    </svg>
  );

  const KafkaIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Representing Kafka topics and message flow */}
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="7" y1="8" x2="17" y2="8" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="7" y1="16" x2="17" y2="16" />
      <circle cx="9" cy="8" r="1" fill="white" />
      <circle cx="9" cy="12" r="1" fill="white" />
      <circle cx="9" cy="16" r="1" fill="white" />
      <path d="M12 8l3 3-3 3" />
    </svg>
  );


  const actionCards = [
    {
      title: 'New Event Onboarding',
      description: 'Configure and onboard new events to the platform with ease',
      iconComponent: OnboardIcon,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      onClick: () => navigate('/onboard'),
    },
    {
      title: 'MongoDB and Redis Details',
      description: 'View existing events, insert new events, or update event entries in MongoDB and refresh Redis cache',
      iconComponent: MongoDBIcon,
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      onClick: () => navigate('/mongodb'),
    },
    {
      title: 'Kafka Details',
      description: 'View existing Kafka topics and consumer groups, or create new Kafka topics with specified partitions and replication factor',
      iconComponent: KafkaIcon,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      onClick: () => navigate('/kafka'),
    },
    {
      title: 'View Complete Event Information',
      description: 'Browse and view all event configurations with detailed information',
      iconComponent: ViewEventsIcon,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      onClick: () => navigate('/events'),
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
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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

      {/* Header with User Info */}
      <div style={{ position: 'absolute', top: '1rem', right: '1.5rem', zIndex: 10 }}>
        {user && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '0.5rem 1rem',
            borderRadius: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}>
            {/* User Avatar */}
            <div style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '700',
              fontSize: '0.875rem',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              flexShrink: 0
            }}>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#1e40af', lineHeight: '1.2' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#6b7280', lineHeight: '1.2' }}>
                {user.username}
              </div>
            </div>
            <button
              onClick={logout}
              style={{
                padding: '0.375rem 0.75rem',
                fontSize: '0.8125rem',
                fontWeight: '600',
                color: '#dc2626',
                backgroundColor: 'transparent',
                border: '1px solid #dc2626',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fee2e2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>

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
                
              </div>
            </div>
            <h1 style={{ 
              fontSize: '2.25rem', 
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
              fontSize: '1.25rem', 
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
            marginBottom: '0.75rem',
            fontWeight: '400'
          }}>
            ONP (Orion Notification Platform) enables applications to send notifications to other systems within Comcast. ONP guarantees fast, secure, and reliable communication. With just a few configuration steps, consumers can start sending messages to destination systems.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            {!showAbout ? (
              <button
                onClick={() => setShowAbout(true)}
                style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.375rem',
                  background: 'transparent',
                  color: '#6b7280',
                  fontWeight: 400,
                  fontSize: '0.875rem',
                  border: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f9fafb';
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.color = '#4b5563';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                More
              </button>
            ) : (
              <button
                onClick={() => setShowAbout(false)}
                style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.375rem',
                  background: 'transparent',
                  color: '#6b7280',
                  fontWeight: 400,
                  fontSize: '0.875rem',
                  border: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f9fafb';
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.color = '#4b5563';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                Less
              </button>
            )}
          </div>

          {showAbout && (
            <>
              <div style={{
                marginTop: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  borderRadius: '1rem',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  boxShadow: '0 20px 30px -15px rgba(0, 0, 0, 0.15)',
                  padding: '0.75rem'
                }}>
                  <div style={{ 
                    fontSize: '0.95rem', 
                    fontWeight: 600, 
                    color: '#1e3a8a',
                    marginBottom: '0.75rem'
                  }}>High-level flow of schema cache, audit, Kafka topics, and downstream routing</div>
                  <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '0.75rem',
                    padding: '0.5rem',
                    border: '1px solid rgba(59, 130, 246, 0.15)',
                    textAlign: 'center'
                  }}>
                    <img
                      src="/images/onp-message-service-overview.png"
                      alt="High-level flow of schema cache, audit, Kafka topics, and downstream routing"
                      onClick={() => setSelectedImage("/images/onp-message-service-overview.png")}
                      style={{ 
                        width: '100%', 
                        borderRadius: '0.5rem', 
                        border: '1px solid rgba(59, 130, 246, 0.1)',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    />
                  </div>
                </div>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  borderRadius: '1rem',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  boxShadow: '0 20px 30px -15px rgba(0, 0, 0, 0.15)',
                  padding: '0.75rem'
                }}>
                  <div style={{ 
                    fontSize: '0.95rem', 
                    fontWeight: 600, 
                    color: '#065f46',
                    marginBottom: '0.75rem'
                  }}>ONP and ONPSubscriber sequence: cache lookup, Mongo refresh, validation, Kafka, downstream, and fallback</div>
                  <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '0.75rem',
                    padding: '0.5rem',
                    border: '1px solid rgba(16, 185, 129, 0.15)',
                    textAlign: 'center'
                  }}>
                    <img
                      src="/images/onp-notification-platform-flow.png"
                      alt="ONP and ONPSubscriber sequence: cache lookup, Mongo refresh, validation, Kafka, downstream, and fallback"
                      onClick={() => setSelectedImage("/images/onp-notification-platform-flow.png")}
                      style={{ 
                        width: '100%', 
                        borderRadius: '0.5rem', 
                        border: '1px solid rgba(16, 185, 129, 0.1)',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    />
                  </div>
                </div>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  borderRadius: '1rem',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  boxShadow: '0 20px 30px -15px rgba(0, 0, 0, 0.15)',
                  padding: '0.75rem'
                }}>
                  <div style={{ 
                    fontSize: '0.95rem', 
                    fontWeight: 600, 
                    color: '#92400e',
                    marginBottom: '0.75rem'
                  }}>ONP Event Onboarding Steps</div>
                  <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '0.75rem',
                    padding: '0.5rem',
                    border: '1px solid rgba(245, 158, 11, 0.15)',
                    textAlign: 'center',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '200px'
                  }}>
                    <img
                      src="/images/onp-onboarding-steps.png"
                      alt="ONP Event Onboarding Steps: INSERT MONGODB AUTHORIZATION/NOTIFICATION SCHEMA, REFRESH REDIS CACHE, CREATE DEPLOYMENT MANIFEST FILES, CREATE ORION PROPERTIES FILES, CREATE KAFKA TOPIC, UPDATE VAULT CONCOURSE-CI, FALLBACK DB ENTRY, CREATE CONCOURSE PIPELINE AND DEPLOY, PERFORM TESTING"
                      onClick={() => setSelectedImage("/images/onp-onboarding-steps.png")}
                      style={{ 
                        maxWidth: '100%', 
                        height: 'auto',
                        borderRadius: '0.5rem', 
                        border: '1px solid rgba(245, 158, 11, 0.1)',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s ease',
                        display: 'block',
                        objectFit: 'contain'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                      onError={(e) => {
                        console.error('Image failed to load:', e.currentTarget.src);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* References Section */}
              <div style={{
                marginTop: '1.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{
                    width: '4px',
                    height: '1.5rem',
                    background: 'linear-gradient(to bottom, #8b5cf6, #7c3aed)',
                    borderRadius: '9999px',
                    marginRight: '0.75rem',
                    boxShadow: '0 2px 4px -1px rgba(139, 92, 246, 0.3)'
                  }}></div>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    color: '#6b21a8',
                    margin: 0,
                    letterSpacing: '-0.01em'
                  }}>
                    References
                  </h3>
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <a
                    href="https://etwiki.sys.comcast.net/pages/viewpage.action?pageId=775918571"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 0.9rem',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      background: 'rgba(59, 130, 246, 0.08)',
                      color: '#1d4ed8',
                      fontWeight: 600,
                      textDecoration: 'none',
                      boxShadow: '0 10px 20px -12px rgba(59, 130, 246, 0.35)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.12)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 12px 24px -12px rgba(59, 130, 246, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 10px 20px -12px rgba(59, 130, 246, 0.35)';
                    }}
                  >
                    <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    ONP Overview Wiki
                  </a>
                  <a
                    href="https://etwiki.sys.comcast.net/display/BSTA/ONP+Notifications"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 0.9rem',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      background: 'rgba(16, 185, 129, 0.08)',
                      color: '#047857',
                      fontWeight: 600,
                      textDecoration: 'none',
                      boxShadow: '0 10px 20px -12px rgba(16, 185, 129, 0.3)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(16, 185, 129, 0.12)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 12px 24px -12px rgba(16, 185, 129, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 10px 20px -12px rgba(16, 185, 129, 0.3)';
                    }}
                  >
                    <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    ONP Notifications Wiki
                  </a>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Cards - Advanced Modern Layout */}
        <div style={{ marginBottom: '0', width: '100%' }}>
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '3rem' 
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              color: 'white', 
              marginBottom: '0', 
              textShadow: '0 4px 12px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)',
              letterSpacing: '-0.01em'
            }}>
              Platform Actions
            </h2>
          </div>
          
          {/* Modern Grid Layout with Staggered Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '1.75rem',
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            {actionCards.map((card, index) => {
              const isComingSoon = card.title === 'View Complete Event Information';
              
              return (
              <div
                key={index}
                onClick={card.onClick}
                style={{
                  backgroundColor: isComingSoon 
                    ? 'rgba(255, 255, 255, 0.6)' 
                    : '#ffffff',
                  backdropFilter: 'blur(10px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                  borderRadius: '1.25rem',
                  boxShadow: isComingSoon 
                    ? '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)' 
                    : '0 4px 20px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
                  border: isComingSoon 
                    ? '1px solid rgba(0, 0, 0, 0.08)' 
                    : '1px solid rgba(0, 0, 0, 0.06)',
                  padding: '1.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  opacity: isComingSoon ? 0.7 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '240px',
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                }}
                onMouseEnter={(e) => {
                  if (!isComingSoon) {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.12)';
                    const overlay = e.currentTarget.querySelector('.card-gradient-overlay') as HTMLElement;
                    if (overlay) {
                      overlay.style.opacity = '0.03';
                    }
                    const indicator = e.currentTarget.querySelector('.card-indicator') as HTMLElement;
                    if (indicator) {
                      indicator.style.opacity = '1';
                      indicator.style.transform = 'translateX(0)';
                    }
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isComingSoon) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.06)';
                    const overlay = e.currentTarget.querySelector('.card-gradient-overlay') as HTMLElement;
                    if (overlay) {
                      overlay.style.opacity = '0';
                    }
                    const indicator = e.currentTarget.querySelector('.card-indicator') as HTMLElement;
                    if (indicator) {
                      indicator.style.opacity = '0';
                      indicator.style.transform = 'translateX(-8px)';
                    }
                  }
                }}
              >
                {/* Subtle gradient overlay on hover */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: card.gradient,
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none',
                  borderRadius: '1.25rem',
                  zIndex: 0
                }}
                className="card-gradient-overlay"
                ></div>
                
                {/* Top accent line */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: card.gradient,
                  borderRadius: '1.25rem 1.25rem 0 0',
                  opacity: isComingSoon ? 0.5 : 1,
                  zIndex: 1
                }}></div>
                
                {/* Content Container */}
                <div style={{ 
                  position: 'relative', 
                  zIndex: 2,
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '1rem',
                  height: '100%'
                }}>
                  {/* Icon Container */}
                  <div style={{ 
                    width: '56px',
                    height: '56px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: card.gradient,
                    borderRadius: '0.875rem',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: isComingSoon ? 0.6 : 1,
                    alignSelf: 'flex-start',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    if (!isComingSoon) {
                      e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isComingSoon) {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    }
                  }}
                  >
                    {card.iconComponent && <card.iconComponent />}
                  </div>
                  
                  {/* Text Content */}
                  <div style={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '1rem'
                  }}>
                    {/* Title and Description */}
                    <div>
                      <h3 style={{ 
                        fontSize: '1.125rem', 
                        fontWeight: '700', 
                        color: isComingSoon ? 'rgba(30, 64, 175, 0.5)' : '#1e40af', 
                        margin: '0 0 0.625rem 0',
                        letterSpacing: '-0.01em'
                      }}>
                        {card.title}
                      </h3>
                      <p style={{ 
                        fontSize: '0.9375rem', 
                        color: isComingSoon ? 'rgba(75, 85, 99, 0.6)' : '#4b5563', 
                        lineHeight: '1.7',
                        fontWeight: '400',
                        margin: 0
                      }}>
                        {card.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Action Indicator */}
                  {!isComingSoon && (
                    <div 
                      className="card-indicator"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        color: '#475569',
                        fontSize: '0.8125rem',
                        fontWeight: '600',
                        marginTop: '0.75rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                        opacity: 0,
                        transition: 'all 0.3s ease',
                        transform: 'translateX(-8px)'
                      }}
                    >
                      <span>Get started</span>
                      <svg style={{ width: '1rem', height: '1rem', marginLeft: '0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* User Guide Link */}
        <div style={{
          marginTop: '3rem',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center'
        }}>
          <button
            onClick={() => setShowUserGuide(true)}
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              background: 'transparent',
              border: 'none',
              fontSize: '0.875rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              transition: 'color 0.2s ease',
              padding: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ opacity: 0.7 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            User Guide
          </button>
        </div>

      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            cursor: 'pointer',
            padding: '2rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '1rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Close and Download buttons */}
            <div style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              display: 'flex',
              gap: '0.5rem',
              zIndex: 10000
            }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const imageName = selectedImage.split('/').pop() || 'image.png';
                  downloadImage(selectedImage, imageName);
                }}
                style={{
                  background: 'rgba(59, 130, 246, 0.9)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '2.5rem',
                  height: '2.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 1)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.9)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                title="Download image"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              <button
                onClick={() => setSelectedImage(null)}
                style={{
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '2.5rem',
                  height: '2.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  transition: 'background 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
                }}
                title="Close"
              >
                ×
              </button>
            </div>
            <img
              src={selectedImage}
              alt="Enlarged view"
              style={{
                maxWidth: '100%',
                maxHeight: '85vh',
                borderRadius: '0.25rem',
                display: 'block'
              }}
            />
          </div>
        </div>
      )}

      {/* User Guide Modal */}
      {showUserGuide && (
        <div
          onClick={() => setShowUserGuide(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '2rem',
            overflow: 'auto'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              backgroundColor: 'white',
              borderRadius: '1rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              padding: '1.5rem',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '2px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: 0, marginBottom: '0.5rem' }}>
                  📚 ONP Platform User Guide
                </h2>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem' }}>
                  Comprehensive guide to using the ONP Platform
                </p>
              </div>
              <button
                onClick={() => setShowUserGuide(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '2.5rem',
                  height: '2.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  transition: 'background 0.2s ease',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                title="Close"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '2rem',
              backgroundColor: '#f9fafb'
            }}>
              <UserGuideContent />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// User Guide Content Component
const UserGuideContent: React.FC = () => {
  const sectionStyle = {
    marginBottom: '2.5rem',
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  };

  const headingStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '2px solid #3b82f6'
  };

  const subHeadingStyle = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1e3a8a',
    marginTop: '1.5rem',
    marginBottom: '0.75rem'
  };

  const textStyle = {
    color: '#374151',
    lineHeight: '1.7',
    marginBottom: '1rem'
  };

  const listStyle = {
    marginLeft: '1.5rem',
    marginBottom: '1rem',
    color: '#374151',
    lineHeight: '1.8'
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Table of Contents */}
      <div style={sectionStyle}>
        <h2 style={headingStyle}>Table of Contents</h2>
        <ol style={{ ...listStyle, listStyleType: 'decimal' }}>
          <li>Introduction</li>
          <li>Getting Started</li>
          <li>Home Page</li>
          <li>New Event Onboarding</li>
          <li>MongoDB and Redis Details (View, Insert, Update)</li>
          <li>Kafka Details (View, Create)</li>
          <li>View Complete Event Information</li>
          <li>Download Functionality</li>
          <li>Authentication & Authorization</li>
          <li>Troubleshooting</li>
          <li>Best Practices</li>
        </ol>
      </div>

      {/* Introduction */}
      <div style={sectionStyle}>
        <h2 style={headingStyle}>Introduction</h2>
        <p style={textStyle}>
          The <strong>Orion Notification Platform (ONP)</strong> is a comprehensive platform for managing event notifications, 
          Kafka topics, MongoDB configurations, and downstream integrations. This user guide will help you navigate and 
          utilize all features of the ONP platform effectively.
        </p>
        <h3 style={subHeadingStyle}>What is ONP?</h3>
        <p style={textStyle}>ONP is a notification platform that handles:</p>
        <ul style={listStyle}>
          <li><strong>Event Onboarding</strong>: Configure and onboard new events to the platform</li>
          <li><strong>Message Streaming</strong>: Manage Kafka topics for event messaging</li>
          <li><strong>Data Storage</strong>: Configure MongoDB and Redis for event data</li>
          <li><strong>Downstream Integration</strong>: Connect events to downstream systems</li>
          <li><strong>Deployment Management</strong>: Handle deployment manifests and configuration files</li>
        </ul>
      </div>

      {/* Getting Started */}
      <div style={sectionStyle}>
        <h2 style={headingStyle}>Getting Started</h2>
        <h3 style={subHeadingStyle}>Accessing the Platform</h3>
        <ol style={{ ...listStyle, listStyleType: 'decimal' }}>
          <li>Navigate to the ONP platform URL</li>
          <li>You will be prompted to log in using your credentials</li>
          <li>Upon successful authentication, you'll be redirected to the Home page</li>
        </ol>
        <h3 style={subHeadingStyle}>Navigation</h3>
        <p style={textStyle}>The platform consists of four main sections accessible from the Home page:</p>
        <ul style={listStyle}>
          <li><strong>New Event Onboarding</strong>: Create and configure new events with multiple request criteria</li>
          <li><strong>MongoDB and Redis Details</strong>: View existing events, insert new events, or update event entries in MongoDB and refresh Redis cache</li>
          <li><strong>Kafka Details</strong>: View existing Kafka topics and consumer groups, or create new Kafka topics</li>
          <li><strong>View Complete Event Information</strong>: Browse and view all event configurations with detailed information</li>
        </ul>
      </div>

      {/* Home Page */}
      <div style={sectionStyle}>
        <h2 style={headingStyle}>Home Page</h2>
        <p style={textStyle}>
          The Home page serves as the central hub for all platform operations.
        </p>
        <h3 style={subHeadingStyle}>About ONP Section</h3>
        <p style={textStyle}>The "About ONP" section provides:</p>
        <ul style={listStyle}>
          <li><strong>Platform Overview</strong>: High-level information about the ONP platform</li>
          <li><strong>Flow Diagrams</strong>: Visual representations of platform architecture</li>
        </ul>
        <p style={textStyle}>
          <strong>Features:</strong> Click on any image to view it in full-screen modal. Download images directly from 
          the modal using the download button. Expand/collapse the section using "More" and "Less" buttons.
        </p>
        <h3 style={subHeadingStyle}>Platform Actions</h3>
        <p style={textStyle}>Four action cards provide quick access to main features:</p>
        <ul style={listStyle}>
          <li><strong>New Event Onboarding</strong> (Blue): Configure and onboard new events with multiple request criteria (MongoDB/Redis, Kafka Topic, Deployment Manifest, etc.)</li>
          <li><strong>MongoDB and Redis Details</strong> (Green): Access three sub-options - View existing events, Insert new events, or Update existing event entries in MongoDB and refresh Redis cache</li>
          <li><strong>Kafka Details</strong> (Orange): Access two sub-options - View existing Kafka topics and consumer groups, or Create new Kafka topics with specified configuration</li>
          <li><strong>View Complete Event Information</strong> (Purple): Browse and view all event configurations with detailed information</li>
        </ul>
      </div>

      {/* New Event Onboarding */}
      <div style={sectionStyle}>
        <h2 style={headingStyle}>New Event Onboarding</h2>
        <p style={textStyle}>
          The New Event Onboarding page allows you to configure and onboard new events to the platform.
        </p>
        <h3 style={subHeadingStyle}>Step 1: Select Environment</h3>
        <p style={textStyle}>Choose an environment from the dropdown menu at the top of the page. Once you select an environment, the form fields will automatically appear below. Available environments:</p>
        <ul style={listStyle}>
          <li>DEV AS-G8</li>
          <li>DEV HO-G2</li>
          <li>QA AS-G8</li>
          <li>QA HO-G2</li>
          <li>INT AS-G8</li>
          <li>INT HO-G2</li>
          <li>FLX AS-G8</li>
          <li>FLA HO-G2</li>
          <li>TRN AS-G8</li>
          <li>TRN HO-G2</li>
          <li>STG CH2-G2</li>
          <li>STG HO-G4</li>
          <li>PROD G1</li>
          <li>PROD AS-G6</li>
          <li>PROD HO-G1</li>
          <li>PROD HO-G3</li>
          <li>BUS AS-G8</li>
          <li>BUS HO-G2</li>
        </ul>
        <h3 style={subHeadingStyle}>Step 2: Authorization Token</h3>
        <p style={textStyle}>After selecting an environment, the Authorization Token section appears. You have two options:</p>
        <ol style={{ ...listStyle, listStyleType: 'decimal' }}>
          <li><strong>Generate Token (SAT Service)</strong>: Click the "Generate Token" button, enter Client ID, Client Secret, and Scope in the modal, then click "Generate Token"</li>
          <li><strong>Manual Token Entry</strong>: Enter your Bearer token directly in the authorization field (no need to include "Bearer" prefix)</li>
        </ol>
        <p style={textStyle}><strong>Note:</strong> The authorization token field is optional but recommended for secure access. The "Generate Token" button is only enabled when the token field is empty.</p>
        
        <h3 style={subHeadingStyle}>Step 3: Configure Request Criteria</h3>
        <p style={textStyle}>Select one or more request criteria based on your needs. The form will dynamically show/hide fields based on your selection:</p>
        <ul style={listStyle}>
          <li><strong>MongoDB and Redis</strong>: Stores event data. Requires: Event Name, Header Schema, Payload Schema, Subscriber Name, and Downstream Details</li>
          <li><strong>Kafka Topic</strong>: Creates Kafka topics for event messaging. Requires: Subscriber Name, Number of Partitions, and Replication Factor</li>
          <li><strong>Deployment Manifest</strong>: Generates deployment manifest files. Requires: Subscriber Name, Commit Message, and Git Access Token</li>
          <li><strong>Orion Properties</strong>: Creates Orion properties configuration. Requires: Subscriber Name, Commit Message, and Git Access Token</li>
          <li><strong>Fallback DB</strong>: Configures fallback database settings. Requires: Downstream Details with HTTP Status Codes</li>
          <li><strong>Concourse Vault</strong>: Sets up Concourse Vault configuration. Requires: Subscriber Name</li>
        </ul>
        <h3 style={subHeadingStyle}>Step 4: Fill Required Fields</h3>
        <p style={textStyle}>Fields marked with an asterisk (*) are required. The form dynamically shows/hides fields based on selected request criteria:</p>
        <ul style={listStyle}>
          <li><strong>Event Name*</strong>: Unique identifier for the event (required for MongoDB and Redis)</li>
          <li><strong>Subscriber Name*</strong>: Name of the subscriber consuming the event (required for most criteria)</li>
          <li><strong>Header Schema*</strong>: JSON schema for event headers (required for MongoDB and Redis) - Use the JSON editor with syntax highlighting</li>
          <li><strong>Payload Schema*</strong>: JSON schema for event payloads (required for MongoDB and Redis) - Use the JSON editor with syntax highlighting</li>
          <li><strong>Number of Partitions*</strong>: Number of Kafka topic partitions (required for Kafka Topic, minimum 1)</li>
          <li><strong>Replication Factor*</strong>: Kafka topic replication factor (required for Kafka Topic, minimum 1)</li>
          <li><strong>Commit Message*</strong>: Git commit message (required for Deployment Manifest and Orion Properties)</li>
          <li><strong>Git Access Token*</strong>: Git access token (required for Deployment Manifest and Orion Properties)</li>
          <li><strong>Downstream Details</strong>: Add multiple downstream configurations with endpoints, credentials, and settings</li>
        </ul>
        <h3 style={subHeadingStyle}>Step 5: Validation</h3>
        <p style={textStyle}>
          The Validation Panel shows tasks that will execute and any validation errors. 
          The Submit button is disabled until all validations pass.
        </p>
        <h3 style={subHeadingStyle}>Step 6: Submit Request</h3>
        <p style={textStyle}>
          Review all fields and validation status. Click "Submit Onboarding Request" when all validations pass. 
          The button will be disabled after submission. To resubmit, edit any field to re-enable the button.
        </p>
        <h3 style={subHeadingStyle}>Step 7: View Results</h3>
        <p style={textStyle}>After submission, the Task Results panel displays:</p>
        <ul style={listStyle}>
          <li><strong>Success</strong> (Green): Task completed successfully</li>
          <li><strong>Failure</strong> (Red): Task failed with error message</li>
          <li><strong>Partial</strong> (Yellow): Task completed with warnings</li>
        </ul>
        <p style={textStyle}>
          Click "Download Excel" to export request details, response details, and metadata in a structured format.
        </p>
      </div>

      {/* MongoDB and Redis Details */}
      <div style={sectionStyle}>
        <h2 style={headingStyle}>MongoDB and Redis Details</h2>
        <p style={textStyle}>
          The MongoDB and Redis Details page provides three sub-options for managing events in MongoDB and Redis cache.
        </p>
        <h3 style={subHeadingStyle}>Accessing Sub-Options</h3>
        <p style={textStyle}>After clicking "MongoDB and Redis Details" on the home page, you'll see three option cards:</p>
        <ul style={listStyle}>
          <li><strong>View Existing Event</strong>: View events present in MongoDB and Redis cache with complete event information</li>
          <li><strong>Update Existing Event</strong>: Update existing event entries in MongoDB and refresh Redis cache</li>
          <li><strong>Insert New Event</strong>: Insert a new event into MongoDB and refresh Redis cache</li>
        </ul>
        <h3 style={subHeadingStyle}>Common Workflow: Environment Selection First</h3>
        <p style={textStyle}>
          All three sub-options follow the same workflow pattern:
        </p>
        <ol style={{ ...listStyle, listStyleType: 'decimal' }}>
          <li><strong>Step 1: Select Environment</strong>: Choose an environment from the dropdown (DEV, QA, INT, FLX, TRN, STG CH2-G2, STG HO-G4, PROD, BUS). This appears in a separate box at the top.</li>
          <li><strong>Step 2: Authorization Token</strong>: After selecting an environment, the Authorization Token section appears. Use "Generate Token" button or enter a custom Bearer token manually.</li>
          <li><strong>Step 3: Form Fields</strong>: After environment selection, the main form fields appear below.</li>
        </ol>
        <h3 style={subHeadingStyle}>Sub-Option 1: View Existing Event</h3>
        <p style={textStyle}>
          View events present in MongoDB and Redis cache with complete event information, including schemas, downstream details, and authorization data.
        </p>
        <ol style={{ ...listStyle, listStyleType: 'decimal' }}>
          <li>Select environment from the dropdown (appears first in a separate box)</li>
          <li>After environment selection, the Authorization Token section appears - use "Generate Token" or enter manually</li>
          <li>After token setup, the main form appears - specify events: Check "Fetch All Events" or enter specific event names separated by commas</li>
          <li>Click "Fetch Details" or "Fetch All Events" to submit query</li>
          <li>View results in expandable cards with detailed information including MongoDB data, Redis data, and downstream configurations</li>
        </ol>
        <p style={textStyle}>
          Use the search box to filter events. Click "Download Excel" to export query results. Results show event details, schemas, downstream information, and authorization data.
        </p>

        <h3 style={subHeadingStyle}>Sub-Option 2: Update Existing Event</h3>
        <p style={textStyle}>
          Update existing event entries in MongoDB and refresh Redis cache. Modify schemas, downstream configurations, and authorization settings.
        </p>
        <ol style={{ ...listStyle, listStyleType: 'decimal' }}>
          <li>Select environment from the dropdown (appears first in a separate box)</li>
          <li>After environment selection, the Authorization Token section appears - use "Generate Token" or enter manually</li>
          <li>After token setup, the main form appears - enter the name of an existing event that you want to update (required)</li>
          <li>Optionally enter Subscriber Name for subscriber-specific updates</li>
          <li>Configure or update Downstream Details (add, modify, or remove downstream configurations)</li>
          <li>Update Header Schema and Payload Schema using the JSON editors (optional)</li>
          <li>Review validation status and click "Update Event" button</li>
          <li>View results in the Task Results panel</li>
        </ol>
        <p style={textStyle}>
          <strong>Note:</strong> The event must already exist in the selected environment. You can modify schemas, downstream configurations, and other event properties.
        </p>

        <h3 style={subHeadingStyle}>Sub-Option 3: Insert New Event</h3>
        <p style={textStyle}>
          Insert a new event into MongoDB and refresh Redis cache. This allows you to add new events with complete configuration.
        </p>
        <ol style={{ ...listStyle, listStyleType: 'decimal' }}>
          <li>Select environment from the dropdown (appears first in a separate box)</li>
          <li>After environment selection, the Authorization Token section appears - use "Generate Token" or enter manually</li>
          <li>After token setup, the main form appears - fill in all required fields:
            <ul style={{ ...listStyle, marginTop: '0.5rem' }}>
              <li>Event Name* (required)</li>
              <li>Subscriber Name* (required)</li>
              <li>Header Schema* (required, valid JSON)</li>
              <li>Payload Schema* (required, valid JSON)</li>
              <li>Downstream Details (optional but recommended)</li>
            </ul>
          </li>
          <li>Review validation status and click "Insert Event" button</li>
          <li>View results in the Task Results panel</li>
        </ol>
        <p style={textStyle}>
          <strong>Note:</strong> This creates a new event in the selected environment. Ensure the event name is unique and all required fields are properly filled.
        </p>
      </div>

      {/* Kafka Details */}
      <div style={sectionStyle}>
        <h2 style={headingStyle}>Kafka Details</h2>
        <p style={textStyle}>
          The Kafka Details page provides two sub-options for managing Kafka topics and consumer groups.
        </p>
        <h3 style={subHeadingStyle}>Accessing Sub-Options</h3>
        <p style={textStyle}>After clicking "Kafka Details" on the home page, you'll see two option cards:</p>
        <ul style={listStyle}>
          <li><strong>View Kafka Details</strong>: View existing Kafka topics, consumer groups, partition information, and related settings</li>
          <li><strong>Create New Kafka Topic</strong>: Create new Kafka topics with specified partitions and replication factor</li>
        </ul>
        <h3 style={subHeadingStyle}>Common Workflow: Environment Selection First</h3>
        <p style={textStyle}>
          Both sub-options follow the same workflow pattern:
        </p>
        <ol style={{ ...listStyle, listStyleType: 'decimal' }}>
          <li><strong>Step 1: Select Environment</strong>: Choose an environment from the dropdown (DEV, QA, INT, FLX, TRN, STG CH2-G2, STG HO-G4, PROD, BUS). This appears in a separate box at the top.</li>
          <li><strong>Step 2: Authorization Token</strong>: After selecting an environment, the Authorization Token section appears. Use "Generate Token" button or enter a custom Bearer token manually.</li>
          <li><strong>Step 3: Form Fields</strong>: After environment selection, the main form fields appear below.</li>
        </ol>

        <h3 style={subHeadingStyle}>Sub-Option 1: View Kafka Details</h3>
        <p style={textStyle}>
          View event configuration present in Kafka including topics, consumer groups, partition information, and related settings.
        </p>
        <ol style={{ ...listStyle, listStyleType: 'decimal' }}>
          <li>Select environment from the dropdown (appears first in a separate box)</li>
          <li>After environment selection, the Authorization Token section appears - use "Generate Token" or enter manually</li>
          <li>After token setup, the main form appears - enter Kafka topic names separated by commas</li>
          <li>Click "Fetch Details" to submit query</li>
          <li>View results in expandable cards showing:
            <ul style={{ ...listStyle, marginTop: '0.5rem' }}>
              <li>Topic name and health status</li>
              <li>Partition information and replication factor</li>
              <li>Consumer group details</li>
              <li>Topic configuration settings</li>
            </ul>
          </li>
        </ol>
        <p style={textStyle}>
          Use the search box to filter topics. Click "Download Excel" to export query results. Results show comprehensive Kafka topic information including partitions, replication, consumer groups, and configuration.
        </p>

        <h3 style={subHeadingStyle}>Sub-Option 2: Create New Kafka Topic</h3>
        <p style={textStyle}>
          Create new Kafka topics with specified partitions and replication factor. This uses the ONP onboard API with kafkatopic request criteria.
        </p>
        <ol style={{ ...listStyle, listStyleType: 'decimal' }}>
          <li>Select environment from the dropdown (appears first in a separate box)</li>
          <li>After environment selection, the Authorization Token section appears - use "Generate Token" or enter manually</li>
          <li>After token setup, the main form appears - fill in required fields:
            <ul style={{ ...listStyle, marginTop: '0.5rem' }}>
              <li>Subscriber Name* (required)</li>
              <li>Number of Partitions* (required, minimum 1)</li>
              <li>Replication Factor* (required, minimum 1)</li>
            </ul>
          </li>
          <li>Review validation status in the Validation Panel</li>
          <li>Click "Create Kafka Topic" button</li>
          <li>View results in the Task Results panel showing success, failure, or partial status</li>
        </ol>
        <p style={textStyle}>
          <strong>Note:</strong> Event Name is not required for Kafka topic creation. Only Subscriber Name, Number of Partitions, and Replication Factor are required. The system will create the Kafka topic in the selected environment.
        </p>
      </div>

      {/* Download Functionality */}
      <div style={sectionStyle}>
        <h2 style={headingStyle}>Download Functionality</h2>
        <p style={textStyle}>
          The platform provides comprehensive download functionality for all operations. All downloads are provided as 
          <strong> Excel files (.xlsx)</strong> containing structured sections with color-coded status indicators.
        </p>
        <p style={textStyle}><strong>What can be downloaded:</strong></p>
        <ul style={listStyle}>
          <li>ONP Event Onboarding Results</li>
          <li>MongoDB Details</li>
          <li>Kafka Details</li>
          <li>Images from About ONP section</li>
        </ul>
      </div>

      {/* Authentication */}
      <div style={sectionStyle}>
        <h2 style={headingStyle}>Authentication & Authorization</h2>
        <p style={textStyle}>
          Most operations require an authorization token. You can generate a token using the SAT service or enter 
          a custom Bearer token manually. Tokens are masked in download files for security.
        </p>
      </div>

      {/* Troubleshooting */}
      <div style={sectionStyle}>
        <h2 style={headingStyle}>Troubleshooting</h2>
        <h3 style={subHeadingStyle}>Common Issues</h3>
        <ul style={listStyle}>
          <li><strong>401 Unauthorized</strong>: Verify your token is valid, generate a new token, or check environment</li>
          <li><strong>Validation Errors</strong>: Check all required fields are filled and JSON schemas are valid</li>
          <li><strong>Submit Button Disabled</strong>: Fix validation errors or edit fields to re-enable</li>
          <li><strong>No Results</strong>: Verify environment and event/topic names are correct</li>
          <li><strong>Download Not Working</strong>: Check browser popup blockers and try a different browser</li>
        </ul>
      </div>

      {/* Best Practices */}
      <div style={sectionStyle}>
        <h2 style={headingStyle}>Best Practices</h2>
        <ul style={listStyle}>
          <li>Plan your configuration before starting</li>
          <li>Use descriptive event names following naming conventions</li>
          <li>Test in non-production environments first</li>
          <li>Review results carefully and download for record-keeping</li>
          <li>Protect your tokens and never share them</li>
          <li>Double-check environment before submission</li>
          <li>Use templates for common configurations</li>
        </ul>
      </div>

      {/* Developer Information */}
      <div style={{
        ...sectionStyle,
        marginTop: '3rem',
        padding: '1rem'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '0.9rem',
          fontWeight: '500',
          color: '#6b7280',
          marginBottom: '0.75rem'
        }}>
          Developer Information
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            width: '2rem',
            height: '2rem',
            borderRadius: '50%',
            backgroundColor: '#e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6b7280',
            fontSize: '0.75rem',
            fontWeight: '500',
            flexShrink: 0
          }}>
            BK
          </div>
          <div>
            <p style={{
              margin: 0,
              fontSize: '0.85rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.15rem'
            }}>
              Bharath Kumar
            </p>
            <p style={{
              margin: 0,
              color: '#9ca3af',
              fontSize: '0.75rem'
            }}>
              Platform Developer
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        color: '#6b7280',
        fontSize: '0.9rem',
        borderTop: '1px solid #e5e7eb',
        marginTop: '2rem'
      }}>
        <p style={{ margin: 0 }}>
          <strong>Last Updated:</strong> January 2026 | <strong>Version:</strong> 1.0
        </p>
        <p style={{ margin: '0.5rem 0 0 0' }}>
          For questions or feedback, please contact your platform administrator.
        </p>
      </div>
    </div>
  );
};
