import { themesConfig } from "@/components/notio-themes";
import { ColorThemeSwitcher } from "@/components/color-theme-switcher";
import { ThemeVariables } from "@/components/theme-variables";
import { ColorThemeProvider } from "@/hooks/color-theme-context";
import { ThemeProvider } from "@/components/theme-provider";
import "./index.css";

const foodBridgeSansFont =
  '-apple-system, BlinkMacSystemFont, "San Francisco", "Helvetica Neue", Helvetica, ui-sans-serif, sans-serif';
const themeNames = ["basil", "forest", "sunny"];

const themeSwatches: Record<string, string> = {
  basil: "oklch(0.6292 0.0458 300.3136)",
  forest: "oklch(0.8348 0.1302 160.9080)",
  sunny: "oklch(0.713 0.1305 61.77)",
};
export default function FoodBridgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-screen bg-background text-foreground"
        style={{ fontFamily: foodBridgeSansFont }}
      >
        <div
          className="min-h-screen bg-background text-foreground"
          style={{ fontFamily: foodBridgeSansFont }}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ColorThemeProvider>
              <ThemeVariables themesConfig={themesConfig} />
              {children}
              <ColorThemeSwitcher
                themeNames={themeNames}
                themeSwatches={themeSwatches}
              />
            </ColorThemeProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}