declare module '@skillconnect/shared' {
  export const Colors: {
    bgMain: string;
    bgCard: string;
    dark: string;
    medium: string;
    light: string;
    paper: string;
    white: string;
    primary: string;
    primaryHover: string;
    secondary: string;
    verified: string;
    warning: string;
    danger: string;
    text: string;
    textMain: string;
    textMuted: string;
    border: string;
    borderLight: string;
    shadowGlow: string;
    [key: string]: string;
  };

  export const Typography: {
    fontFamily: {
      heading: string;
      body: string;
    };
    sizes: {
      h1: number;
      h2: number;
      h3: number;
      body: number;
      caption: number;
    };
    weights: {
      bold: '800';
      semibold: '700';
      medium: '600';
      regular: '400';
    };
  };

  export const Spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };

  export const Radius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };

  export const API: any;
  export const userReducer: any;
  export const bookingReducer: any;
  export const workerReducer: any;
  export const complaintReducer: any;
  export const appealReducer: any;

  export const fetchMe: any;
  export const fetchUser: any;
  export const logout: any;
  export const fetchBookings: any;
  export const acceptBooking: any;
  export const fundEscrow: any;
  export const fetchWorkers: any;
  export const updateLocation: any;
  export const reportDispute: any;

  export const SKILL_CATEGORIES: string[];
  export const MOCK_WORKERS: any[];
}
