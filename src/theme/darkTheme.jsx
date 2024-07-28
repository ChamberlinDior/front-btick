import { createTheme } from "@mui/material";

export const darkTheme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#ffffff"
    },
    text: {
      primary: "#0c071b"
    },
    primary: {
      main: "#006400" // Updated color to valid format
    },
    secondary: {
      main: "#008000" // Green color for buttons
    }
  }
});
