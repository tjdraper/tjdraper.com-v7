---
title: "The Technical Debt of Technical Debt"
slug: the-technical-debt-of-technical-debt
preview: I'm not sure at this point whether the idea of "technical debt" is all the helpful. So many people import so many meanings onto it. Instead, I prefer to use the phrase "maintenance load." Let me explain why…
---

I'm not sure at this point whether the idea of "technical debt" is all the helpful. So many people import so many meanings onto it. Instead, I prefer to use the phrase "maintenance load." Let me explain why.

## What is technical debt, anyway?

It's a salient question and one that I think is a little muddy. Is technical debt a thing that happens when software stagnates and the world around it moves on? Or is it something that happens when poor decisions are made in software design? Or is it something that occurs because business needs change and those changing needs weren't fully taken into account when building the original software?  Or, to consider further, is technical debt what happens when an engineer or a team of engineers take shortcuts (warranted or not) to meet deadlines, get applications out the door, or are lazy?

The problem is that I've seen all these types of things referred to as technical debt.

In addition, there's an idea generally associated with the idea of technical debt that it results from bad code. The trouble is, the frustrations and head-desking™ that are generally associated with technical debt are not always associated with bad code. But calling it technical debt gives us that idea and tends to push us to re-write applications that just need some re-working to help it out. It also makes us think that the previous developers on the project were not good developers and that us current developers know what's up, yo! But that is rarely the case. It also tends to give us this idea that if we just write the code correctly in the first place there will be no frustrations in the form of what we call technical debt.

Now, I'm not here to say that technical debt, as a phrase or an idea, isn't valid or doesn't have a place in our vocabulary. Indeed, I quite like the way we can talk about how technical debt needs to be paid off just like any other kind of debt. And I enjoy talking about the interest rate of a given type of technical debt and how it can crush you. And how, if you keep taking out those tech debt loans, you will eventually reach a point where you can't even pay the interest, much less make any meaningful progress on the debt itself.

All those things are valid, but I don't think they really get at the heart of the issue. Technical debt is both too precise and too abstract at the same time. It's too precise because we mean one of the things I mentioned. But it's too abstract because it doesn't really answer the real question that we need to be asking, which is: what is the maintenance load of what we're working on?

## Maintenance load

In the majority of cases, I think we'd be better off to talk about maintenance load. How much time does it take to maintain this application? What's the cost of change? Maintenance load is what we're really after when we talk about technical debt anyway. What does it take to keep the lights on? How hard is it to change or add features?

Maintenance load also implies that the work is necessary and unavoidable. And that's good because we're not starting out with a combative mindset toward our software. Running any application carries with it a certain amount of maintenance. You can write the cleanest of clean code all day every day, and you will still have maintenance load.

Referring to the maintenance load of software reminds us that software is not free to run and that it does have a cost associated with it. And as you add features, or change features, if you approach it with the question and mindset, "how much load is this adding to our team?" you will be much better positioned to run the app and add the features.

It also gives you something much more concrete to talk about to stakeholders asking for features or applications. And when you can evaluate what your current maintenance load is, and how much you would be adding, and weigh that against your team's capacity, you then know something much more solid than, "well, there's a lot of technical debt and things are kind of icky." When you know the technical debt, then you can identify solutions such as refactoring or reworking the parts of an application that are giving you trouble, or hiring more engineers. Or perhaps the decision can be made to postpone or rethink features. It's the difference in talking about things being kind of hard to manage, vs thinking more concretely about capacity. From there you can decide whether capacity is being eaten up by maintenance load that can be reduced or not.

In some ways it's a subtle shift in thinking, but I deem it a valuable one and I hope maybe you can see how it is as well.
