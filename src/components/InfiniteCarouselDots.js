import React from 'react';
import PropTypes from 'prop-types';

function InfiniteCarouselDots({
  numberOfDots, activePage, onClick, styles,
}) {
  const dots = [];
  const className = styles.InfiniteCarouselDots;
  const dotClassName = styles.InfiniteCarouselDot;
  const dotIconClassName = styles.InfiniteCarouselDotIcon;
  const activeClass = styles.InfiniteCarouselDotActiveIcon;
  let classNameIcon;

  for (let i = 0; i < numberOfDots; i += 1) {
    classNameIcon = `${dotIconClassName} ${i === activePage ? activeClass : ''}`;
    dots.push(<button className={dotClassName} data-index={i} key={i + 1} onClick={onClick}>
      <i className={classNameIcon} />
    </button>); // eslint-disable-line react/jsx-closing-tag-location
  }

  return (
    <ul className={className}>
      {dots}
    </ul>
  );
}

InfiniteCarouselDots.propTypes = {
  numberOfDots: PropTypes.number.isRequired,
  activePage: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  styles: PropTypes.object.isRequired,
};

export default InfiniteCarouselDots;
