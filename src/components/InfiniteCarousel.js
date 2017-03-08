import React, {
  Component,
  PropTypes,
  Children
} from 'react';
import ReactDOM from 'react-dom';
import {getElementWidth} from '../common/helpers';

import InfiniteCarouselArrow from './InfiniteCarouselArrow';
import InfiniteCarouselDots from './InfiniteCarouselDots';

import styles from './InfiniteCarousel.css';

class InfiniteCarousel extends Component {

  constructor(props) {
    super(props);

    // initial state
    this.state = {
      currentSlide: 0,
      slideCount: 1,
      slidesWidth: 1,
      frameWidth: 1,
      trackWidth: 1
    }
  }

  componentDidMount() {
    const childrenCount = Children.count(this.props.children);
    this.state.frameWidth = getElementWidth(this.refs.frame);
    console.log(this.state.frameWidth);
    this.state.slidesWidth = (this.state.frameWidth / this.props.slidesToShow) - (this.props.slidesSpacing * 2);
    console.log(this.state.slidesWidth);
    this.state.trackWidth = (this.state.slidesWidth + (this.props.slidesSpacing * 2)) * childrenCount;
    console.log(this.state.trackWidth);

  }

  render() {
    let prevArrow, nextArrow, dots;

    if (this.props.arrows) {
      prevArrow = (<InfiniteCarouselArrow next={false} />);
      nextArrow = (<InfiniteCarouselArrow />);
    }

    if (this.props.dots) {
      dots = (<InfiniteCarouselDots />);
    }

    return (
      <div>
        {prevArrow}
        <div 
          className={'CarouselFrame'}
          ref='frame'
        >
          <div className={'CarouselTrack'}>
            {this.props.children}
          </div>
        </div>
        {nextArrow}
        {dots}
      </div>
    );
  }
}

InfiniteCarousel.propTypes = {
  object: PropTypes.object,
  infinite: PropTypes.bool,
  lazyLoad: PropTypes.bool,
  arrows: PropTypes.bool,
  dots: PropTypes.bool,
  slidesToShow: PropTypes.number,
  slidesToScroll: PropTypes.number,
  slidesSpacing: PropTypes.number,
  autoCycle: PropTypes.bool,
  cycleInterval: PropTypes.number
};

InfiniteCarousel.defaultProps = {
  object: null,
  infinite: true,
  lazyLoad: true,
  arrows: true,
  dots: true,
  slidesToShow: 3,
  slidesToScroll: 1,
  slidesSpacing: 10,
  autoCycle: false,
  cycleInterval: 500,
};

export default InfiniteCarousel;