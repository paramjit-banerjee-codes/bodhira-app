import { useState, useRef, useEffect } from 'react';
import './PremiumCarousel.css';

// Placeholder cards - content will be added later
const CAROUSEL_ITEMS = [
  {
    id: 1,
    title: 'Feature One',
    subtitle: 'Coming Soon',
    icon: '✨',
    description: 'Premium feature description will be added here',
    details: 'Detailed information about this feature',
  },
  {
    id: 2,
    title: 'Feature Two',
    subtitle: 'Coming Soon',
    icon: '🚀',
    description: 'Premium feature description will be added here',
    details: 'Detailed information about this feature',
  },
  {
    id: 3,
    title: 'Feature Three',
    subtitle: 'Coming Soon',
    icon: '💡',
    description: 'Premium feature description will be added here',
    details: 'Detailed information about this feature',
  },
  {
    id: 4,
    title: 'Feature Four',
    subtitle: 'Coming Soon',
    icon: '🎯',
    description: 'Premium feature description will be added here',
    details: 'Detailed information about this feature',
  },
  {
    id: 5,
    title: 'Feature Five',
    subtitle: 'Coming Soon',
    icon: '⚡',
    description: 'Premium feature description will be added here',
    details: 'Detailed information about this feature',
  },
];

export default function PremiumCarousel() {
  const [activeCard, setActiveCard] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const carouselRef = useRef(null);
  const scrollPositionRef = useRef(0);

  // Auto-scroll carousel
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const scrollInterval = setInterval(() => {
      const scrollAmount = 1; // Slow, smooth scroll
      carousel.scrollLeft += scrollAmount;

      // Loop the carousel
      if (carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth) {
        carousel.scrollLeft = 0;
      }
    }, 30); // 30ms for smooth scrolling

    return () => clearInterval(scrollInterval);
  }, []);

  const openModal = (item) => {
    setActiveCard(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setActiveCard(null), 300);
  };

  return (
    <>
      <section className="premium-carousel-section">
        <div className="carousel-container">
          <div className="carousel-wrapper">
            <div className="carousel-track" ref={carouselRef}>
              {CAROUSEL_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="carousel-card"
                  onClick={() => openModal(item)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      openModal(item);
                    }
                  }}
                >
                  {/* Card Content */}
                  <div className="card-content">
                    {/* Icon */}
                    <div className="card-icon-wrapper">
                      <div className="card-icon">{item.icon}</div>
                      <div className="card-glow"></div>
                    </div>

                    {/* Title */}
                    <h3 className="card-title">{item.title}</h3>

                    {/* Subtitle */}
                    <p className="card-subtitle">{item.subtitle}</p>

                    {/* Description */}
                    <p className="card-description">{item.description}</p>

                    {/* CTA */}
                    <div className="card-cta">
                      <span className="cta-text">Explore</span>
                      <span className="cta-arrow">→</span>
                    </div>
                  </div>

                  {/* Background Glow */}
                  <div className="card-bg-glow"></div>
                </div>
              ))}

              {/* Duplicate items for seamless looping */}
              {CAROUSEL_ITEMS.map((item) => (
                <div
                  key={`${item.id}-duplicate`}
                  className="carousel-card"
                  onClick={() => openModal(item)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      openModal(item);
                    }
                  }}
                >
                  <div className="card-content">
                    <div className="card-icon-wrapper">
                      <div className="card-icon">{item.icon}</div>
                      <div className="card-glow"></div>
                    </div>
                    <h3 className="card-title">{item.title}</h3>
                    <p className="card-subtitle">{item.subtitle}</p>
                    <p className="card-description">{item.description}</p>
                    <div className="card-cta">
                      <span className="cta-text">Explore</span>
                      <span className="cta-arrow">→</span>
                    </div>
                  </div>
                  <div className="card-bg-glow"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Gradient Fade Edges */}
          <div className="carousel-fade-left"></div>
          <div className="carousel-fade-right"></div>
        </div>
      </section>

      {/* Modal */}
      {showModal && activeCard && (
        <div className="carousel-modal-overlay" onClick={closeModal}>
          <div
            className="carousel-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-icon-wrapper">
                <div className="modal-icon">{activeCard.icon}</div>
              </div>
              <button
                className="modal-close"
                onClick={closeModal}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              <h2 className="modal-title">{activeCard.title}</h2>
              <p className="modal-subtitle">{activeCard.subtitle}</p>
              <p className="modal-description">{activeCard.description}</p>

              {/* Details Section - Ready for content */}
              <div className="modal-details">
                <h3 className="details-title">Details</h3>
                <p className="details-text">{activeCard.details}</p>
              </div>

              {/* CTA Button */}
              <button className="modal-cta-button">
                Learn More
                <span className="button-arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
