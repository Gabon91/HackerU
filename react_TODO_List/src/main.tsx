import './index.css'
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: "#2563eb",
    },
    background: {
      default: "#f4f6f8",
      paper: "#ffffff",
    },
  },

  shape: {
    borderRadius: 10,
  },

  typography: {
    fontFamily: "Arial, sans-serif",

    h4: {
      fontWeight: 700,
    },

    h6: {
      fontWeight: 600,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);