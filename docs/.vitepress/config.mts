import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Nest CDK",
  description: "Serverless NestJS",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/logo.svg",
    nav: [
      { text: "Home", link: "/" },
      { text: "What is?", link: "/about" },
      { text: "Getting Started", link: "/getting-started" },
      { text: "Examples", link: "/examples" },
      { text: "API", link: "/api" },
    ],

    sidebar: [
      {
        text: "Introduce",
        items: [
          { text: "What is?", link: "/about" },
          { text: "Getting Started", link: "/getting-started" },
        ],
      },
      {
        text: "Modules",
        items: [
          { text: "Body validator", link: "/modules/body-validator" },
          { text: "Authetication", link: "/modules/authentication" },
          { text: "PubSub", link: "/modules/pubsub" },
        ],
      },
      {
        text: "Examples",
        link: "https://github.com/pkhadson/nest-cdk-examples",
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/pkhadson/nest-apig" },
    ],
  },
});
