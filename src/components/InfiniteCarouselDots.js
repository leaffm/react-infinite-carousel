import React, {
  Component,
  PropTypes,
} from 'react';

class InfiniteCarouselDots extends Component {

  render() {
    const dots = [];
    const className = this.props.styles.InfiniteCarouselDots;
    const dotClassName = this.props.styles.InfiniteCarouselDot;
    const dotIconClassName = this.props.styles.InfiniteCarouselDotIcon;
    const activeClass = this.props.styles.InfiniteCarouselDotActiveIcon;

    for (let i = 0; i < this.props.numberOfDots; i += 1) {
      dots.push(
        <li
          className={dotClassName}
          data-index={i}
          key={i + 1}
          onClick={this.props.onClick}
        >
          <i className={`${dotIconClassName} ${i === this.props.activePage ? activeClass : ''}`} />
        </li>,
      );
    }

    return (
      <ul className={className}>
        {dots}
      </ul>
    );
  }
}

InfiniteCarouselDots.propTypes = {
  numberOfDots: PropTypes.number.isRequired,
  activePage: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  styles: PropTypes.shape.isRequired,
};

export default InfiniteCarouselDots;
