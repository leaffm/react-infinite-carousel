import React, { Component, Children } from 'react';
import PropTypes from 'prop-types';
import { media } from 'react-responsive-mixin';
import uniqid from 'uniqid';
import {
  getElementWidth,
  getSwipeDirection,
  isTouchDevice,
  sortNumber,
  getScreenWidth,
} from './common/helpers';
import InfiniteCarouselArrow from './components/InfiniteCarouselArrow';
import InfiniteCarouselDots from './components/InfiniteCarouselDots';
import './components/InfiniteCarousel.css';

class InfiniteCarousel extends Component {
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
      slideUniqueIds: [],
    };
  }

  componentDidMount() {
    this.init();

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
    const { autoCycleTimer } = this.state;
    if (autoCycleTimer) {
      clearInterval(autoCycleTimer);
    }
  }

  setupBreakpointSettings = () => {
    const {
      children: propChildren,
      scrollOnDevice: propScrollOnDevice,
      breakpoints: breakpointsSettings,
    } = this.props;
    const { scrollOnDeviceProps: stateScrollOnDeviceProps } = this.state;
    const breakpoints = breakpointsSettings.map(element => element.breakpoint);
    const settings = {};
    breakpointsSettings.forEach(element => {
      settings[element.breakpoint] = element.settings;
    });
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
          const scrollOnDevice = propScrollOnDevice && isTouchDevice();
          const scrollOnDeviceProps = scrollOnDevice ? stateScrollOnDeviceProps : {};
          const newSettings = {
            ...this.defaultProps,
            ...this.props,
            ...settings[element],
            ...scrollOnDeviceProps,
          };
          const children = this.getChildrenList(propChildren, newSettings.slidesToShow);
          const slideUniqueIds = children.map(child => uniqid('slide-')); // eslint-disable-line  no-unused-vars
          this.setState(
            {
              settings: newSettings,
              children,
              slideUniqueIds,
              lowerBreakpoint,
              higherBreakpoint,
            },
            this.setDimensions
          );
        });
      });

      // Resize from small to large
      breakpoints.reverse();
      const query = { minWidth: breakpoints[0] };
      media(query, () => {
        const scrollOnDevice = propScrollOnDevice && isTouchDevice();
        const scrollOnDeviceProps = scrollOnDevice ? stateScrollOnDeviceProps : {};
        const newSettings = {
          ...this.defaultProps,
          ...this.props,
          ...scrollOnDeviceProps,
        };
        const children = this.getChildrenList(propChildren, newSettings.slidesToShow);
        const slideUniqueIds = children.map(child => uniqid('slide-')); // eslint-disable-line  no-unused-vars
        this.setState(
          {
            settings: newSettings,
            children,
            slideUniqueIds,
            lowerBreakpoint: undefined,
            higherBreakpoint: undefined,
          },
          this.setDimensions
        );
      });
    }
  };

  getSideSize = (lowerBreakpoint, higherBreakpoint, currentScreenWidth) => {
    const {
      settings: { incrementalSides, sideSize },
    } = this.state;

    if (lowerBreakpoint !== undefined && higherBreakpoint !== undefined && incrementalSides) {
      const maxPoint = higherBreakpoint - lowerBreakpoint;
      const currentPoint = currentScreenWidth - lowerBreakpoint;
      const sideSizePercetange = (currentPoint * 50) / maxPoint;

      return sideSizePercetange / 100;
    }

    return sideSize;
  };

  setDimensions = () => {
    const { settings, lowerBreakpoint, higherBreakpoint, children, currentIndex } = this.state;
    const { children: propChildren, scrollOnDevice: propScrollOnDevice } = this.props;
    const scrollOnDevice = propScrollOnDevice && isTouchDevice();
    const currentScreenWidth = getScreenWidth();
    const sideSize = this.getSideSize(lowerBreakpoint, higherBreakpoint, currentScreenWidth);
    const childrenCount = Children.count(propChildren);
    const slidesCount = scrollOnDevice ? childrenCount : Children.count(children);
    const frameWidth = getElementWidth(this.frame);
    const { showSides } = this.props;
    const slidesToShow = showSides ? settings.slidesToShow + sideSize * 2 : settings.slidesToShow;
    const slidesWidth = frameWidth / slidesToShow - settings.slidesSpacing * 2;
    const childrenLength = propChildren.length;
    const activePage = Math.ceil(currentIndex / settings.slidesToShow);
    const countPages = Math.ceil(childrenLength / settings.slidesToShow);
    const slidePages = childrenLength > settings.slidesToShow ? countPages : 1;
    const singlePage = slidePages <= 1;

    let lazyLoadedList;
    let visibleSlideList;
    if (singlePage || scrollOnDevice) {
      // jshint unused:true
      lazyLoadedList = children.map((_child, index) => index); // eslint-disable-line no-unused-vars
      visibleSlideList = [].concat(lazyLoadedList);
    } else {
      lazyLoadedList = this.getLazyLoadedIndexes(propChildren, currentIndex);
      visibleSlideList = this.getVisibleIndexes(propChildren, currentIndex);
    }

    this.setState(
      {
        activePage,
        childrenCount,
        slidesCount,
        slidesWidth,
        slidePages,
        singlePage,
        lazyLoadedList,
        visibleSlideList,
        sideSize,
      },
      () => {
        this.playAutoCycle();
      }
    );
  };

  getVisibleIndexes = (children, currentIndex) => {
    const visibleIndexes = [];
    let start;
    let limit;
    const { settings } = this.state;
    const showSidesSlide = settings.showSides ? 1 : 0;

    start = children.length + settings.slidesToShow + showSidesSlide;
    if (currentIndex === 0) {
      limit = start + settings.slidesToShow - 1;
      for (let index = start; index <= limit; index += 1) {
        visibleIndexes.push(index);
      }
    }

    start = 0 + showSidesSlide;
    const isAtLastPage = currentIndex === children.length - settings.slidesToShow;

    if (isAtLastPage) {
      limit = start + settings.slidesToShow - 1;
      for (let index = start; index <= limit; index += 1) {
        visibleIndexes.push(index);
      }
    }

    start = currentIndex + settings.slidesToShow + showSidesSlide;
    limit = start + (settings.slidesToShow - 1);
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
    const newLazyLoadedList = [].concat(lazyLoadedList);

    start = children.length + settings.slidesToShow + showSidesSlide;
    if (currentIndex === 0 && lazyLoadedList.indexOf(start) < 0) {
      limit = start + settings.slidesToShow + showSidesSlide - 1;
      for (let index = start; index <= limit; index += 1) {
        newLazyLoadedList.push(index);
      }
    }

    start = 0;
    const isAtLastPage = currentIndex === children.length - settings.slidesToShow;
    const notLazyLoaded = newLazyLoadedList.indexOf(start) < 0;

    if (isAtLastPage && notLazyLoaded) {
      limit = start + settings.slidesToShow + showSidesSlide - 1;
      for (let index = start; index <= limit; index += 1) {
        newLazyLoadedList.push(index);
      }
    }

    start = currentIndex + settings.slidesToShow + showSidesSlide;
    limit = start + (settings.slidesToShow - 1);

    if (settings.showSides) {
      start -= 1;
      limit += 1;
    }

    for (let index = start; index <= limit; index += 1) {
      if (lazyLoadedList.indexOf(index) < 0) {
        newLazyLoadedList.push(index);
      }
    }

    return newLazyLoadedList;
  };

  getChildrenList = (children, slidesToShow) => {
    const { scrollOnDevice, showSides } = this.props;
    if (!Array.isArray(children)) {
      return [children];
    }

    if (scrollOnDevice && isTouchDevice()) {
      return children;
    }

    if (children.length > slidesToShow && showSides) {
      return [
        ...children.slice(children.length - slidesToShow - 1, children.length),
        ...children,
        ...children.slice(0, slidesToShow + 1),
      ];
    }

    if (children.length > slidesToShow) {
      return [
        ...children.slice(children.length - slidesToShow, children.length),
        ...children,
        ...children.slice(0, slidesToShow),
      ];
    }

    return children;
  };

  getTargetIndex = (index, slidesToScroll) => {
    const { childrenCount, currentIndex } = this.state;
    let targetIndex = index;
    const childrenReminder = childrenCount % slidesToScroll;
    if (index < 0) {
      if (currentIndex === 0) {
        targetIndex = childrenCount - slidesToScroll;
      } else {
        targetIndex = 0;
      }
    } else if (index >= childrenCount) {
      if (childrenReminder !== 0) {
        targetIndex = 0;
      } else {
        targetIndex = index - childrenCount;
      }
    } else if (childrenReminder !== 0 && index === childrenCount - childrenReminder) {
      targetIndex = index - (slidesToScroll - childrenReminder);
    } else {
      targetIndex = index;
    }

    return targetIndex;
  };

  onDotClick = event => {
    event.preventDefault();
    const { settings, animating, autoCycleTimer } = this.state;
    const { slidesToShow, autoCycle } = settings;
    if (animating) {
      return;
    }
    if (autoCycle && autoCycleTimer) {
      clearInterval(autoCycleTimer);
      this.setState({
        autoCycleTimer: null,
      });
    }

    const targetIndex = event.target.parentElement.getAttribute('data-index');
    const currentIndex = this.getTargetIndex(targetIndex * slidesToShow, slidesToShow);
    this.handleTrack(targetIndex * slidesToShow, currentIndex);
    if (settings.autoCycle) {
      this.playAutoCycle();
    }
  };

  onWindowResized = () => {
    this.setDimensions();
  };

  onMouseEnter = () => {
    const {
      settings: { autoCycle, pauseOnHover },
    } = this.state;
    if (autoCycle && pauseOnHover) {
      this.pauseAutoCycle();
    }
  };

  onMouseOver = () => {
    const {
      settings: { autoCycle, pauseOnHover },
    } = this.state;
    if (autoCycle && pauseOnHover) {
      this.pauseAutoCycle();
    }
  };

  onMouseLeave = () => {
    const {
      settings: { autoCycle, pauseOnHover },
    } = this.state;
    if (autoCycle && pauseOnHover) {
      this.playAutoCycle();
    }
  };

  onSwipeStart = e => {
    const {
      settings: { swipe, draggable },
    } = this.state;

    if (swipe === false || ('ontouchend' in document && swipe === false)) {
      return null;
    }

    if (draggable === false && e.type.indexOf('mouse') !== -1) {
      return null;
    }

    const startX = e.touches !== undefined ? e.touches[0].pageX : e.clientX;
    const startY = e.touches !== undefined ? e.touches[0].pageY : e.clientY;

    this.setState({
      dragging: true,
      touchObject: {
        startX,
        startY,
      },
    });

    return true;
  };

  onSwipeMove = e => {
    const { dragging, animating } = this.state;
    if (!dragging) {
      e.preventDefault();
      return;
    }
    if (animating) {
      return;
    }
    const curX = e.touches !== undefined ? e.touches[0].pageX : e.clientX;
    const curY = e.touches !== undefined ? e.touches[0].pageY : e.clientY;
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
    const { touchObject, slidesWidth, autoCycleTimer, settings, currentIndex } = this.state;
    const swipeLength = touchObject.length;
    if (swipeLength !== 0 && swipeLength > slidesWidth / 2) {
      if (settings.autoCycle && autoCycleTimer) {
        clearInterval(autoCycleTimer);
        this.setState({
          autoCycleTimer: null,
        });
      }

      let targetIndex;
      let nextCurrentIndex;
      if (touchObject.direction === 1) {
        // Next
        targetIndex = currentIndex + settings.slidesToScroll;
        nextCurrentIndex = this.getTargetIndex(targetIndex, settings.slidesToScroll);
      } else {
        // Previous
        targetIndex = currentIndex - settings.slidesToScroll;
        nextCurrentIndex = this.getTargetIndex(targetIndex, settings.slidesToScroll);
        if (targetIndex < 0 && currentIndex !== 0) {
          targetIndex = 0;
        }
      }
      this.handleTrack(targetIndex, nextCurrentIndex);

      if (settings.autoCycle) {
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
        }, settings.animationDuration);
      };

      this.setState(
        {
          animating: true,
          touchObject: {
            direction: touchObject.direction * -1,
          },
        },
        callback
      );
    }
  };

  getTrackStyles = () => {
    const { settings } = this.state;
    const {
      touchObject,
      singlePage,
      sideSize,
      animating,
      slidesWidth,
      slidesCount,
      currentIndex,
    } = this.state;
    let trackWidth = slidesWidth + settings.slidesSpacing * 2;
    trackWidth *= slidesCount + settings.slidesToShow * 2;
    const totalSlideWidth = slidesWidth + settings.slidesSpacing * 2;
    const showSidesSlide = settings.showSides ? 1 : 0;
    const initialTrackPostion = totalSlideWidth * (settings.slidesToShow + showSidesSlide);
    const transition = animating ? `transform ${settings.animationDuration}ms ease` : '';
    const hasTouchOffset = settings.swipe && touchObject.length;
    const touchOffset = hasTouchOffset ? touchObject.length * touchObject.direction : 0;
    const slidePosition = totalSlideWidth * currentIndex;
    let trackPosition = initialTrackPostion + slidePosition + touchOffset;
    const sideWidth = totalSlideWidth * sideSize;

    if (settings.showSides) {
      trackPosition -= sideWidth;
    }

    const transform = !singlePage ? `translate(${-trackPosition}px, 0px)` : 'none';

    return {
      position: 'relative',
      display: 'block',
      width: !singlePage ? trackWidth : '100%',
      height: 'auto',
      padding: 0,
      transition,
      transform,
      boxSizing: 'border-box',
      MozBoxSizing: 'border-box',
      marginLeft: singlePage && settings.showSides ? `${sideWidth}px` : '0px',
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

  getSlideStyles = isVisible => {
    const { slidesWidth, settings } = this.state;
    const { scrollOnDevice } = this.props;
    const isScrollTouch = scrollOnDevice && isTouchDevice();
    const float = isScrollTouch ? 'none' : 'left';
    const display = 'inline-block';
    const opacity = isVisible ? '1' : settings.sidesOpacity;

    return {
      position: 'relative',
      float,
      display,
      width: !Number.isNaN(slidesWidth) ? slidesWidth : 1,
      height: 'auto',
      margin: `0 ${settings.slidesSpacing}px`,
      opacity,
    };
  };

  getFormatedChildren = (children, lazyLoadedList, visibleSlideList) =>
    Children.map(children, (child, index) => {
      const { settings, slideUniqueIds } = this.state;
      const isVisible = visibleSlideList.indexOf(index) >= 0;

      if (!settings.lazyLoad || lazyLoadedList.indexOf(index) >= 0) {
        return (
          <li
            className="InfiniteCarouselSlide"
            key={slideUniqueIds[index]}
            style={this.getSlideStyles(isVisible)}
          >
            {child}
          </li>
        );
      }

      return (
        <li
          className="InfiniteCarouselSlide"
          key={slideUniqueIds[index]}
          style={this.getSlideStyles(isVisible)}
        >
          <noscript>{child}</noscript>
          <img alt="placeholder" src={settings.placeholderImageSrc} />
        </li>
      );
    });

  autoCycle = () => {
    const { settings, currentIndex } = this.state;
    const targetIndex = currentIndex + settings.slidesToScroll;
    const nextCurrentIndex = this.getTargetIndex(targetIndex, settings.slidesToScroll);
    this.handleTrack(targetIndex, nextCurrentIndex);
  };

  playAutoCycle = () => {
    const { settings } = this.state;
    if (settings.autoCycle) {
      const autoCycleTimer = setInterval(this.autoCycle, settings.cycleInterval);
      this.setState({
        autoCycleTimer,
      });
    }
  };

  pauseAutoCycle = () => {
    const { autoCycleTimer } = this.state;
    if (autoCycleTimer) {
      clearInterval(autoCycleTimer);
      this.setState({
        autoCycleTimer: null,
      });
    }
  };

  handleTrack = (targetIndex, currentIndex) => {
    const { children, onSlideChange } = this.props;
    const { settings } = this.state;
    const activePage = Math.ceil(currentIndex / settings.slidesToShow);
    const lazyLoadedList = this.getLazyLoadedIndexes(children, currentIndex);
    const visibleSlideList = this.getVisibleIndexes(children, currentIndex);

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
      this.setState(
        {
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
        },
        callback
      );
    } else if (targetIndex >= children.length) {
      this.setState(
        {
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
        },
        callback
      );
    } else {
      this.setState(
        {
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
        },
        stopAnimation
      );
    }

    if (onSlideChange) {
      onSlideChange(activePage);
    }
  };

  moveToNext = event => {
    const { onNextClick } = this.props;
    const { animating, settings, currentIndex, autoCycleTimer } = this.state;
    event.preventDefault();
    if (onNextClick) {
      onNextClick(event);
    }
    if (animating) {
      return;
    }
    if (settings.autoCycle && autoCycleTimer) {
      clearInterval(autoCycleTimer);
      this.setState({
        autoCycleTimer: null,
      });
    }

    const targetIndex = currentIndex + settings.slidesToScroll;
    const nextCurrentIndex = this.getTargetIndex(targetIndex, settings.slidesToScroll);
    this.handleTrack(targetIndex, nextCurrentIndex);
    if (settings.autoCycle) {
      this.playAutoCycle();
    }
  };

  moveToPrevious = event => {
    const { onPreviousClick } = this.props;
    const { animating, settings, currentIndex, autoCycleTimer } = this.state;
    event.preventDefault();
    if (onPreviousClick) {
      onPreviousClick(event);
    }
    if (animating) {
      return;
    }
    if (settings.autoCycle && autoCycleTimer) {
      clearInterval(autoCycleTimer);
      this.setState({
        autoCycleTimer: null,
      });
    }

    let targetIndex = currentIndex - settings.slidesToScroll;
    const nextCurrentIndex = this.getTargetIndex(targetIndex, settings.slidesToScroll);
    if (targetIndex < 0 && currentIndex !== 0) {
      targetIndex = 0;
    }
    this.handleTrack(targetIndex, nextCurrentIndex);
    if (settings.autoCycle) {
      this.playAutoCycle();
    }
  };

  getSettingsForScrollOnDevice = () => {
    const { scrollOnDevice } = this.props;
    const { scrollOnDeviceProps } = this.state;
    let settings;
    if (scrollOnDevice && isTouchDevice()) {
      settings = {
        ...this.defaultProps,
        ...this.props,
        ...scrollOnDeviceProps,
      };
    } else {
      settings = {
        ...this.defaultProps,
        ...this.props,
      };
    }
    return settings;
  };

  init = () => {
    const { breakpoints } = this.props;
    if (breakpoints.length > 0) {
      this.setupBreakpointSettings();
    } else {
      const { children } = this.props;
      const settings = this.getSettingsForScrollOnDevice();
      const { slidesToShow } = settings;
      const newChildren = this.getChildrenList(children, slidesToShow);
      const slideUniqueIds = newChildren.map(child => uniqid('slide-')); // eslint-disable-line  no-unused-vars
      this.setState(
        {
          children: newChildren,
          slideUniqueIds,
          settings,
        },
        () => {
          this.setDimensions();
        }
      );
    }
  };

  storeFrameRef = f => {
    if (f !== null) {
      this.frame = f;
    }
  };

  render() {
    const { scrollOnDevice, pagingSeparator, name } = this.props;
    const hasScrollOnDevice = scrollOnDevice && isTouchDevice();
    const { settings, singlePage, activePage, slidePages, dragging } = this.state;
    let prevArrow;
    let nextArrow;
    let dots;

    if (settings.arrows && !singlePage && !hasScrollOnDevice) {
      if (settings.prevArrow == null) {
        prevArrow = (
          <InfiniteCarouselArrow carouselName={name} next={false} onClick={this.moveToPrevious} />
        );
      } else {
        const prevArrowProps = {
          onClick: this.moveToPrevious,
        };
        prevArrow = React.cloneElement(settings.prevArrow, prevArrowProps);
      }

      if (settings.nextArrow == null) {
        nextArrow = <InfiniteCarouselArrow carouselName={name} onClick={this.moveToNext} />;
      } else {
        const nextArrowProps = {
          onClick: this.moveToNext,
        };
        nextArrow = React.cloneElement(settings.nextArrow, nextArrowProps);
      }
    }

    if (settings.dots && !singlePage && !hasScrollOnDevice) {
      dots = (
        <InfiniteCarouselDots
          carouselName={name}
          activePage={activePage}
          numberOfDots={slidePages}
          onClick={this.onDotClick}
        />
      );
    }

    if (settings.paging && !singlePage && !hasScrollOnDevice) {
      dots = (
        <span data-testid={`${name}-paging`} className="InfiniteCarouselPaging">
          {`${activePage + 1} ${pagingSeparator} ${slidePages}`}
        </span>
      );
    }

    const { children, lazyLoadedList, visibleSlideList } = this.state;
    const formattedChildren = this.getFormatedChildren(children, lazyLoadedList, visibleSlideList);
    let trackStyles;
    let trackClassName;

    if (scrollOnDevice && isTouchDevice()) {
      trackStyles = {
        ...this.getScrollTrackStyles,
      };
      trackClassName = 'InfiniteCarouselScrollTrack';
    } else {
      trackStyles = {
        ...this.getTrackStyles(),
      };
      trackClassName = '';
    }

    const disableSwipeEvents = scrollOnDevice && isTouchDevice();

    return (
      <div
        id={name}
        data-testid={name}
        className="InfiniteCarousel"
        onFocus={this.onMouseOver}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onMouseOver={this.onMouseOver}
      >
        {prevArrow}
        <div className="InfiniteCarouselFrame" ref={this.storeFrameRef}>
          <ul
            className={trackClassName}
            style={trackStyles}
            onMouseDown={!disableSwipeEvents ? this.onSwipeStart : null}
            onMouseLeave={dragging && !disableSwipeEvents ? this.onSwipeEnd : null}
            onMouseMove={dragging && !disableSwipeEvents ? this.onSwipeMove : null}
            onMouseUp={!disableSwipeEvents ? this.onSwipeEnd : null}
            onTouchCancel={dragging && !disableSwipeEvents ? this.onSwipeEnd : null}
            onTouchEnd={!disableSwipeEvents ? this.onSwipeEnd : null}
            onTouchMove={dragging && !disableSwipeEvents ? this.onSwipeMove : null}
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

InfiniteCarousel.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  name: PropTypes.string,
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

InfiniteCarousel.defaultProps = {
  children: [],
  name: 'infinite-carousel',
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

export default InfiniteCarousel;
