import React, {
  Component,
  PropTypes,
  Children,
} from 'react';
import { media } from 'react-responsive-mixin';
import {
  getElementWidth,
  getSwipeDirection,
  isTouchDevice,
  sortNumber,
  getScreenWidth,
} from './common/helpers';
import InfiniteCarouselArrow from './components/InfiniteCarouselArrow';
import InfiniteCarouselDots from './components/InfiniteCarouselDots';

import styles from './components/InfiniteCarousel.css';

class InfiniteCarousel extends Component {

  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(React.PropTypes.node),
      PropTypes.node,
    ]).isRequired,
    arrows: PropTypes.bool,
    dots: PropTypes.bool,
    lazyLoad: PropTypes.bool,
    swipe: PropTypes.bool,
    animationDuration: PropTypes.number,
    slidesToShow: PropTypes.number,
    slidesToScroll: PropTypes.number,
    slidesSpacing: PropTypes.number,
    autoCycle: PropTypes.bool,
    cycleInterval: PropTypes.number,
    pauseOnHover: PropTypes.bool,
    responsive: PropTypes.bool,
    breakpoints: PropTypes.arrayOf(PropTypes.object),
    placeholderImageSrc: PropTypes.string,
    nextArrow: PropTypes.element,
    prevArrow: PropTypes.element,
    scrollOnDevice: PropTypes.bool,
    showSides: PropTypes.bool,
    sidesOpacity: PropTypes.number,
    sideSize: PropTypes.number,
    incrementalSideSize: PropTypes.bool,
  };

  static defaultProps = {
    children: [],
    arrows: true,
    dots: false,
    lazyLoad: false,
    swipe: true,
    draggable: false,
    animationDuration: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    slidesSpacing: 10,
    autoCycle: false,
    cycleInterval: 5000,
    pauseOnHover: true,
    responsive: true,
    breakpoints: [],
    placeholderImageSrc: '',
    nextArrow: null,
    prevArrow: null,
    scrollOnDevice: false,
    showSides: false,
    sidesOpacity: 1,
    sideSize: .5,
    incrementalSideSize: false,
  };

  constructor(props) {
    super(props);

    // initial state
    this.state = {
      currentIndex: 0,
      activePage: 0,
      children: [],
      lazyLoadedList: [],
      visibleSlideList: [],
      childrenCount: 0,
      slidesCount: 0,
      slidesWidth: 1,
      slidePages: 1,
      singlePage: true,
      frameWidth: 1,
      settings: {},
      breakpoints: {},
      autoCycleTimer: null,
      resizeTimer: null,
      dragging: false,
      touchObject: {
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
        length: 0,
        direction: -1,
      },
      scrollOnDeviceProps: {
        arrows: false,
        dots: false,
        lazyLoad: false,
        autoCycle: false,
      },
      lowerBreakpoint: undefined,
      higherBreakpoint: undefined,
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

    if (this.state.settings.autoCycle) {
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

  setupBreakpointSettings = (breakpointsSettings) => {
    const breakpoints = breakpointsSettings.map(element => element.breakpoint);
    const settings = {};
    breakpointsSettings.forEach((element) => { settings[element.breakpoint] = element.settings; });
    if (breakpoints.length > 0) {
      breakpoints.sort(sortNumber);
      // Register responsive media queries in settings
      breakpoints.forEach((element, index) => {
        let lowerBreakpoint;
        let higherBreakpoint;
        if (index === 0) {
          lowerBreakpoint = 0;
          higherBreakpoint = element;
        } else {
          lowerBreakpoint = breakpoints[index - 1];
          higherBreakpoint = element;
        }

        const query = { minWidth: lowerBreakpoint, maxWidth: higherBreakpoint };

        media(query, () => {
          const newSettings = Object.assign(
            {},
            this.defaultProps,
            this.props,
            settings[element],
            scrollOnDeviceProps,
          );
          const scrollOnDevice = this.props.scrollOnDevice && isTouchDevice();
          const scrollOnDeviceProps = scrollOnDevice ? this.state.scrollOnDeviceProps : {};
          const children = this.getChildrenList(this.props.children, newSettings.slidesToShow);
          this.setState({
            settings: newSettings,
            children,
            lowerBreakpoint,
            higherBreakpoint,
          }, this.setDimensions);
        });
      });

      // Resize from small to large
      breakpoints.reverse();
      const query = { minWidth: (breakpoints[0] + 1) };
      media(query, () => {
        const newSettings = Object.assign({}, this.defaultProps, this.props, scrollOnDeviceProps);
        const scrollOnDevice = this.props.scrollOnDevice && isTouchDevice();
        const scrollOnDeviceProps = scrollOnDevice ? this.state.scrollOnDeviceProps : {};
        const children = this.getChildrenList(this.props.children, newSettings.slidesToShow);
        this.setState({
          settings: newSettings,
          children,
          lowerBreakpoint: undefined,
          higherBreakpoint: undefined,
        }, this.setDimensions);
      });
    }
  };

  getSideSize = (lowerBreakpoint, higherBreakpoint, currentScreenWidth) => {
    const incrementalSideSize = this.state.settings.incrementalSideSize;

    if (lowerBreakpoint !== undefined && higherBreakpoint !== undefined && incrementalSideSize) {
      const maxPoint = higherBreakpoint - lowerBreakpoint;
      const currentPoint = currentScreenWidth - lowerBreakpoint;
      const sideSizePercetange = (currentPoint * 50) / maxPoint;

      return sideSizePercetange / 100;
    }

    return this.state.settings.sideSize;
  };

  setDimensions = () => {
    const settings = this.state.settings;
    const { lowerBreakpoint, higherBreakpoint } = this.state;
    const scrollOnDevice = this.props.scrollOnDevice && isTouchDevice();
    const currentScreenWidth = getScreenWidth();
    const sideSize = this.getSideSize(lowerBreakpoint, higherBreakpoint, currentScreenWidth);
    const childrenCount = Children.count(this.props.children);
    const slidesCount =  scrollOnDevice ? childrenCount : Children.count(this.state.children);
    const frameWidth = getElementWidth(this.refs.frame);
    const slidesToShow = this.props.showSides ? settings.slidesToShow + (sideSize * 2) : settings.slidesToShow;
    const slidesWidth = (frameWidth / slidesToShow) - (settings.slidesSpacing * 2);
    const childrenLength = this.props.children.length;
    const activePage = Math.ceil(this.state.currentIndex / settings.slidesToShow);
    const countPages = Math.ceil(childrenLength / settings.slidesToShow);
    const slidePages = childrenLength > settings.slidesToShow ? countPages : 1;
    const singlePage = slidePages > 1 ? false : true;

    let lazyLoadedList;
    let visibleSlideList;
    if (singlePage || scrollOnDevice) {
      lazyLoadedList = this.state.children.map((child, index) => { return index; });
      visibleSlideList = this.state.children.map((child, index) => { return index; });
    } else {
      lazyLoadedList = this.getLazyLoadedIndexes(this.props.children, this.state.currentIndex);
      visibleSlideList = this.getVisibleIndexes(this.props.children, this.state.currentIndex);
    }

    this.setState({
      activePage,
      childrenCount,
      slidesCount,
      slidesWidth,
      frameWidth,
      slidePages,
      singlePage,
      lazyLoadedList,
      visibleSlideList,
      sideSize,
    });
  };

  getVisibleIndexes = (children, currentIndex) => {
    const visibleIndexes = [];
    let start;
    let limit;
    const settings = this.state.settings;
    const showSidesSlide = settings.showSides? 1 : 0;

    start = children.length + settings.slidesToShow + showSidesSlide;
    if (currentIndex === 0) {
      limit = (start + settings.slidesToShow) - 1;
      for (let index = start; index <= limit; index += 1) {
        visibleIndexes.push(index);
      }
    }

    start = 0 + showSidesSlide;
    const isAtLastPage = currentIndex === children.length - settings.slidesToShow;

    if (isAtLastPage) {
      limit = (start + settings.slidesToShow) - 1;
      for (let index = start; index <= limit; index += 1) {
        visibleIndexes.push(index);
      }
    }

    start = currentIndex + this.state.settings.slidesToShow + showSidesSlide;
    limit = start + (this.state.settings.slidesToShow - 1);
    for (let index = start; index <= limit; index += 1) {
      visibleIndexes.push(index);
    }

    return visibleIndexes;
  };

  getLazyLoadedIndexes = (children, currentIndex) => {
    const lazyLoadedList = this.state.lazyLoadedList;
    let start;
    let limit;
    const settings = this.state.settings;
    const showSidesSlide = settings.showSides? 1 : 0;

    start = children.length + settings.slidesToShow + showSidesSlide;
    if (currentIndex === 0 && this.state.lazyLoadedList.indexOf(start) < 0) {
      limit = (start + settings.slidesToShow + showSidesSlide) - 1;
      for (let index = start; index <= limit; index += 1) {
        lazyLoadedList.push(index);
      }
    }

    start = 0;
    const isAtLastPage = currentIndex === children.length - settings.slidesToShow;
    const notLazyLoaded = lazyLoadedList.indexOf(start) < 0;

    if (isAtLastPage && notLazyLoaded) {
      limit = (start + settings.slidesToShow + showSidesSlide) - 1;
      for (let index = start; index <= limit; index += 1) {
        lazyLoadedList.push(index);
      }
    }

    start = currentIndex + settings.slidesToShow + showSidesSlide;
    limit = start + (settings.slidesToShow - 1);

    if (this.state.settings.showSides) {
      start -= 1;
      limit += 1;
    }

    for (let index = start; index <= limit; index += 1) {
      if (this.state.lazyLoadedList.indexOf(index) < 0) {
        lazyLoadedList.push(index);
      }
    }

    return lazyLoadedList;
  };

  getChildrenList = (children, slidesToShow) => {
    if (!Array.isArray(children)) {
      return [children];
    }

    if (this.props.scrollOnDevice && isTouchDevice()) {   
      return children;
    }

    if (children.length > slidesToShow && this.props.showSides) {
      return [
        ...(children.slice(children.length - slidesToShow - 1, children.length)),
        ...children,
        ...(children.slice(0, slidesToShow + 1)),
      ];
    }

    if (children.length > slidesToShow) {
      return [
        ...(children.slice(children.length - slidesToShow, children.length)),
        ...children,
        ...(children.slice(0, slidesToShow)),
      ];
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
    } else if (index >= this.state.childrenCount) {
      if (childrenReminder !== 0) {
        targetIndex = 0;
      } else {
        targetIndex = index - this.state.childrenCount;
      }
    } else if (childrenReminder !== 0 && index === (this.state.childrenCount - childrenReminder)) {
      targetIndex = index - (slidesToScroll - childrenReminder);
    } else {
      targetIndex = index;
    }

    return targetIndex;
  };

  handleTrack = (targetIndex, currentIndex) => {
    const settings = this.state.settings;
    const activePage = Math.ceil(currentIndex / settings.slidesToShow);
    const lazyLoadedList = this.getLazyLoadedIndexes(this.props.children, currentIndex);
    const visibleSlideList = this.getVisibleIndexes(this.props.children, currentIndex);

    const callback = () => {
      setTimeout(() => {
        this.setState({
          currentIndex,
          animating: false,
          dragging: false,
        });
      }, settings.animationDuration);
    };

    const stopAnimation = () => {
      setTimeout(() => {
        this.setState({
          animating: false,
          dragging: false,
        });
      }, settings.animationDuration);
    };

    if (targetIndex < 0) {
      this.setState({
        currentIndex: targetIndex,
        activePage,
        animating: true,
        lazyLoadedList,
        visibleSlideList,
        touchObject: {
          startX: 0,
          startY: 0,
          endX: 0,
          endY: 0,
          length: 0,
          direction: -1,
        },
      }, callback);
    } else if (targetIndex >= this.props.children.length) {
      this.setState({
        currentIndex: targetIndex,
        activePage,
        animating: true,
        lazyLoadedList,
        visibleSlideList,
        touchObject: {
          startX: 0,
          startY: 0,
          endX: 0,
          endY: 0,
          length: 0,
          direction: -1,
        },
      }, callback);
    } else {
      this.setState({
        currentIndex,
        activePage,
        animating: true,
        lazyLoadedList,
        visibleSlideList,
        dragging: false,
        touchObject: {
          startX: 0,
          startY: 0,
          endX: 0,
          endY: 0,
          length: 0,
          direction: -1,
        },
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
    const slidesToShow = settings.slidesToShow;
    const targetIndex = event.target.parentElement.getAttribute('data-index');
    const currentIndex = this.getTargetIndex(targetIndex * slidesToShow, slidesToShow);
    this.handleTrack(targetIndex * slidesToShow, currentIndex);
  };

  onWindowResized = () => {
    this.setDimensions();
  };

  autoCycle = () => {
    const settings = this.state.settings;
    const targetIndex = this.state.currentIndex + settings.slidesToScroll;
    const currentIndex = this.getTargetIndex(targetIndex, settings.slidesToScroll);
    this.handleTrack(targetIndex, currentIndex);
  };

  playAutoCycle = () => {
    if (this.state.settings.autoCycle) {
      const autoCycleTimer = setInterval(this.autoCycle, this.state.settings.cycleInterval);
      this.setState({
        autoCycleTimer,
      });
    }
  };

  pauseAutoCycle = () => {
    if (this.state.autoCycleTimer) {
      clearInterval(this.state.autoCycleTimer);
      this.setState({
        autoCycleTimer: null,
      });
    }
  };

  onMouseEnter = () => {
    if (this.state.settings.autoCycle && this.state.settings.pauseOnHover) {
      this.pauseAutoCycle();
    }
  };

  onMouseOver = () => {
    if (this.state.settings.autoCycle && this.state.settings.pauseOnHover) {
      this.pauseAutoCycle();
    }
  };

  onMouseLeave = () => {
    if (this.state.settings.autoCycle && this.state.settings.pauseOnHover) {
      this.playAutoCycle();
    }
  };

  onSwipeStart = (e) => {
    if ((this.state.settings.swipe === false) || ('ontouchend' in document && this.state.settings.swipe === false)) {
      return;
    } else if (this.state.settings.draggable === false && e.type.indexOf('mouse') !== -1) {
      return;
    }

    const startX = (e.touches !== undefined) ? e.touches[0].pageX : e.clientX;
    const startY = (e.touches !== undefined) ? e.touches[0].pageY : e.clientY;

    this.setState({
      dragging: true,
      touchObject: {
        startX,
        startY,
      },
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
    const direction = getSwipeDirection(touchObject.startX, curX, touchObject.startY, curY);

    if (direction !== 0) {
      e.preventDefault();
    }

    const swipeLength = Math.round(Math.sqrt((curX - touchObject.startX) ** 2));

    this.setState({
      touchObject: {
        startX: touchObject.startX,
        startY: touchObject.startY,
        endX: curX,
        endY: curY,
        length: swipeLength,
        direction,
      },
    });
  };

  onSwipeEnd = () => {
    const swipeLength = this.state.touchObject.length;
    if (swipeLength !== 0 && swipeLength > this.state.slidesWidth / 2) {
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
    } else {
      const callback = () => {
        setTimeout(() => {
          this.setState({
            animating: false,
            dragging: false,
            touchObject: {
              startX: 0,
              startY: 0,
              endX: 0,
              endY: 0,
              length: 0,
              direction: -1,
            },
          });
        }, this.state.settings.animationDuration);
      };

      this.setState({
        animating: true,
        touchObject: {
          direction: this.state.touchObject.direction * -1,
        },
      }, callback);
    }
  };

  getTrackStyles = () => {
    const settings = this.state.settings;
    const touchObject = this.state.touchObject;
    let trackWidth = (this.state.slidesWidth + (settings.slidesSpacing * 2));
    trackWidth *= (this.state.slidesCount + (settings.slidesToShow * 2));
    const totalSlideWidth = this.state.slidesWidth + (settings.slidesSpacing * 2);
    const showSidesSlide = settings.showSides? 1 : 0;
    const initialTrackPostion = totalSlideWidth * (settings.slidesToShow + showSidesSlide);
    const transition = this.state.animating ? `transform ${settings.animationDuration}ms ease` : '';
    const hasTouchOffset = settings.swipe && touchObject.length;
    const touchOffset = hasTouchOffset ? touchObject.length * touchObject.direction : 0;
    const slidePosition = totalSlideWidth * this.state.currentIndex;
    let trackPosition = initialTrackPostion + slidePosition + touchOffset;

    if (settings.showSides) {
      const sideWidth = totalSlideWidth * this.state.sideSize;
      trackPosition -= sideWidth;
    }

    return {
      position: 'relative',
      display: 'block',
      width: !this.state.singlePage ? trackWidth : '100%',
      height: 'auto',
      padding: 0,
      transition,
      transform: !this.state.singlePage ? `translate(${-trackPosition}px, 0px)` : 'none',
      boxSizing: 'border-box',
      MozBoxSizing: 'border-box',
    };
  };

  getScrollTrackStyles = () => {
    return {
      clear: 'both',
      position: 'relative',
      display: 'block',
      width: '100%',
      height: 'auto',
      padding: 0,
      boxSizing: 'border-box',
      MozBoxSizing: 'border-box',
    };
  };

  getSlideStyles = (isVisible) => {
    const slidesWidth = this.state.slidesWidth;
    const isScrollTouch = this.props.scrollOnDevice && isTouchDevice();
    const float = isScrollTouch ? 'none' : 'left';
    const display = 'inline-block';
    const opacity = isVisible ? '1' : this.state.settings.sidesOpacity;

    return {
      position: 'relative',
      float: float,
      display: display,
      width: slidesWidth,
      height: 'auto',
      margin: `0 ${this.state.settings.slidesSpacing}px`,
      opacity,
    };
  };

  getFormatedChildren = (children, lazyLoadedList, visibleSlideList) => {
    return React.Children.map(children, (child, index) => {
      const settings = this.state.settings;
      const isVisible = visibleSlideList.indexOf(index) >= 0;

      if (!settings.lazyLoad || lazyLoadedList.indexOf(index) >= 0) {
        return (
          <li
            className={styles.InfiniteCarouselSlide}
            key={index}
            style={this.getSlideStyles(isVisible)}
          >
            {child}
          </li>
        );
      } else {
        return (
          <li
            className={styles.InfiniteCarouselSlide}
            key={index}
            style={this.getSlideStyles(isVisible)}
          >
            <img src={settings.placeholderImageSrc} />
          </li>
        );
      }
    });
  };

  init = () => {
    const children = this.getChildrenList(this.props.children, this.props.slidesToShow);
    let settings;
    if (this.props.scrollOnDevice && isTouchDevice()) {
      settings = Object.assign({}, this.defaultProps, this.props, this.state.scrollOnDeviceProps);
    } else {
      settings = Object.assign({}, this.defaultProps, this.props);
    }

    this.setState({
      children,
      settings,
    });

    if (this.props.responsive) {
      this.setupBreakpointSettings(this.props.breakpoints);
    }
  };

  render () {
    const scrollOnDevice = this.props.scrollOnDevice && isTouchDevice();
    const settings = this.state.settings;
    let prevArrow;
    let nextArrow;
    let dots;

    if (settings.arrows && !this.state.singlePage && !scrollOnDevice) {
      if (settings.prevArrow == null) {
        prevArrow = (
          <InfiniteCarouselArrow
            next={false}
            onClick={this.moveToPrevious}
            styles={styles}
          />
        );
      } else {
        const prevArrowProps = {
          onClick: this.moveToPrevious,
        };
        prevArrow = React.cloneElement(settings.prevArrow, prevArrowProps);
      }

      if (settings.nextArrow == null) {
        nextArrow = (
          <InfiniteCarouselArrow
            onClick={this.moveToNext}
            styles={styles}
          />
        );
      } else {
        const nextArrowProps = {
          onClick: this.moveToNext,
        };
        nextArrow = React.cloneElement(settings.nextArrow, nextArrowProps);
      }
    }

    if (settings.dots && !this.state.singlePage && !scrollOnDevice) {
      dots = (
        <InfiniteCarouselDots
          activePage={this.state.activePage}
          numberOfDots={this.state.slidePages}
          onClick={this.onDotClick}
          styles={styles}
        />
      );
    }

    const children = this.getFormatedChildren(this.state.children, this.state.lazyLoadedList, this.state.visibleSlideList);
    let trackStyles, trackClassName;

    if (this.props.scrollOnDevice && isTouchDevice()) {
      trackStyles = this.getScrollTrackStyles();
      trackClassName = styles.InfiniteCarouselScrollTrack;
    } else {
      trackStyles = this.getTrackStyles();
      trackClassName = '';
    }

    const disableSwipeEvents = this.props.scrollOnDevice && isTouchDevice();
    

    return (
      <div
        className={styles.InfiniteCarousel}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onMouseOver={this.onMouseOver}
      >
        {prevArrow}
        <div
          className={styles.InfiniteCarouselFrame}
          ref='frame'
        >
          <ul
            className={trackClassName}
            ref='track'
            onMouseDown={!disableSwipeEvents ? this.onSwipeStart : null}
            onMouseLeave={this.state.dragging || !disableSwipeEvents ? this.onSwipeEnd : null}
            onMouseMove={this.state.dragging || !disableSwipeEvents ? this.onSwipeMove : null}
            onMouseUp={!disableSwipeEvents ? this.onSwipeEnd : null}
            onTouchCancel={this.state.dragging || !disableSwipeEvents ? this.onSwipeEnd : null}
            onTouchEnd={!disableSwipeEvents ? this.onSwipeEnd : null}
            onTouchMove={this.state.dragging || !disableSwipeEvents ? this.onSwipeMove : null}
            onTouchStart={!disableSwipeEvents ? this.onSwipeStart : null}
            style={trackStyles}
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
