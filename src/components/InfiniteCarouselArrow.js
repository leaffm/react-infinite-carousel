import React, {
  Component,
} from 'react';
import PropTypes from 'prop-types';

class InfiniteCarouselArrow extends Component {
  render() {
    const arrowClassName = this.props.styles.InfiniteCarouselArrow;
    let typeClassName;
    if (this.props.next) {
      typeClassName = this.props.styles.InfiniteCarouselArrowNext;
    } else {
      typeClassName = this.props.styles.InfiniteCarouselArrowPrev;
    }

    const iconClassName = this.props.styles.InfiniteCarouselArrowIcon;
    let iconTypeClassName;
    if (this.props.next) {
      iconTypeClassName = this.props.styles.InfiniteCarouselArrowNextIcon;
    } else {
      iconTypeClassName = this.props.styles.InfiniteCarouselArrowPrevIcon;
    }
    return (
      <button
        className={`${arrowClassName} ${typeClassName}`}
        onClick={this.props.onClick}
      >
        <i className={`${iconClassName} ${iconTypeClassName}`} />
      </button>
    );
  }
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
