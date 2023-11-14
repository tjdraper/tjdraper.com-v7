---
title: Strangler Fig Mindset
slug: strangler-fig-mindset
preview: How can you advance your software and applications by bits and pieces at a time? There is a way, and I'd like to talk about it…
---

Every line of code you write is legacy code. That may sound harsh and disheartening, but it's the truth. In a year, or two, or five, you will need to change, remove, or refactor the code that you, your teammates, or your friends are writing right this very moment. With this in mind, how can we keep things moving forward?

## The Big Bad Monolithic Re-Write

A full, all at once, hard cut-over re-write is almost never advisable. Granted, I've done it once or twice. The most notable was my own website where I market and sell my add-ons for ExpressionEngine and Craft, [BuzzingPixel.com]. I did it for various reasons that are uninteresting, and it worked well for the most part. However, I did run into two or three cases that I forgot to account for, that were accounted for in the old, janky system. And it really pissed off a couple of customers that found their software was disabled or their experience degraded in some way by the re-write.

The bottom line is it may have been inadvisable for me to do a monolithic re-write. And, guess what? It's been a few years now, and I've moved on from the ways of thinking in which I wrote that codebase and now I hate working on it. It's all very much legacy code.

I'm fairly confident that my way forward with that codebase from here out, if I need to implement major things or make major changes, will be the [strangler fig][Martin Fowler Strangler Fig] method.

One of the problems with monolithic re-writes is that it's nearly impossible to account for every case the old and difficult to understand system was covering. Not everything will have a place in the new re-write, and something — often many somethings — will be missed. This can be true for patterns other than the monolithic re-write, but it is most true for this pattern. The old has to be cut off and the new put in its place. A switch has to be flipped. This means testing is hard, and once the switch is flipped, every case that wasn't accounted for has to be immediately found and remedied.

I recommend **not** doing a monolithic re-write nearly every time. So, what then? What can we do?

## Strangler Fig

I keep referencing this thing. I've even named my post after this thing. But what is it? [Martin Fowler has written about it][Martin Fowler Strangler Fig]. He, in fact, has pioneered the use of this nomenclature in software design, so let's see what he has to say:

> When Cindy and I went to Australia, we spent some time in the rain forests on the Queensland coast. One of the natural wonders of this area are the huge strangler figs. They seed in the upper branches of a tree and gradually work their way down the tree until they root in the soil. Over many years they grow into fantastic and beautiful shapes, meanwhile strangling and killing the tree that was their host.

He goes on to describe this as a really good way to approach a re-write. And he describes a strategy:

> In particular I've noticed a couple of basic strategies that work well. The fundamental strategy is EventInterception, which can be used to gradually move functionality to the strangler fig and to enable AssetCapture.

This is not a bad strategy, but based on my experience, I believe we can think more broadly about how to apply a strangler fig mindset.

## 1. ABC - Always Be Correcting

Okay, okay, I'd rather say, "Always Be Improving", but then it's not an alphabetical acronym. This can be a very broad application of a strangler fig mindset. As you constantly work on a system, always let your new code and the approaches and lessons you've been learning over time strangle out the old. Don't stick slavishly to the old way of doing things.

I recently heard someone say something to the effect of, "just pick a convention for your project and STICK TO IT." It's hard for me to state just how strongly I disagree with this approach. Since you're always writing legacy code, it's already a big enough battle to keep things up to date and modern. Don't complicate it by overburdening yourself with a dogged commitment to paths you chose with less knowledge and experience. Never be afraid to [update your priors][prior probability]. [^1]

So please do apply your experience, knowledge, and wisdom as you work on older codebases. [^2] And remember that knowledge is not static, it grows and changes over time.

### 2. Release Immediately

In some ways, this could have perhaps been option 1.5, but I wanted to emphasise it:

When you see parts of the system that need to be tended, refactored, or updated, and you have time, do it and release it. This is particularly easy if it's pretty straightforward nothing else needs to be coordinated, and there are no user-facing changes.

As a software engineer, you are more than just a vicarious mouse and keyboard for project stakeholders. You are one of the stewards of the codebase(s) and code quality therein. It falls on your shoulders to maintain the code and keep it in good shape. Pay a few cents now for the many dollars worth of future return of being able to move quickly and easily in the future as the product and business needs evolve. Remove your old, harder to understand, less effective code by immediately replacing it with newer, more up-to-date, easier to understand code.

### 3. [Feature Flags] (or [Feature Toggles])

We're getting closer here to the [Event Interception] that Martin Fowler talked about. Of course, you can use feature flags to hide new parts of the system (and you should where applicable). But you can also use it to route code from an old code path to a new one. When you have some new part of the system that is replacing an old part of the system, you can use feature flags to do this "strangling".

There are two main reasons for doing so:

