import React from 'react';
import PropTypes from 'prop-types';
import styles from './InfiniteCarousel.css';

function InfiniteCarouselDots({ carouselName, numberOfDots, activePage, onClick }) {
  const dots = [];
  const className = styles.InfiniteCarouselDots;
  const dotClassName = styles.InfiniteCarouselDot;
  const dotIconClassName = styles.InfiniteCarouselDotIcon;
  const activeClass = styles.InfiniteCarouselDotActiveIcon;
  let classNameIcon;
  let dotName;

  for (let i = 0; i < numberOfDots; i += 1) {
    classNameIcon = `${dotIconClassName} ${i === activePage ? activeClass : ''}`;
    dotName = `${carouselName}-dots-${i}`;
    dots.push(
      <button
        name={dotName}
        data-testid={dotName}
        className={dotClassName}
        data-index={i}
        key={i + 1}
        onClick={onClick}
        type="button"
      >
        <i className={classNameIcon} />
      </button>
    ); // eslint-disable-line react/jsx-closing-tag-location
  }

  return (
    <ul data-testid={`${carouselName}-dots`} className={className}>
      {dots}
    </ul>
  );
}

InfiniteCarouselDots.propTypes = {
  carouselName: PropTypes.string.isRequired,
  numberOfDots: PropTypes.number.isRequired,
  activePage: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default InfiniteCarouselDots;
