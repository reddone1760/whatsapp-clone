import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import storage from "local-storage-fallback";

//? Themes
import { ThemeProvider } from "styled-components";
import { selectTheme } from "../app/features/themeSlice";
import { LightTheme, DarkTheme } from "../styles/Themes";

const themes = {
  light: LightTheme,
  dark: DarkTheme,
};

function App({ children }) {
  const globalTheme = useSelector(selectTheme);

  const [theme, setTheme] = useState(globalTheme);

  useEffect(() => {
    setTheme(globalTheme);
    storage.setItem("theme", JSON.stringify(globalTheme));
  }, [globalTheme]);

  return <ThemeProvider theme={themes[theme]}>{children}</ThemeProvider>;
}

export default App;
