import React, {
  Component,
  PropTypes,
} from 'react';

class InfiniteCarouselArrow extends Component {
  render() {
    const className = `infinite-carousel-arrow ${ this.props.next ? 'prev' : 'next' }`;
    return (
      <div          
          className={className}
          onClick={this.props.onClick}
      >
        <a href='#'><i className='icon'/></a>
      </div>
    );
  }
}

InfiniteCarouselArrow.propTypes = {
  className: PropTypes.string,
  next: PropTypes.bool,
  onClick: PropTypes.func.isRequired
};

InfiniteCarouselArrow.defaultProps = {
  next: true
};

export default InfiniteCarouselArrow;