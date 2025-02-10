import { Html, Head, Main, NextScript } from "next/document";
import Header from './utils/header'
import Footer from './utils/footer'
import ThemeProvider from "./utils/ThemeProvider";

export default function Document() {
  return (
    <Html lang="en">
		<Head />
		<ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        >
			<Header />
			<body className="antialiased">
				<Main />
				<NextScript />
			</body>
			<Footer />
      	</ThemeProvider>
    </Html>
  );
}
