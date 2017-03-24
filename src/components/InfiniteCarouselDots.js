import React, {
  Component,
  PropTypes,
} from 'react';

class InfiniteCarouselDots extends Component {

  render() {
    let dots = [];
    for (let i=0; i < this.props.numberOfDots; i++) {
      const className = `infinite-carousel-dot ${i === this.props.activePage ? 'active' : ''}`;
      dots.push(
        <li 
            className={className}
            data-index={i}
            key={i + 1}
            onClick={this.props.onClick}
        >
          <i className='icon'/>
        </li>
        );
    }

    return (
      <ul className='infinite-carousel-dots'>
        {dots}
      </ul>
    );
  }
}

InfiniteCarouselDots.propTypes = {
  numberOfDots: PropTypes.number,
  activePage: PropTypes.number,
  onClick: PropTypes.func
};

export default InfiniteCarouselDots;