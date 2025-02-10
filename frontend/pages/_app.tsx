import "@/styles/globals.css";
import type { AppProps } from "next/app";
import ThemeProvider from "./utils/ThemeProvider";

export default function App({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />;
}
