import { useState, useEffect } from 'react';

interface BreakpointMap {
  xs: boolean;
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
  xxl: boolean;
}

interface ResponsiveInfo extends BreakpointMap {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const breakpoints = {
  xs: 480,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
};

export const useResponsive = (): ResponsiveInfo => {
  const [screenWidth, setScreenWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const responsive: ResponsiveInfo = {
    xs: screenWidth < breakpoints.xs,
    sm: screenWidth >= breakpoints.sm && screenWidth < breakpoints.md,
    md: screenWidth >= breakpoints.md && screenWidth < breakpoints.lg,
    lg: screenWidth >= breakpoints.lg && screenWidth < breakpoints.xl,
    xl: screenWidth >= breakpoints.xl && screenWidth < breakpoints.xxl,
    xxl: screenWidth >= breakpoints.xxl,
    isMobile: screenWidth < breakpoints.md,
    isTablet: screenWidth >= breakpoints.md && screenWidth < breakpoints.lg,
    isDesktop: screenWidth >= breakpoints.lg,
  };

  return responsive;
};

export default useResponsive;
