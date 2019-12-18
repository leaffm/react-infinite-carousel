import React from 'react';
import PropTypes from 'prop-types';
import './InfiniteCarousel.css';

function InfiniteCarouselArrow({ carouselName, next, onClick }) {
  const arrowClassName = 'InfiniteCarouselArrow';
  let typeClassName;
  if (next) {
    typeClassName = 'InfiniteCarouselArrowNext';
  } else {
    typeClassName = 'InfiniteCarouselArrowPrev';
  }

  const iconClassName = 'InfiniteCarouselArrowIcon';
  let iconTypeClassName;
  if (next) {
    iconTypeClassName = 'InfiniteCarouselArrowNextIcon';
  } else {
    iconTypeClassName = 'InfiniteCarouselArrowPrevIcon';
  }

  const className = `${arrowClassName} ${typeClassName}`;
  const classNameIcon = `${iconClassName} ${iconTypeClassName}`;
  const buttonName = `${carouselName}-button-${next ? 'next' : 'previous'}`;

  return (
    <button
      name={buttonName}
      data-testid={buttonName}
      className={className}
      onClick={onClick}
      type="button"
    >
      <i className={classNameIcon} />
    </button>
  );
}

InfiniteCarouselArrow.propTypes = {
  carouselName: PropTypes.string.isRequired,
  next: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

InfiniteCarouselArrow.defaultProps = {
  next: true,
};

export default InfiniteCarouselArrow;
