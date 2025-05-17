import 'react';

declare module 'react' {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
    children?: string;
  }
}

declare module 'styled-jsx' {
  interface StyleProps {
    jsx?: boolean;
    global?: boolean;
    children?: string;
  }
}

declare module 'styled-jsx/style' {
  interface StyleProps {
    jsx?: boolean;
    global?: boolean;
    children?: string;
  }
}

declare module 'styled-jsx/css' {
  interface StyleProps {
    jsx?: boolean;
    global?: boolean;
    children?: string;
  }
} 