1. You're not entirely confident that the new code you're about to release covers all the use cases of the old code. The feature flag is a safety valve. When users aren't getting what they need out of your new application code, you can switch back and go do some more work on the new code. [^3]
2. You need to coordinate the code changes with some other external factor — be it with another team in your company, perhaps coinciding with the announcement and availability of new features, or some service that your new code needs to talk to, etc.

While feature flags have a very broad applicability beyond the "strangler fig" adjacent use case, they are a powerful tool in your tool box for accomplishing a strangler fig mindset on an on-going basis. You can strangle out the old code at a time of your choosing with your new code.

### 4. [Event Interception]

Regardless of what system you're using or how you accomplish it, the idea behind a full blown event interception is that you have _something_ sitting between the consumer and your new and old application, service, or code intercepting the call. [^4] That _something_ determines how to route the call to the code based on whatever criteria you determine. If the interceptor determines that the new system can handle the request, it routes the request to the new system. Otherwise, it sends the request to the old system. The consumer doesn't need to know anything else but to continue consuming in the same way as before.

When a full re-write of your application is required, rather than employing a monolithic approach, I would argue that the strangler fig approach is most often your best path forward. It allows you to re-write the system a bit at a time, release early and often to catch mistakes and missed logic from the old system for just one particular use case, and incorporate it as you go.

## Case Study

I think a good case study is an application that I worked on and continue to work on. The application was originally built in Drupal many years ago (long before I was on the team). Drupal made a big transition with Drupal 8 that left the app without a good upgrade path. Knowing everything we know now, we would choose different platforms for building this application. However, Drupal powered this application and the business for years. It literally enabled the success of the company. Contained within the custom modules we added to that Drupal application over its many years of service is all the knowledge needed for the application to serve the business in the way it needs to.

So, for this app, we chose to take a hybrid approach. We determined that we would build a new front-end in React, and initially power it with API calls to Drupal. That meant in turn that we would update Drupal to serve JSON at its page URLs when a request was made to it from the new React application. Then, we would begin a strangler fig approach of updating all the API calls to a new PHP application. This is why I call this a hybrid approach. The React front-end was entirely new, including a fresh coat of paint. But the primary business logic was still contained in Drupal.

We rolled the React front-end app out with hardly a hiccup, after which we began writing the new PHP back-end. I came up with a list of every endpoint the new React app requests from Drupal, and made a todo task out of each one so we have a list. And now we pick them off one by one.

For the strangler fig configuration, we actually were very fortunate that the Drupal application's URLs are powered entirely by query strings. So in React, our configuration is set up so that if there's no path on our API call, it calls the Drupal powered API. And if there is a path, it sends the call to the new API. Once we've completed a re-write of an endpoint, we simply adjust the parameters of the call to go to the new API's URI path and the configuration of our API call takes care of the rest.

This allows us to write endpoints in the new API one at a time, and roll them out when they're ready. We can take plenty of time combing through the old business logic of an endpoint to find all the ways it could respond, and all the edge cases, and determine the best way to write that in our modern PHP app.

All told, it's been a remarkably positive experience. We're actually not done with the new PHP API yet, but we've converted several end-points over and it's going very well.

## The Long Haul

As we consider strangler fig, it's adaptations and permutations, I think we find that it's a mindset in which we create and re-create software for the long haul. Software is ever-evolving, ever-changing. We constantly find new and better ways to write software. Re-writing an application from scratch always has unforeseen consequences. In writing a new application alongside the old and strangling it out, we find a far easier route to stability and maintainability.

[^1]: One of the ways to soften the blow of deciding on a different path for any particular part of the codebase, is to use the co-location method of organizing your code, and in that way, the updated conventions you may decide on for the things you're working on now, are contained to that place in the codebase. I hope to write on co-location soon. I've recently given a presentation that seemed very well received on the subject at Longhorn PHP and I also hope to post that presentation.
[^2]: I suppose it may also need to be said that you should follow convention within your team and that you need to be moving as a team, getting buy-in on new ideas and concepts. Move forward carefully and deliberately, but move forward.
[^3]: Be sure to remove feature flags and old code paths once releases are complete and you don't need them anymore. Part of good system maintenance is eliminating dead code and dead options.
[^4]: That event interception can happen with code in the new application. It can determine if it is capable of handling the event/request, and forward to the old application if not.

[BuzzingPixel.com]: https://www.buzzingpixel.com
[Martin Fowler Strangler Fig]: https://martinfowler.com/bliki/StranglerFigApplication.html
[prior probability]: https://en.wikipedia.org/wiki/Prior_probability
[Feature Flags]: https://blog.jetbrains.com/space/2022/06/16/feature-flags/
[Feature Toggles]: https://martinfowler.com/articles/feature-toggles.html
[Event Interception]: https://martinfowler.com/articles/patterns-legacy-displacement/event-interception.html
