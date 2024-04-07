import React from "react";
import ReactClient from "react-dom/client";

import { App } from "./components/app";
import { ThemeProvider, createTheme } from "@mui/material";

const theme = createTheme({
  // Define breakpoints, typography, or other global styles if needed
  // palette: {
  //   // Define your color palette here
  //   primary: {
  //     main: "#556cd6",
  //   },
  //   secondary: {
  //     main: "#19857b",
  //   },
  // },
  components: {
    // You can define component-specific styles here
    MuiModal: {
      styleOverrides: {
        // Adjust modal styles for landscape orientation
      },
    },
  },
});

ReactClient.createRoot(document.getElementById("root")).render(
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>
);
