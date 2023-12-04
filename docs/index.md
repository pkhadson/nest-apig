---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Nest CDK"
  text: "Serverless NestJS"
  tagline:
  image:
    src: /logo.svg
    alt: Nest CDK
  actions:
    - theme: brand
      text: Getting started
      link: /getting-started
    - theme: alt
      text: What is?
      link: /about

features:
  - title: Save money
    details: Nest CDK optimizes serverless processing, reducing lambda invocations and saving significant costs.
    icon: 💸
  - title: Startup-time Faster
    details: The Nest CDK library significantly reduces the startup time of the lambda container with NestJS.
    icon: ⚡️
  - title: PubSub Feature
    details: This feature leverages SQS and SNS to provide a robust and scalable publish-subscribe system.
    icon: 💡
  # - title: Body Validator
  #   details: This feature transforms the input payload of HTTP requests into JSON schemas that are configured at the API Gateway layer.
  #   icon: 📦
---
