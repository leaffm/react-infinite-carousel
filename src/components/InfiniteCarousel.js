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

  static propTypes = {
    object: PropTypes.object,
    children: React.PropTypes.oneOfType([
      React.PropTypes.arrayOf(React.PropTypes.node),
      React.PropTypes.node
    ]).isRequired,
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

  static defaultProps = {
    object: null,
    infinite: true,
    lazyLoad: true,
    arrows: true,
    dots: true,
    slidesToShow: 3,
    slidesToScroll: 3,
    slidesSpacing: 10,
    autoCycle: false,
    cycleInterval: 500
  };

  constructor(props) {
    super(props);

    // initial state
    this.state = {
      currentIndex: 0,
      
      childrenCount: 0,
      
      slidesCount: 0,
      slidesWidth: 1,
      slidePages: 1,
      
      frameWidth: 1,
      
      children: {}
    };
  }

  componentWillMount() {
    this.setChildren();
  }

  componentDidMount() {
    this.setDimensions();
  }

  setChildren = () => {
    this.setState({
      children: this.getChildren(this.props.children, this.props.slidesToShow)
    });
  };

  getTrackStyles = () => {
    const trackWidth = (this.state.slidesWidth + (this.props.slidesSpacing * 2)) * (this.state.slidesCount + this.props.slidesToShow * 2);
    const totalSlideWidth = this.state.slidesWidth + (this.props.slidesSpacing * 2);
    const initialTrackPostion = totalSlideWidth * this.props.slidesToShow;
    const trackPosition = initialTrackPostion + (totalSlideWidth * this.state.currentIndex);
    const transition = this.state.animating ? `transform 500ms ease` : '';

    console.log(`animating: ${transition}`);

    return {
      position: 'relative',
      display: 'block',
      width: trackWidth,
      height: 'auto',
      padding: 0,
      transition: transition,
      //-ms-transform: `translate(${-trackInitialPosition}, 0)`;
      //-webkit-transform: `translate(${-trackInitialPosition}, 0)`;
      transform: `translate(${-trackPosition}px, 0px)`,
      boxSizing: 'border-box',
      MozBoxSizing: 'border-box'
    };
  };

  getSlideStyles = () => {
    const slidesWidth = this.state.slidesWidth;

    return {
      position: 'relative',
      float: 'left',
      display: 'block',
      width: slidesWidth,
      height: '100%'
    };
  };

  setDimensions = () => {
    const childrenCount = Children.count(this.props.children);
    const slidesCount = Children.count(this.state.children);
    const frameWidth = getElementWidth(this.refs.frame);
    const slidesWidth = (frameWidth / this.props.slidesToShow) - (this.props.slidesSpacing * 2);
    const slidePages = this.props.children.length > this.props.slidesToShow ? Math.ceil(this.props.children.length / this.props.slidesToShow) : 1;

    this.setState({
      childrenCount,
      slidesCount,
      slidesWidth,
      frameWidth,
      slidePages
    });
  };

  formatChildren = (children) => {
    const self = this;
    return Children.map(children, function(child, index) {
      return <li className='CarouselSlide' style={self.getSlideStyles()} key={index}>{child}</li>;
    });
  };

  getChildren = (children, slidesToShow) => {
    if(!Array.isArray(children)) {
      children = [children];
    }

    if (children.length > slidesToShow) {
      return [...(children.slice(children.length - slidesToShow, children.length)), ...children, ...(children.slice(0, slidesToShow))];
    } else {
      return children;
    }
  };

  getTargetIndex = (index) => {
    let targetIndex = index;
    const childrenReminder = this.state.childrenCount % this.props.slidesToShow;
    if (index < 0) {
      if (this.state.currentIndex === 0) {
        targetIndex = this.state.childrenCount - this.props.slidesToShow;
      } else {
        targetIndex = 0;
      }
    } else if(index >= this.state.childrenCount) {
      if (childrenReminder !== 0) {
        targetIndex = 0;
      } else {
        targetIndex = index - this.state.childrenCount;
      }
    } else if(childrenReminder !== 0 && index === (this.state.childrenCount - childrenReminder)) {
      targetIndex = index - (this.props.slidesToScroll - childrenReminder);
    } else {
      targetIndex = index;
    }

    return targetIndex;
  };

  handleTrack = (targetIndex, currentIndex) => {
    const callback = () => {
      setTimeout(() => {
        this.setState({
          currentIndex: currentIndex,
          animating: false
        });
      }, 500);
    };
    if (targetIndex < 0) {
      // animar hacia el target index y en el callback setear el new index sin animación
      this.setState({
        currentIndex: targetIndex,
        animating: true
      }, callback);
    } else if (targetIndex >= this.props.children.length) {
      // animar hacia el target index y en el callback setear el new index sin animación
      console.log('slide');
      this.setState({
        currentIndex: targetIndex,
        animating: true
      }, callback);
    } else {
      // animar hacia el new index y setear el state
      this.setState({
        currentIndex: currentIndex,
        animating: true
      });
    }
  };

  moveToNext = (event) => {
    event.preventDefault();
    const targetIndex = this.state.currentIndex + this.props.slidesToShow;
    const currentIndex = this.getTargetIndex(targetIndex);
    this.handleTrack(targetIndex, currentIndex);
  };

  moveToPrevious = (event) => {
    event.preventDefault();
    let targetIndex = this.state.currentIndex - this.props.slidesToShow;
    const currentIndex = this.getTargetIndex(targetIndex);
    if (targetIndex < 0 && this.state.currentIndex !== 0) {
      targetIndex = 0;
    }
    this.handleTrack(targetIndex, currentIndex);
  };

  onDotClick = (event) => {
    event.preventDefault();
    var targetIndex = event.target.parentElement.getAttribute('data-index');
    const currentIndex = this.getTargetIndex(targetIndex * this.props.slidesToScroll);
    this.handleTrack(targetIndex * this.props.slidesToScroll, currentIndex);
  };

  render() {
    let prevArrow, nextArrow, dots;

    if (this.props.arrows) {
      prevArrow = (
        <InfiniteCarouselArrow 
          next={false}
          onClick={this.moveToPrevious}
        />
      );

      nextArrow = (
        <InfiniteCarouselArrow 
          onClick={this.moveToNext}
        />
      );
    }

    if (this.props.dots) {
      dots = (
        <InfiniteCarouselDots
          numberOfDots={this.state.slidePages}
          onClick={this.onDotClick}
        />
      );
    }

    const children = this.formatChildren(this.state.children)

    return (
      <div className='Carousel'>
        {prevArrow}
        <div 
          className={'CarouselFrame'}
          ref='frame'
        >
          <ul 
            className={'CarouselTrack'}
            style={this.getTrackStyles()}
          >
            {children}
          </ul>
        </div>
        {nextArrow}
        {dots}
      </div>
    );
  }
}

export default InfiniteCarousel;