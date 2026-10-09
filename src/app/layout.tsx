import type { Metadata, Viewport } from "next";
import { Noto_Sans } from "next/font/google";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/components/i18n/language-provider";

import "./globals.css";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const siteUrl = "https://kagojmind.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "KagojMind - AI Document Intelligence",
    template: "%s | KagojMind",
  },

  description:
    "Turn documents into knowledge with KagojMind. Upload PDFs and DOCX files, generate AI summaries, search document content, and ask questions with AI-powered answers.",

  applicationName: "KagojMind",

  keywords: [
    "KagojMind",
    "AI document intelligence",
    "AI document assistant",
    "PDF summarizer",
    "document search",
    "RAG",
    "AI document chat",
    "document knowledge management",
  ],

  authors: [{ name: "Siddiq Sazzad" }],
  creator: "Siddiq Sazzad",

  category: "technology",

  icons: {
    icon: [
      {
        url: "/brand/kagojmind-light.png",
        type: "image/png",
      },
    ],
    apple: "/brand/kagojmind-light.png",
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "KagojMind",
    title: "KagojMind — Turn Documents into Knowledge",
    description:
      "Upload documents, discover insights, generate summaries, and get answers from your files using AI.",
    url: "/",
  },

  twitter: {
    card: "summary_large_image",
    title: "KagojMind — Turn Documents into Knowledge",
    description:
      "Your AI-powered workspace for document summaries, semantic search, and intelligent document chat.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${notoSans.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <LanguageProvider>
              {children}
              <Toaster position="bottom-right" richColors closeButton />
            </LanguageProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
