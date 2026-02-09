// src/theme.ts
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#0A4D7C", // Brand navy blue
      light: "#E8F4FD",
      dark: "#073A5E",
    },
    secondary: {
      main: "#7FD957", // Brand green accent
      light: "#B8F090",
      dark: "#5CB82E",
    },
    background: {
      default: "#F8F9FA",
      paper: "#FFFFFF",
    },
    action: {
      active: "#0A4D7C",
      hover: "#E8F4FD",
    },
    text: {
      primary: "#2C3E50",
      secondary: "#546E7A",
    },
  },
  typography: {
    fontFamily: [
      "Poppins",
      "Inter",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
  },
});

export default theme;
