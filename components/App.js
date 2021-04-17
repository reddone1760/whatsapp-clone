import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import storage from "local-storage-fallback";

//? Themes
import { ThemeProvider } from "styled-components";
import { selectTheme, changeTheme } from "../app/features/themeSlice";
import { LightTheme, DarkTheme } from "../styles/Themes";

const themes = {
  light: LightTheme,
  dark: DarkTheme,
};

function App({ children }) {
  const dispatch = useDispatch();
  const globalTheme = useSelector(selectTheme);

  const [theme, setTheme] = useState(globalTheme);

  useEffect(() => {
    setTheme(globalTheme);
    storage.setItem("theme", JSON.stringify(globalTheme));
  }, [globalTheme]);

  return (
    <ThemeProvider theme={themes[theme]}>
      <button
        onClick={() => {
          globalTheme === "light"
            ? dispatch(changeTheme({ theme: "dark" }))
            : dispatch(changeTheme({ theme: "light" }));
        }}
      >
        Change Theme
      </button>
      {children}
    </ThemeProvider>
  );
}

export default App;
