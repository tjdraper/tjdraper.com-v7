---
title: Incidental Duplication
slug: incidental-duplication
preview: Is your software feeling a little too DRY? A spoonful of duplication may be just what you need. Hear me out…
---

As we write software, one of the tools in our toolbox is [abstraction][abstraction]. Among other things, abstractions help us with a principle known as [DRY][DRY] programming. One of the points of DRY programming is to have a single source of truth for any given bit of knowledge within a system. At face value, that's not a bad goal. But we can often take a principle and apply it so much or so liberally, that it is done at the exclusion of other considerations.

## DRYing things out

I am now primarily a back-end engineer working most often in PHP, but I started out in HTML and CSS. While creating sites with HTML and CSS, I quickly discovered that I had to do a lot of HTML code duplication across those static HTML files. This prompted me to look into PHP, where I could use PHP's `include` feature to abstract the duplicated parts of pages into single files and then `include` them on the various pages. That provided a single source of truth for, say, the main navigation of the site, or the footer.

By pulling content from some single source files into several other pages, I had created a very basic abstraction that de-duplicated the knowledge and code that was previously duplicated.

After that experience, I learned more about the principles of abstraction, coupled with learning about the DRY principle. Being the opinionated extremist I can sometimes tend to be, I wanted to apply both to EVERYTHING. Any code that looked like "duplicate code" was up for grabs to be abstracted to a "single source of truth."

## Parched?

The problem is, just because code looks like it's being duplicated doesn't necessarily mean that it will stay duplicated, or that one part of the system using a de-duplicated abstraction will continue to evolve in the exact same way as another part of the system that same abstraction is being used in. The problem I'm describing here is what seasoned software engineers refer to as "incidental duplication." This duplication happens all the time. Why? Because software implements similar patterns everywhere. And because these patterns look so similar, it is tempting to apply a blanket de-duplication approach.

De-duplicating incidental duplication has the opposite effect of what is intended. As we de-duplicate the code into various abstractions, we tend to cling to these abstractions, writing mitigations that handle more and more use cases as disparate parts of the system evolve in their separate ways. This makes the code powering the software hard to reason about, hard to understand, and even harder to change.

## "Technical Debt" and the way out

Often, when you hear engineers talk about [technical debt][technical debt] [^1], what they're really dealing with is hasty abstractions born out of a desire to de-duplicate incidental duplication. Over time, as hastily abstracted de-duplication grows, the burden of maintaining these abstractions, making simple changes to various parts of the software without affecting other parts of the software, becomes overwhelming. If something isn't done, the software will eventually become so prone to bugs that it will be impossible to support.

There are 3 ways out of this problem:

1. Re-write the application
2. Refactor to re-duplicate the inappropriate abstractions
3. Don't hastily abstract in the first place

### 1. Re-writing your application

This is most often the wrong call, though it can be necessary for this and many other reasons. Even then, it should be done carefully, and probably not all at once [^2]. Often your new application will be missing business logic or features that the old system had. This is because the old and gnarly system, difficult to work on though it may be, contains within its inscrutable logic, a wealth of information necessary for the correct operation of the business, service, or use case it powers.

The reason for the re-write is the reason this logic and these features weren't fully understood when moving to the new system. The engineers found the old application too difficult to understand. They probably would have had better luck de-tangling the old system first _before_ a re-write, or even just sticking with the current system and refactoring it over time.

And if the reasons for the failure of the first application are not well understood — which is very often the amalgamation of many years of bad abstractions — then the new application will wind up in the same situation as the old application.

### 2. Refactoring to re-duplicate

When you find yourself in the sticky situation of poor and hasty abstractions, re-duplicating is your most useful way forward. Push the conditional branches of logic and mitigations that are applicable in the bad abstraction back out to where they're being used. In doing this de-tangling, you'll be able to find and understand the business logic of the application and preserve it.

### 3. Just say no to bad abstractions

Don't create the wrong abstractions in the first place, and back out of them early and often when you do.

