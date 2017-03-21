import React, {
  Component,
  PropTypes,
  Children
} from 'react';
import {media} from 'react-responsive-mixin';
import {getElementWidth} from '../common/helpers';
import InfiniteCarouselArrow from './InfiniteCarouselArrow';
import InfiniteCarouselDots from './InfiniteCarouselDots';

import styles from './InfiniteCarousel.css';

class InfiniteCarousel extends Component {

  static propTypes = {
    object: PropTypes.object,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(React.PropTypes.node),
      PropTypes.node
    ]).isRequired,
    lazyLoad: PropTypes.bool,
    swipe: PropTypes.bool,
    arrows: PropTypes.bool,
    dots: PropTypes.bool,
    animationDuration: PropTypes.number,
    slidesToShow: PropTypes.number,
    slidesToScroll: PropTypes.number,
    slidesSpacing: PropTypes.number,
    autoCycle: PropTypes.bool,
    pauseOnHover: PropTypes.bool,
    cycleInterval: PropTypes.number,
    responsive: PropTypes.bool,
    breakpoints: PropTypes.arrayOf(PropTypes.object)
  };

  static defaultProps = {
    object: null,
    lazyLoad: true,
    swipe: true,
    draggable: true,
    arrows: true,
    dots: false,
    animationDuration: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    slidesSpacing: 10,
    autoCycle: false,
    cycleInterval: 5000,
    pauseOnHover: true,
    responsive: true,
    breakpoints: []
  };

  constructor(props) {
    super(props);

    // initial state
    this.state = {
      currentIndex: 0,
      activePage: 0,
      children: [],
      lazyLoadedList: [],
      childrenCount: 0,
      slidesCount: 0,
      slidesWidth: 1,
      slidePages: 1,
      frameWidth: 1,
      settings: {},
      breakpoints: {},
      autoCycleTimer: null,
      dragging: false,
      touchObject: {
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
        length: 0,
        direction: -1
      }
    };
  }

  componentWillMount() {
    this.init();
  }

  componentDidMount() {
    this.setDimensions();

    if (!window) {
      return;
    }
    if (window.addEventListener) {
      window.addEventListener('resize', this.onWindowResized);
    } else {
      window.attachEvent('onresize', this.onWindowResized);
    }

    if (this.props.autoCycle) {
      this.playAutoCycle();
    }
  }

  componentWillUnmount() {
    if (window.addEventListener) {
      window.removeEventListener('resize', this.onWindowResized);
    } else {
      window.detachEvent('onresize', this.onWindowResized);
    }
    if (this.state.autoCycleTimer) {
      clearInterval(this.state.autoCycleTimer);
    }
  }

  init = () => {
    const settings = Object.assign({}, this.defaultProps, this.props);
    const children = this.getChildrenList(this.props.children, this.props.slidesToShow);
    this.setState({
      children,
      settings
    });

    if (this.props.responsive) {
      this.setupBreakpointSettings(this.props.breakpoints);
    }
  };

  onWindowResized = () => {
    this.setDimensions();
  };

  getTrackStyles = () => {
    const settings = this.state.settings;
    const touchObject = this.state.touchObject;

    const trackWidth = (this.state.slidesWidth + (settings.slidesSpacing * 2)) * (this.state.slidesCount + settings.slidesToShow * 2);
    const totalSlideWidth = this.state.slidesWidth + (settings.slidesSpacing * 2);
    const initialTrackPostion = totalSlideWidth * this.props.slidesToShow;
    const transition = this.state.animating ? `transform ${this.props.animationDuration}ms ease` : '';
    const touchOffset = this.props.swipe && touchObject.length ? touchObject.length * touchObject.direction : 0;
    const trackPosition = initialTrackPostion + (totalSlideWidth * this.state.currentIndex) + touchOffset;

    return {
      position: 'relative',
      display: 'block',
      width: trackWidth,
      height: 'auto',
      padding: 0,
      transition: transition,
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
      height: 'auto'
    };
  };

  setupBreakpointSettings = (breakpointsSettings) => {
    const breakpoints =  breakpointsSettings.map(element => element.breakpoint);
    const settings = {};
    breakpointsSettings.forEach(element => {
      settings[element.breakpoint] = element.settings;
    });
    if (breakpoints.length > 0) {
      breakpoints.sort();
      // Register responsive media queries in props
      breakpoints.forEach((element, index) => {
        let query;
        if (index === 0) {
          query = {minWidth: 0, maxWidth: element};
        } else {
          query = {minWidth: breakpoints[index-1], maxWidth: element};
        }
        media(query, () => {
          this.setState({
            settings: Object.assign({}, this.defaultProps, this.props, settings[element])
          });
        });
      });

      // Register media query for full screen. Need to support resize from small to large
      breakpoints.reverse();
      const query = {minWidth: (breakpoints[0] + 1)};
      media(query, () => {
        this.setState({
          settings: Object.assign({}, this.defaultProps, this.props)
        });
      });
    }
  };

  setDimensions = () => {
    const settings = this.state.settings;
    const childrenCount = Children.count(this.props.children);
    const slidesCount = Children.count(this.state.children);
    const frameWidth = getElementWidth(this.refs.frame);
    const slidesWidth = (frameWidth / settings.slidesToShow) - (settings.slidesSpacing * 2);
    const slidePages = this.props.children.length > settings.slidesToShow ? Math.ceil(this.props.children.length / settings.slidesToShow) : 1;
    const lazyLoadedList = this.getLazyLoadedIndexes(this.props.children, this.state.currentIndex);
    const activePage = Math.ceil(this.state.currentIndex / settings.slidesToShow);

    this.setState({
      activePage,
      childrenCount,
      slidesCount,
      slidesWidth,
      frameWidth,
      slidePages,
      lazyLoadedList
    });
  };

  getLazyLoadedIndexes = (children, currentIndex) => {
    let lazyLoadedList = this.state.lazyLoadedList;
    let start, limit;
    const settings = this.state.settings;

    start = children.length + this.props.slidesToShow;
    if (currentIndex === 0 && this.state.lazyLoadedList.indexOf(0) < 0) {
      limit = start + settings.slidesToShow - 1;
      for (let index = start; index <= limit; index++) {
        lazyLoadedList.push(index);
      }
    }

    start = 0;
    if (currentIndex === children.length - settings.slidesToShow && this.state.lazyLoadedList.indexOf(children.length + settings.slidesToShow - 1) < 0) {
      limit = start + settings.slidesToShow - 1;
      for (let index = start; index <= limit; index++) {
        lazyLoadedList.push(index);
      }
    }

    start = currentIndex + this.props.slidesToShow;
    limit = start + (settings.slidesToShow - 1);

    for (let index = start; index <= limit; index++) {
      if (this.state.lazyLoadedList.indexOf(index) < 0) {
        lazyLoadedList.push(index);
      }
    }

    return lazyLoadedList;
  };

  getFormatedChildren = (children, lazyLoadedList) => {
    return React.Children.map(children, (child, index)  => {
      if (!this.state.settings.lazyLoad || lazyLoadedList.indexOf(index) >= 0) {
        return (
          <li
              className={'CarouselSlide'}
              key={index}
              style={this.getSlideStyles()}
          >
          {child}
          </li>
        );
      } else {
        return (
          <li
              className={'CarouselSlide'}
              key={index}
              style={this.getSlideStyles()}
          >
          <img src='data:image/gif;base64,R0lGODlhAQABAIABAEdJRgAAACwAAAAAAQABAAACAkQBAA==' />
          </li>
        );
      }
    });
  };

  getChildrenList = (children, slidesToShow) => {
    if(!Array.isArray(children)) {
      children = [children];
    }

    if (children.length > slidesToShow) {
      return [...(children.slice(children.length - slidesToShow, children.length)), ...children, ...(children.slice(0, slidesToShow))];
    } else {
      return children;
    }
  };

  getTargetIndex = (index, slidesToScroll) => {
    let targetIndex = index;
    const childrenReminder = this.state.childrenCount % slidesToScroll;
    if (index < 0) {
      if (this.state.currentIndex === 0) {
        targetIndex = this.state.childrenCount - slidesToScroll;
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
      targetIndex = index - (slidesToScroll - childrenReminder);
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
          animating: false,
          dragging: false
        });
      }, this.props.animationDuration);
    };

    const stopAnimation = () => {
      setTimeout(() => {
        this.setState({
          animating: false,
          dragging: false
        });
      }, this.props.animationDuration);
    };

    const settings = this.state.settings;
    const activePage = Math.ceil(currentIndex / settings.slidesToShow);
    const lazyLoadedList = this.getLazyLoadedIndexes(this.props.children, currentIndex);

    if (targetIndex < 0) {
      // animar hacia el target index y en el callback setear el new index sin animación
      this.setState({
        currentIndex: targetIndex,
        activePage,
        animating: true,
        lazyLoadedList,
        touchObject : {
          startX: 0,
          startY: 0,
          endX: 0,
          endY: 0,
          length: 0,
          direction: -1
        }
      }, callback);
    } else if (targetIndex >= this.props.children.length) {
      // animar hacia el target index y en el callback setear el new index sin animación
      this.setState({
        currentIndex: targetIndex,
        activePage,
        animating: true,
        lazyLoadedList,
        touchObject : {
          startX: 0,
          startY: 0,
          endX: 0,
          endY: 0,
          length: 0,
          direction: -1
        }
      }, callback);
    } else {
      // animar hacia el new index y setear el state
      this.setState({
        currentIndex: currentIndex,
        activePage,
        animating: true,
        lazyLoadedList,
        dragging: false,
        touchObject : {
          startX: 0,
          startY: 0,
          endX: 0,
          endY: 0,
          length: 0,
          direction: -1
        }
      }, stopAnimation);
    }
  };

  moveToNext = (event) => {
    event.preventDefault();
    if (this.state.animating) {
      return;
    }
    const settings = this.state.settings;
    const targetIndex = this.state.currentIndex + settings.slidesToScroll;
    const currentIndex = this.getTargetIndex(targetIndex, settings.slidesToScroll);
    this.handleTrack(targetIndex, currentIndex);
  };

  moveToPrevious = (event) => {
    event.preventDefault();
    if (this.state.animating) {
      return;
    }
    const settings = this.state.settings;
    let targetIndex = this.state.currentIndex - settings.slidesToScroll;
    const currentIndex = this.getTargetIndex(targetIndex, settings.slidesToScroll);
    if (targetIndex < 0 && this.state.currentIndex !== 0) {
      targetIndex = 0;
    }
    this.handleTrack(targetIndex, currentIndex);
  };

  onDotClick = (event) => {
    event.preventDefault();
    if (this.state.animating) {
      return;
    }
    const settings = this.state.settings;
    const targetIndex = event.target.parentElement.getAttribute('data-index');
    const currentIndex = this.getTargetIndex(targetIndex * settings.slidesToShow, settings.slidesToShow);
    this.handleTrack(targetIndex * settings.slidesToShow, currentIndex);
  };

  autoCycle = () => {
    const settings = this.state.settings;
    const targetIndex = this.state.currentIndex + settings.slidesToScroll;
    const currentIndex = this.getTargetIndex(targetIndex, settings.slidesToScroll);
    this.handleTrack(targetIndex, currentIndex);
  };

  playAutoCycle = () => {
    if (this.props.autoCycle) {
      const autoCycleTimer = setInterval(this.autoCycle, this.props.cycleInterval);
      this.setState({
        autoCycleTimer
      });
    }
  };

  pauseAutoCycle = () => {
    if (this.state.autoCycleTimer) {
      clearInterval(this.state.autoCycleTimer);
      this.setState({
        autoCycleTimer: null
      });
    }
  };

  onMouseEnter = (e) => {
    if (this.props.autoCycle && this.props.pauseOnHover) {
      this.pauseAutoCycle();
    }
  };

  onMouseOver = (e) => {
    if (this.props.autoCycle && this.props.pauseOnHover) {
      this.pauseAutoCycle();
    }
  };

  onMouseLeave = (e) => {
    if (this.props.autoCycle && this.props.pauseOnHover) {
      this.playAutoCycle();
    }
  };

  getSwipeDirection = (x1, x2, y1, y2) => {
    const xDist = x1 - x2;
    const yDist = y1 - y2;

    let swipeAngle = Math.round(Math.atan2(yDist, xDist) * 180 / Math.PI);

    if (swipeAngle < 0) {
      swipeAngle = 360 - Math.abs(swipeAngle);
    }
    if ((swipeAngle <= 45) && (swipeAngle >= 0)) {
      return 1;
    }
    if ((swipeAngle <= 360) && (swipeAngle >= 315)) {
      return 1;
    }
    if ((swipeAngle >= 135) && (swipeAngle <= 225)) {
      return -1;
    }
    return 0;
  };

  onSwipeStart = (e) => {
    if ((this.props.swipe === false) || ('ontouchend' in document && this.props.swipe === false)) {
      return;
    } else if (this.props.draggable === false && e.type.indexOf('mouse') !== -1) {
      return;
    }

    const startX = (e.touches !== undefined) ? e.touches[0].pageX : e.clientX;
    const startY = (e.touches !== undefined) ? e.touches[0].pageY : e.clientY;
    
    this.setState({
      dragging: true,
      //animating: true,
      touchObject: {
        startX,
        startY
      }
    });
  };

  onSwipeMove = (e) => {
    if (!this.state.dragging) {
      e.preventDefault();
      return;
    }
    if (this.state.animating) {
      return;
    }
    const curX = (e.touches !== undefined) ? e.touches[0].pageX : e.clientX;
    const curY = (e.touches !== undefined) ? e.touches[0].pageY : e.clientY;
    const touchObject = this.state.touchObject;
    const direction = this.getSwipeDirection(touchObject.startX, curX, touchObject.startY, curY);

    if (direction !== 0) {
      e.preventDefault();
    }

    const swipeLength = Math.round(Math.sqrt(Math.pow(curX - touchObject.startX, 2)));

    this.setState({
      touchObject : {
        startX: touchObject.startX,
        startY: touchObject.startY,
        endX: curX,
        endY: curY,
        length: swipeLength,
        direction: direction
      }
    });
  };

  onSwipeEnd = (e) => {
    if (this.state.touchObject.length !== 0 && this.state.touchObject.length > this.state.slidesWidth / 2) {
      if (this.state.touchObject.direction === 1) {
        // Next
        const settings = this.state.settings;
        const targetIndex = this.state.currentIndex + settings.slidesToScroll;
        const currentIndex = this.getTargetIndex(targetIndex, settings.slidesToScroll);
        this.handleTrack(targetIndex, currentIndex);
      } else {
        // Previous
        const settings = this.state.settings;
        let targetIndex = this.state.currentIndex - settings.slidesToScroll;
        const currentIndex = this.getTargetIndex(targetIndex, settings.slidesToScroll);
        if (targetIndex < 0 && this.state.currentIndex !== 0) {
          targetIndex = 0;
        }
        this.handleTrack(targetIndex, currentIndex);
      }
    }
  };

  render() {
    let prevArrow, nextArrow, dots;

    if (this.state.settings.arrows) {
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

    if (this.state.settings.dots) {
      dots = (
        <InfiniteCarouselDots
            activePage={this.state.activePage}
            numberOfDots={this.state.slidePages}
            onClick={this.onDotClick}
        />
        );
    }

    const children = this.getFormatedChildren(this.state.children, this.state.lazyLoadedList);

    return (
      <div 
          className='Carousel'
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          onMouseOver={this.onMouseOver}
      >
      {prevArrow}
      <div 
          className={'CarouselFrame'}
          ref='frame'
      >
        <ul 
            className={'CarouselTrack'}
            ref='track'
            style={this.getTrackStyles()}
            onMouseDown={this.onSwipeStart}
            onMouseMove={this.state.dragging ? this.onSwipeMove: null}
            onMouseUp={this.onSwipeEnd}
            onMouseLeave={this.state.dragging ? this.onSwipeEnd: null}
            onTouchStart={this.onSwipeStart}
            onTouchMove={this.state.dragging ? this.onSwipeMove: null}
            onTouchEnd={this.onSwipeEnd}
            onTouchCancel={this.state.dragging ? this.onSwipeEnd: null}
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