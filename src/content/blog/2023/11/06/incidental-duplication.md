---
title: Incidental Duplication
slug: incidental-duplication
preview: Is your software feeling a little too DRY? A spoonful of duplication may be just what you need. Hear me out…
---

As we write software, one of the tools in our toolbox that we often pull out is [abstraction][abstraction]. There are many kinds of abstractions, and there are many ways to go about abstracting things. Among other things, abstractions help us with a principle known as [DRY][DRY] programming. One of the points of DRY programming is to have a single source of truth for any given bit of knowledge within a system. Taken at face value, that's not a bad goal. But sometimes we can often take a principle and apply it so much or so liberally, that it is done at the exclusion of any other considerations.

## DRYing things out

Though I am at this present time, and for quite a while now, primarily a back-end engineer doing a lot of PHP work, I did cut my teeth by learning HTML and CSS in the early 2000s. What got me into PHP was that I quickly learned while building those early (and quite frankly, awful looking, tasteless) websites, that I had to do a lot of HTML code duplication across those static HTML files that comprised the website pages. This prompted me to look into very basic PHP where I could use PHP's `include` feature to pull in the duplicated parts of the HTML layout into the various pages. And that gave me a single source of truth for, say, the main navigation of the site, or the footer.

This is a very simple example of an abstraction. By pulling content from some single source file into another page, I had created a very basic abstraction that de-duplicated the knowledge and code that was before duplicated across all my site pages.

In the early days of my career, as a young and carefree software engineer, I learned more about the principles of abstraction, coupled with learning about the DRY principle. Being the opinionated extremest I can sometimes tend to be, I wanted to apply both to EVERYTHING. And, being inexperienced with software architecture and long term maintenance, pretty much any code that looked like "duplicate code" was up for grabs to be abstracted to a "single source of truth."

## Parched?

The problem is, just because code looks like it's being duplicated doesn't necessarily mean that it will stay duplicated, or that one part of the system using a de-duplicated system of abstraction will continue to evolve in the exact same way as another part of the system that same abstraction is being used in. The problem I'm describing here is what most seasoned software engineers refer to as "incidental duplication." This apparent duplication happens all the time. Why? Because software implements similar patterns everywhere. And because these patterns look so similar, it is often tempting to apply a blanket de-duplication approach.

De-duplicating incidental duplication has the opposite affect of what is intended, however. As we de-duplicate the code into various abstractions, we tend to cling to these abstractions, writing conditional statements and other mitigations that handle more and more use cases as disparate parts of the system evolve in their separate ways. This makes the code powering your site or software hard to reason about, hard to understand, and even harder to change.

## "Technical Debt" and the way out

Often, when you hear engineers talk about [technical debt][technical debt] [^1], what they're really dealing with is hasty abstractions born out of a desire to de-duplicate incidental duplication. Over time, as hastily abstracted de-duplication grows, the burden of maintaining these abstractions, making simple changes to various parts of the software without affecting other parts of the software, becomes overwhelming. If something isn't done, the software will eventually become so prone to bugs that it will be impossible to support.

There are 3 ways out of this problem:

1. Re-write the application in the newest and shiniest framework. For sure newer, cleaner code will solve the problem!
2. Refactor to re-duplicate the inappropriate abstractions and strive for better, less hasty abstractions in the future as you go
3. Don't hastily abstract in the first place. Catch it early and immediately refactor when you inevitably create a bad abstraction. [Constant vigilance][constant vigilance]!

### Re-writing your application

This is very often the wrong call, though, it can be necessary for this and many other reasons. Even then, it should be done carefully, and probably not all at once [^2]. Often your new application will be missing business logic, or features that the old system had. This is because the old and narly system, difficult to work on though it may be, contains within its twisted logic, a wealth of information necessary to the correct operation of the business or service it powers.

The reason for the re-write is the reason this logic and these features weren't fully understood when moving to the new system. The engineers currently on the project found the old application way too difficult to understand. They probably would have had better luck de-tangling the old system first, or just sticking with it and de-tangling it.

### Refactoring to re-duplicate

When you find yourself in the sticky situation of poor and hasty abstractions, this is your most common and useful way forward. Push the conditional branches that are applicable in the bad abstraction back out to where they're being used. In doing this de-tangling, you'll be able to find and understand the business logic of the application and preserve it.

### Just say no to bad abstractions

I realize bad abstractions are unavoidable. We're all humans, we all make mistakes. And as software engineers, the most senior of us are going to make bad calls and inappropriate abstractions. One of the keys to becoming a more senior engineer is to recognize these [code smells][code smell] very early in the process and back out of it quickly.

And of course, endeavor not to write these hasty abstractions in the first place. Don't be afraid of code duplication. After you duplicate code, live with it for a while to determine if an abstraction is actually needed, or if the parts of the system are evolving separately.

## Examining DRY

The main problem here, in my estimation, is that the principle of DRY has been misunderstood and misapplied. Let's take a look at this principle a little more closely.

> Every **piece of knowledge** must have a single, unambiguous, authoritative representation within a system.  
> — Andy Hunt & Dave Thomas - The DRY Principle - The Pragmatic Programmer

_(emphasis is mine)_

Many engineers hear about DRY and they think of drying up their _code_. But what the DRY principle is after is creating single sources of truth for _knowledge_. As a simple (and even silly) example: you probably shouldn't be typing your applications name in every place it's seen or used. You should instead have a source of truth from which that knowledge is pulled. There may be many places where the code to pull that in is duplicated, but the knowledge is not duplicated.

## Keep yourself hydrated, don't be too DRY

So as you work on your applications, websites, etc. remember these principles. Don't be afraid of code duplication. Duplicating code costs almost nothing. Inappropriate abstractions grow into monsters over time that significantly increase maintenance load and cost a great deal in the long run.

[^1]: I don't really like the term "technical debt" and prefer to use the term [maintenance load][maintenance load]
[^2]: The [strangler fig][strangler fig] pattern is something every software engineer should take the time to understand and learn.

[abstraction]: https://medium.com/@tayfunkalayci/abstraction-in-software-exploring-real-world-examples-b2e95d496bef
[DRY]: https://www.digitalocean.com/community/tutorials/what-is-dry-development
[technical debt]: https://en.wikipedia.org/wiki/Technical_debt
[maintenance load]: https://stackoverflow.blog/2023/02/27/stop-saying-technical-debt/
[constant vigilance]: https://giphy.com/gifs/august-guest-ann-lirn1IJDukVLq
[strangler fig]: https://martinfowler.com/bliki/StranglerFigApplication.html
[code smell]: https://en.wikipedia.org/wiki/Code_smell
