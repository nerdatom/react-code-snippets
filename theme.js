import React from "react";
import { ThemeProvider } from "styled-components";
import Proptypes from "./proptypes";
import * as C from "../colors";

const theme = {
  color: {
    /**
     * use dark versions for one shade darker e.g., hovers
     */
    lighterPrimary: C.BLUE_20,
    lightPrimary: C.BLUE_60,
    primary: C.BLUE,
    darkPrimary: C.BLUE_105,

    transparent: "transparent",

    lighterGreen: C.GREEN_20,
    lightGreen: C.GREEN_80,
    green: C.GREEN,
    darkGreen: C.GREEN_120,

    darkBlue: C.DARK_BLUE,
    darkDarkBlue: C.DARK_BLUE_120,
    lightDarkBlue: C.DARK_BLUE_60,
    lighterDarkBlue: C.DARK_BLUE_40,

    blue: C.BLUE,

    black: C.BLACK,
    darkBlack: C.BLACK_120,

    lighterYellow: C.YELLOW_20,
    lightYellow: C.YELLOW_60,
    yellow: C.YELLOW,
    darkYellow: C.YELLOW_120,

    white: C.WHITE,
    darkWhite: C.GREY_20,

    lighterRed: C.RED_20,
    lightRed: C.RED_40,
    red: C.RED,
    darkRed: C.RED_120,

    lightGrey: C.GREY_20,
    grey: C.GREY_60,
    darkGrey: C.GREY_80,

    border: C.GREY_40,
    darkBorder: C.GREY_80,
    disabled: C.GREY_80,

    background: C.GREY_20
  },
  seperators: {
    border: `1px solid ${C.GREY_40}`,
    boxShadow: `0 0 6px ${C.BOX_SHADOW_DARK}`,
    boxShadowTop: `0px -3px 3px ${C.BOX_SHADOW_DARK}`,
    boxShadowLeft: `-3px 0 3px ${C.BOX_SHADOW_DARK}`,
    boxShadowRight: `3px 0 3px ${C.BOX_SHADOW_DARK}`,
    boxShadowBottom: `0px 3px 3px ${C.BOX_SHADOW_DARK}`
  },
  transition: {
    long: styleRules =>
      styleRules
        .map(rule => `0.4s ease ${rule}`)
        .join(", ")
        .trimEnd(","),
    short: styleRules =>
      styleRules
        .map(rule => `0.3s ease ${rule}`)
        .join(", ")
        .trimEnd(",")
  },
  typography: {
    color: {
      dark: C.DARK_BLUE,
      lighterDark: C.DARK_BLUE_60,
      darkerDark: C.DARK_BLUE_105,

      red: C.RED,
      green: C.GREEN,

      light: C.WHITE,
      placeholder: C.DARK_BLUE_40
    },
    weights: {
      regular: 400,
      semibold: 600,
      bold: 700
    },
    h5: {
      fontSize: "16px",
      letterSpacing: "-0.2pt",
      fontWeight: 600
    },
    h6: {
      fontSize: "14px",
      letterSpacing: 0,
      fontWeight: 600 // Don't use regular font for this
    },
    regular: {
      fontSize: "13px",
      letterSpacing: 0
    },
    small: {
      fontSize: "12px",
      letterSpacing: 0
    },
    micro: {
      // Don't use regular font for this
      fontSize: "11px",
      letterSpacing: 0
    }
  },
  spacing: {
    s0: "0px",
    s1: "1px",
    s2: "2px",
    s4: "4px",
    s8: "8px",
    s16: "16px",
    s32: "32px",
    gutter: "8px"
  },
  borderRadius: {
    r4: "4px"
  }
};

class ThemeContainer extends React.PureComponent {
  render() {
    const { children } = this.props;
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
  }
}

ThemeContainer.propTypes = {
  theme: Proptypes.any.isRequired, // eslint-disable-line
  children: Proptypes.node.isRequired
};

// const ThemeContainer = mapActionsToProps({ theme })(ThemeWrapper);

export { ThemeContainer };
export default theme;
