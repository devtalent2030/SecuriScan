// code taken on dark/light mode toggle tutorial: https://staticmania.com/blog/guide-to-creating-a-darklight-mode-toggle-in-next-js
"use client";
import {ThemeProvider as NextThemesProvider} from "next-themes";
export default function ThemeProvider({children, ...props}) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