I realize bad abstractions are unavoidable. We're all human, we all make mistakes. Even the most senior of us make bad calls and inappropriate abstractions. One of the keys to becoming a more senior engineer is to recognize these [code smells][code smell] very early in the process and back out of them quickly. [Constant vigilance][constant vigilance]!

And of course, as we endeavor not to write these hasty abstractions in the first place, we should not be wary of code duplication. After you duplicate code, live with it for a while to determine if an abstraction is actually needed. [^3]

## Examining DRY

In my estimation, the principle of DRY has been widely misunderstood and misapplied. Let's take a closer look.

> Every <ins>**piece of knowledge**</ins> must have a single, unambiguous, authoritative representation within a system.  
> — Andy Hunt & Dave Thomas - [DRY—The Evils of Duplication][DRY—The Evils of Duplication] - [The Pragmatic Programmer][The Pragmatic Programmer]

_(emphasis is mine)_

Many engineers hear about DRY and think about it only in terms of their _code_. That was me. I was "many engineers" at one time. But the DRY principle is really about creating single sources of truth for _knowledge_, not just code. I'd argue that DRY needs to be applied to code _much_ more carefully than to knowledge within a codebase. As a simple (and even silly) example: you probably shouldn't be manually writing out your application's name in every place it's seen or used. You should instead have a source of truth from which that knowledge is pulled. There may be many places where the code to consume that knowledge is duplicated, but the knowledge is not duplicated.

An important bit from the afore quoted chapter in the second edition of [The Pragmatic Programmer][The Pragmatic Programmer]:

> Let's get something out of the way up-front. In the first edition of this book we did a poor job of explaining just what we meant by Don’t Repeat Yourself. Many people took it to refer to code only: they thought that DRY means "don’t copy-and-paste lines of source."
>
> That is part of DRY, but it's a tiny and fairly trivial part.
>
> DRY is about the duplication of knowledge, of intent. It's about expressing the same thing in two different places, possibly in two totally different ways.

I also encourage you to read the part in that chapter ([available as a free PDF][DRY—The Evils of Duplication]) under the heading, "Not All Code Duplication is Knowledge Duplication".

## Keep yourself hydrated, don't be too DRY

So as you work on your applications, websites, etc., remember these principles:

1. Don't be wary of code duplication. Duplicating code costs almost nothing. Inappropriate abstractions grow into monsters over time that significantly increase maintenance load and cost a great deal in the long run.
2. But do use the principles of DRY programming when considering the _knowledge_ of your system.

If you bear these things in mind, I believe you'll find the job of both writing and maintaining software a much lighter burden in the long run.

[^1]: I don't really like the term "technical debt" and prefer to use the term [maintenance load][maintenance load]
[^2]: When replacing an application with an entirely new application, one of the best ways to go about that is one bite at a time, usually using the [strangler fig][strangler fig] pattern, which is something every software engineer should take the time to understand and learn.
[^3]: I'd also like to point out that if you're duplicating a pattern from one domain or boundary to another, it would almost never be appropriate to abstract code into a common method/class/component. But that's a post for another day I hope to get to.

[abstraction]: https://medium.com/@tayfunkalayci/abstraction-in-software-exploring-real-world-examples-b2e95d496bef
[DRY]: https://www.digitalocean.com/community/tutorials/what-is-dry-development
[technical debt]: https://en.wikipedia.org/wiki/Technical_debt
[maintenance load]: https://stackoverflow.blog/2023/02/27/stop-saying-technical-debt/
[constant vigilance]: https://giphy.com/gifs/august-guest-ann-lirn1IJDukVLq
[strangler fig]: https://martinfowler.com/bliki/StranglerFigApplication.html
[code smell]: https://en.wikipedia.org/wiki/Code_smell
[DRY—The Evils of Duplication]: https://media.pragprog.com/titles/tpp20/dry.pdf
[The Pragmatic Programmer]: https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/
