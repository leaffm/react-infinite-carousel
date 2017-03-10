import React, {
  Component,
  PropTypes,
} from 'react';

class InfiniteCarouselArrow extends Component {

  render() {
    return (
      <div          
          className='arrow'
          onClick={this.props.onClick}
      >
        <a
          className='icon'
          href='#'
        >
          { this.props.next ? 'Next' : 'Previous' }
          <span className='icon-right'/>
        </a>
      </div>
    );
  }
}

InfiniteCarouselArrow.propTypes = {
  next: PropTypes.bool,
  onClick: PropTypes.func.isRequired
};

InfiniteCarouselArrow.defaultProps = {
  next: true
};

export default InfiniteCarouselArrow;