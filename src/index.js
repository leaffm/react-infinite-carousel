import React, {
  Component,
  Children,
} from 'react';
import PropTypes from 'prop-types';
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
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]),
    arrows: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    dots: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    paging: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    pagingSeparator: PropTypes.string,
    lazyLoad: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    swipe: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    draggable: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    animationDuration: PropTypes.number, // eslint-disable-line react/no-unused-prop-types
    slidesToShow: PropTypes.number, // eslint-disable-line react/no-unused-prop-types
    slidesToScroll: PropTypes.number, // eslint-disable-line react/no-unused-prop-types
    slidesSpacing: PropTypes.number, // eslint-disable-line react/no-unused-prop-types
    autoCycle: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    cycleInterval: PropTypes.number, // eslint-disable-line react/no-unused-prop-types
    pauseOnHover: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    responsive: PropTypes.bool,
    breakpoints: PropTypes.arrayOf(PropTypes.object),
    placeholderImageSrc: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
    nextArrow: PropTypes.element, // eslint-disable-line react/no-unused-prop-types
    prevArrow: PropTypes.element, // eslint-disable-line react/no-unused-prop-types
    scrollOnDevice: PropTypes.bool,
    showSides: PropTypes.bool,
    sidesOpacity: PropTypes.number, // eslint-disable-line react/no-unused-prop-types
    sideSize: PropTypes.number, // eslint-disable-line react/no-unused-prop-types
    incrementalSides: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types,
    onSlideChange: PropTypes.func,
    onNextClick: PropTypes.func,
    onPreviousClick: PropTypes.func,
  };
  static defaultProps = {
    children: [],
    arrows: true,
    dots: false,
    paging: false,
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
    pagingSeparator: '/',
    nextArrow: null,
    prevArrow: null,
    scrollOnDevice: false,
    showSides: false,
    sidesOpacity: 1,
    sideSize: 0.5,
    incrementalSides: false,
    onSlideChange: undefined,
    onNextClick: undefined,
    onPreviousClick: undefined,
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
      settings: {},
      autoCycleTimer: null,
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

  componentDidMount() {
    this.init();
    this.setDimensions();

    if (!window) {
      return;
    }

    if (window.addEventListener) {
      window.addEventListener('resize', this.onWindowResized);
    } else {
      window.attachEvent('onresize', this.onWindowResized);
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
          higherBreakpoint = element - 1;
        } else {
          lowerBreakpoint = breakpoints[index - 1];
          higherBreakpoint = element - 1;
        }

        // assign breakpoints properties
        const query = { minWidth: lowerBreakpoint, maxWidth: higherBreakpoint };

        media(query, () => {
          const scrollOnDevice = this.props.scrollOnDevice && isTouchDevice();
          const scrollOnDeviceProps = scrollOnDevice ? this.state.scrollOnDeviceProps : {};
          const newSettings = Object.assign(
            {},
            this.defaultProps,
            this.props,
            settings[element],
            scrollOnDeviceProps,
          );
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
      const query = { minWidth: breakpoints[0] };
      media(query, () => {
        const scrollOnDevice = this.props.scrollOnDevice && isTouchDevice();
        const scrollOnDeviceProps = scrollOnDevice ? this.state.scrollOnDeviceProps : {};
        const newSettings = Object.assign({}, this.defaultProps, this.props, scrollOnDeviceProps);
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
    const { incrementalSides } = this.state.settings;

    if (lowerBreakpoint !== undefined && higherBreakpoint !== undefined && incrementalSides) {
      const maxPoint = higherBreakpoint - lowerBreakpoint;
      const currentPoint = currentScreenWidth - lowerBreakpoint;
      const sideSizePercetange = (currentPoint * 50) / maxPoint;

      return sideSizePercetange / 100;
    }

    return this.state.settings.sideSize;
  };

  setDimensions = () => {
    const { settings, lowerBreakpoint, higherBreakpoint } = this.state;
    const scrollOnDevice = this.props.scrollOnDevice && isTouchDevice();
    const currentScreenWidth = getScreenWidth();
    const sideSize = this.getSideSize(lowerBreakpoint, higherBreakpoint, currentScreenWidth);
    const childrenCount = Children.count(this.props.children);
    const slidesCount = scrollOnDevice ? childrenCount : Children.count(this.state.children);
    const frameWidth = getElementWidth(this.frame);
    const { showSides } = this.props;
    const slidesToShow = showSides ? settings.slidesToShow + (sideSize * 2) : settings.slidesToShow;
    const slidesWidth = (frameWidth / slidesToShow) - (settings.slidesSpacing * 2);
    const childrenLength = this.props.children.length;
    const activePage = Math.ceil(this.state.currentIndex / settings.slidesToShow);
    const countPages = Math.ceil(childrenLength / settings.slidesToShow);
    const slidePages = childrenLength > settings.slidesToShow ? countPages : 1;
    const singlePage = slidePages <= 1;

    let lazyLoadedList;
    let visibleSlideList;
    if (singlePage || scrollOnDevice) {
      lazyLoadedList = this.state.children.map((child, index) => index);
      visibleSlideList = this.state.children.map((child, index) => index);
    } else {
      lazyLoadedList = this.getLazyLoadedIndexes(this.props.children, this.state.currentIndex);
      visibleSlideList = this.getVisibleIndexes(this.props.children, this.state.currentIndex);
    }

    this.setState({
      activePage,
      childrenCount,
      slidesCount,
      slidesWidth,
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
    const { settings } = this.state;
    const showSidesSlide = settings.showSides ? 1 : 0;

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
    const { lazyLoadedList } = this.state;
    let start;
    let limit;
    const { settings } = this.state;
    const showSidesSlide = settings.showSides ? 1 : 0;

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
    }

    return children;
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

  onDotClick = (event) => {
    event.preventDefault();
    if (this.state.animating) {
      return;
    }
    if (this.state.settings.autoCycle && this.state.autoCycleTimer) {
      clearInterval(this.state.autoCycleTimer);
      this.setState({
        autoCycleTimer: null,
      });
    }
    const { settings } = this.state;
    const { slidesToShow } = settings;
    const targetIndex = event.target.parentElement.getAttribute('data-index');
    const currentIndex = this.getTargetIndex(targetIndex * slidesToShow, slidesToShow);
    this.handleTrack(targetIndex * slidesToShow, currentIndex);
    if (this.state.settings.autoCycle) {
      this.playAutoCycle();
    }
  };

  onWindowResized = () => {
    this.setDimensions();
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
    const { touchObject } = this.state;
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
      if (this.state.settings.autoCycle && this.state.autoCycleTimer) {
        clearInterval(this.state.autoCycleTimer);
        this.setState({
          autoCycleTimer: null,
        });
      }

      const { settings } = this.state;
      let targetIndex;
      let currentIndex;
      if (this.state.touchObject.direction === 1) {
        // Next
        targetIndex = this.state.currentIndex + settings.slidesToScroll;
        currentIndex = this.getTargetIndex(targetIndex, settings.slidesToScroll);
      } else {
        // Previous
        targetIndex = this.state.currentIndex - settings.slidesToScroll;
        currentIndex = this.getTargetIndex(targetIndex, settings.slidesToScroll);
        if (targetIndex < 0 && this.state.currentIndex !== 0) {
          targetIndex = 0;
        }
      }
      this.handleTrack(targetIndex, currentIndex);

      if (this.state.settings.autoCycle) {
        this.playAutoCycle();
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
    const { settings } = this.state;
    const { touchObject } = this.state;
    let trackWidth = (this.state.slidesWidth + (settings.slidesSpacing * 2));
    trackWidth *= (this.state.slidesCount + (settings.slidesToShow * 2));
    const totalSlideWidth = this.state.slidesWidth + (settings.slidesSpacing * 2);
    const showSidesSlide = settings.showSides ? 1 : 0;
    const initialTrackPostion = totalSlideWidth * (settings.slidesToShow + showSidesSlide);
    const transition = this.state.animating ? `transform ${settings.animationDuration}ms ease` : '';
    const hasTouchOffset = settings.swipe && touchObject.length;
    const touchOffset = hasTouchOffset ? touchObject.length * touchObject.direction : 0;
    const slidePosition = totalSlideWidth * this.state.currentIndex;
    let trackPosition = initialTrackPostion + slidePosition + touchOffset;
    const sideWidth = totalSlideWidth * this.state.sideSize;

    if (settings.showSides) {
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
      marginLeft: this.state.singlePage && settings.showSides ? `${sideWidth}px` : '0px',
    };
  };

  getScrollTrackStyles = {
    clear: 'both',
    position: 'relative',
    display: 'block',
    width: '100%',
    height: 'auto',
    padding: 0,
    boxSizing: 'border-box',
    MozBoxSizing: 'border-box',
  };

  getSlideStyles = (isVisible) => {
    const { slidesWidth } = this.state;
    const isScrollTouch = this.props.scrollOnDevice && isTouchDevice();
    const float = isScrollTouch ? 'none' : 'left';
    const display = 'inline-block';
    const opacity = isVisible ? '1' : this.state.settings.sidesOpacity;

    return {
      position: 'relative',
      float,
      display,
      width: !Number.isNaN(slidesWidth) ? slidesWidth : 1,
      height: 'auto',
      margin: `0 ${this.state.settings.slidesSpacing}px`,
      opacity,
    };
  };

  getFormatedChildren = (children, lazyLoadedList, visibleSlideList) =>
    Children.map(children, (child, index) => {
      const { settings } = this.state;
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
      }
      return (
        <li
          className={styles.InfiniteCarouselSlide}
          key={index}
          style={this.getSlideStyles(isVisible)}
        >
          <img alt='placeholder' src={settings.placeholderImageSrc} />
        </li>
      );
    });

  autoCycle = () => {
    const { settings } = this.state;
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

  handleTrack = (targetIndex, currentIndex) => {
    const { settings } = this.state;
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

    if (this.props.onSlideChange) {
      this.props.onSlideChange(activePage);
    }
  };

  moveToNext = (event) => {
    event.preventDefault();
    if (this.props.onNextClick) {
      this.props.onNextClick(event);
    }
    if (this.state.animating) {
      return;
    }
    if (this.state.settings.autoCycle && this.state.autoCycleTimer) {
      clearInterval(this.state.autoCycleTimer);
      this.setState({
        autoCycleTimer: null,
      });
    }
    const { settings } = this.state;
    const targetIndex = this.state.currentIndex + settings.slidesToScroll;
    const currentIndex = this.getTargetIndex(targetIndex, settings.slidesToScroll);
    this.handleTrack(targetIndex, currentIndex);
    if (this.state.settings.autoCycle) {
      this.playAutoCycle();
    }
  };

  moveToPrevious = (event) => {
    event.preventDefault();
    if (this.props.onPreviousClick) {
      this.props.onPreviousClick(event);
    }
    if (this.state.animating) {
      return;
    }
    if (this.state.settings.autoCycle && this.state.autoCycleTimer) {
      clearInterval(this.state.autoCycleTimer);
      this.setState({
        autoCycleTimer: null,
      });
    }
    const { settings } = this.state;
    let targetIndex = this.state.currentIndex - settings.slidesToScroll;
    const currentIndex = this.getTargetIndex(targetIndex, settings.slidesToScroll);
    if (targetIndex < 0 && this.state.currentIndex !== 0) {
      targetIndex = 0;
    }
    this.handleTrack(targetIndex, currentIndex);
    if (this.state.settings.autoCycle) {
      this.playAutoCycle();
    }
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
    }, () => {
      this.playAutoCycle();
    });

    if (this.props.responsive) {
      this.setupBreakpointSettings(this.props.breakpoints);
    }
  };

  storeFrameRef = (f) => {
    if (f !== null) {
      this.frame = f;
    }
  };

  render() {
    const scrollOnDevice = this.props.scrollOnDevice && isTouchDevice();
    const { settings } = this.state;
    let prevArrow;
    let nextArrow;
    let dots;

    if (settings.arrows && !this.state.singlePage && !scrollOnDevice) {
      if (settings.prevArrow == null) {
        prevArrow = (
          <InfiniteCarouselArrow
            next={false}
            styles={styles}
            onClick={this.moveToPrevious}
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
            styles={styles}
            onClick={this.moveToNext}
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
          styles={styles}
          onClick={this.onDotClick}
        />
      );
    }

    if (settings.paging && !this.state.singlePage && !scrollOnDevice) {
      dots = (
        <span className={styles.InfiniteCarouselPaging}>
          { `${this.state.activePage + 1} ${this.props.pagingSeparator} ${this.state.slidePages}` }
        </span>
      );
    }

    const { children, lazyLoadedList, visibleSlideList } = this.state;
    const formattedChildren = this.getFormatedChildren(children, lazyLoadedList, visibleSlideList);
    let trackStyles;
    let trackClassName;

    if (this.props.scrollOnDevice && isTouchDevice()) {
      trackStyles = Object.assign({}, this.getScrollTrackStyles);
      trackClassName = styles.InfiniteCarouselScrollTrack;
    } else {
      trackStyles = this.getTrackStyles();
      trackClassName = '';
    }

    const disableSwipeEvents = this.props.scrollOnDevice && isTouchDevice();

    return (
      <div
        className={styles.InfiniteCarousel}
        onFocus={this.onMouseOver}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onMouseOver={this.onMouseOver}
      >
        {prevArrow}
        <div
          className={styles.InfiniteCarouselFrame}
          ref={this.storeFrameRef}
        >
          <ul
            className={trackClassName}
            style={trackStyles}
            onMouseDown={!disableSwipeEvents ? this.onSwipeStart : null}
            onMouseLeave={this.state.dragging || !disableSwipeEvents ? this.onSwipeEnd : null}
            onMouseMove={this.state.dragging || !disableSwipeEvents ? this.onSwipeMove : null}
            onMouseUp={!disableSwipeEvents ? this.onSwipeEnd : null}
            onTouchCancel={this.state.dragging || !disableSwipeEvents ? this.onSwipeEnd : null}
            onTouchEnd={!disableSwipeEvents ? this.onSwipeEnd : null}
            onTouchMove={this.state.dragging || !disableSwipeEvents ? this.onSwipeMove : null}
            onTouchStart={!disableSwipeEvents ? this.onSwipeStart : null}
          >
            {formattedChildren}
          </ul>
        </div>
        {nextArrow}
        {dots}
      </div>
    );
  }
}

export default InfiniteCarousel;
