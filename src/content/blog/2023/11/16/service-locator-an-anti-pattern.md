---
title: "Service locator: an anti-pattern"
slug: service-locator-an-anti-pattern
link: https://stitcher.io/blog/service-locator-anti-pattern
preview: The service locator pattern is everywhere, certainly in Laravel (most famously by means of "facades") but it's in other places too. this is a pattern we should avoid and Brent Roose gives us a few great reasons as to why…
---

The [service locator pattern] is, in my estimation, a menace to good software design. I'd like to find time to write about it, but Brent Roose does a really good job so I'm linking to him.

> I want to highlight three problems with this approach, directly caused by the use of a service locator.
>
> - There's a bigger chance of runtime errors.
> - The code is obfuscated to the outside.
> - It increases cognitive load.
>
> Let's look at these problems, one by one.

While he focuses on cognitive load the most heavily perhaps, in my estimation, the runtime errors [^1] issue is the biggest one for me. Being able to know from a static analysis standpoint whether your code should run okay or not is huge. This also factors into my love of strong typing as well — which is yet another topic for yet another day.

[service locator pattern]: https://en.wikipedia.org/wiki/Service_locator_pattern

[^1]: Yes, Brent and I both know that everything is a "runtime error" in PHP, he deals with that
