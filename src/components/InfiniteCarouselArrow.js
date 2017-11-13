import React from 'react';
import PropTypes from 'prop-types';

function InfiniteCarouselArrow({ next, onClick, styles }) {
  const arrowClassName = styles.InfiniteCarouselArrow;
  let typeClassName;
  if (next) {
    typeClassName = styles.InfiniteCarouselArrowNext;
  } else {
    typeClassName = styles.InfiniteCarouselArrowPrev;
  }

  const iconClassName = styles.InfiniteCarouselArrowIcon;
  let iconTypeClassName;
  if (next) {
    iconTypeClassName = styles.InfiniteCarouselArrowNextIcon;
  } else {
    iconTypeClassName = styles.InfiniteCarouselArrowPrevIcon;
  }

  const className = `${arrowClassName} ${typeClassName}`;
  const classNameIcon = `${iconClassName} ${iconTypeClassName}`;

  return (
    <button
      className={className}
      onClick={onClick}
    >
      <i className={classNameIcon} />
    </button>
  );
}

InfiniteCarouselArrow.propTypes = {
  next: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  styles: PropTypes.object.isRequired,
};

InfiniteCarouselArrow.defaultProps = {
  next: true,
};

export default InfiniteCarouselArrow;
