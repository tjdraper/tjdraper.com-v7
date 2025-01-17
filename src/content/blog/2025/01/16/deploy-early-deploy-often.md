---
title: Deploy Early, Deploy Often
slug: deploy-early-deploy-often
preview: One of the things I like to do with my team is think through how to grease the skids for easy and rapid software development and deployment. Over the last year, I've done some work on my team's deployment processes, trying to make sure there's as little overhead as possible. Why is that? Well I want our team to be deploying all the time. Even while a feature is being developed and incomplete. Why is that? Well, I'm glad you asked. Pull up a chair and sit down…
---

One of the things I like to do with my team is think through how to grease the skids for easy and rapid software development and deployment. Over the last year, I've done some work on my team's deployment processes, trying to make sure there's as little overhead as possible. Why is that? Well I want our team to be deploying all the time. Even while a feature is being developed and incomplete. Why is _that_? Well, I'm glad you asked. Pull up a chair and sit down.

My friend, [Kevin Smith](https://kevinsmith.io/), posted a thing on Twitter not too long ago that got my attention regarding this subject.

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Why deploy frequently, even as the feature is still being developed?<br><br>“If any change can potentially affect any part of the system, then introducing two changes at once is much more complicated to debug than introducing one change. Was the problem change A? Change B? Some…</p>&mdash; Kevin Smith (@_KevinSmith) <a href="https://twitter.com/_KevinSmith/status/1872449990745833730?ref_src=twsrc%5Etfw">December 27, 2024</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

He [linked to the Kent Beck article he quoted](https://tidyfirst.substack.com/p/why-accelerate-deployment) so naturally I clicked on through and I thought it was excellent.

I'll quote some things and then comment.

> A lesson I learned from my officemate at Oregon, David Meyer (now a director at Cisco), is that as systems grow in complexity, every element is potentially coupled to every other element. This suggests that systems be made as simple as possible to keep that N^2 from blowing up too far, and it suggests that changes be made one at a time. If any change can potentially affect any part of the system, then introducing two changes at once is much more complicated to debug than introducing one change. Was the problem change A? Change B? Some interaction of A and B? Or was it just a coincidence? Introducing one change at a time keeps the cost of maintenance in check.
>
>At the same time, systems need to grow rapidly. You need many changes but you can only introduce one change at a time. One way to reconcile the conflicting needs is to reduce the cycle time. If you can change a system in tiny, safe steps but you can make those steps extremely quickly, then it can look from the outside like you are making big changes.

This is really good. As software engineers, when we release often, even multiple times during feature development, from our perspective we’re making small incremental changes. But from the outside, when we’re finished, we’ve released big changes with no ill effects.

> Timothy Fitz, formerly of IMVU, told a story that brought this lesson home to me. The discipline they came to was that as soon as they said to themselves, “That change couldn’t possibly break anything,” they deployed immediately. If you weren’t at least a little worried, why would you even say that? By making the overhead of deployment vanishingly small, they could create value with every deployment. Either the deployment was fine, in which case the engineer regained confidence, or the deployment broke, in which case the engineer learned something about the sensitivities of the system.

I didn’t realize I was “discovering the sensitivities of the system” at the time, but early on in the first stages of an API transition for a project I was working on, I ran a deployment which took the app down in production. I had, of course, tested this new API endpoint extremely thoroughly in my local dev environment, a UAT environment, and a Staging environment. This new API endpoint performed exactly to spec in every test environment. And so, I deployed to production.

It broke spectacularly.

What I had done was actually deployed 2 things at once, though I didn’t think about it that way at the time. I deployed the new API endpoint, AND I deployed the change to the front-end that consumed the new API endpoint. The API endpoint was for the main menu of the application, which is an endpoint every page in the app touches. So when the endpoint failed after deploy, it took the whole thing down.

What I learned that day (again) was to deploy things more incrementally. From then on, I would deploy new API endpoints first. And then after testing that API endpoint, I would run another deployment to switch over the React app to consume that endpoint. That allowed testing the JSON response of the new endpoint before relying on it.

So, while there may be multiple deployments during the process for a given API endpoint, development can actually move faster and not be afraid of breaking things.

Kent Beck goes on with an analogy of code as inventory.

> In Toyota Production System, Taiichi Ohno makes an analogy between inventory and water in a river. By lowering the water level in the river (reducing inventory), you can uncover previously hidden rocks (identify bottlenecks). Undeployed software is inventory. By deploying in smaller batches, you can identify bottlenecks in your software process.

When I used to work at a film company, we did a filmed lecture series with an entrepreneur. One of the things he talked about was how inventory is a liability. What you want is to optimize the supply chain so that inventory flows and you aren’t storing things in big warehouses or for too long. You always want as little inventory as possible.

While I’ve never been in that sort of business, I thought that was interesting and filed it away in the back of my head.

That’s why I find this analogy fascinating. I now have a way to apply that knowledge. Unreleased code is inventory. Holding it back (storing it in the warehouse) is not a zero-cost effort. Code gets stale as the application moves forward around it.

Additionally, have you ever built up a succession of branches that have to go out in a certain order? The more of that you have, the higher the cost of development.

> Startups have a vital need to eliminate waste. Because many of the assumptions on which a startup are based are likely to prove false, most startups need to iterate to be successful.

He talks here about startups, but I think this is generally true across any good organization.

> If the team can learn to learn from each iteration and can make those iterations short and cheap, then the whole enterprise has a greater chance of succeeding overall. Startups have the initial advantage of no code and no customers, so establishing a rapid deployment rhythm is relatively easy, although maintaining that rhythm through growth can be a challenge.

He talks about the “no code and no customers” bit, but my thinking is, startup or not, code or not, the principles he’s talking about are the goal and something all organizations should strive for.

Now, of course, you have to be careful when you have established code and customers relying on it. But the principles of rapid deployment are no less useful. The problem set to solve is the same problem set.

## What's the cash value?

On my team, we don't ask permission to deploy from non-technical people, and I would encourage all software teams and engineers to try to be in a position to manage and run deployments at will.

Of course this means 3 things (at least):

### 1. You need to have and maintain a track record of not breaking things when you deploy.

If your deployments break often, non-technical stake-holders are going to want to put controls on deployments. Of course this is the wrong instinct, because study after study shows software gets more stable the more often a team deploys and/or feels comfortable deploying. But the non-technical stake-holders aren't in a position to know that. All they know is that things break a lot, and when they dig in to find out why, it's related to a deployment. So, be studious with your development practices and think through all the effects that your deployments will have on the software.

Maintain ways of testing, or environments to test in, that mirror production to the extent possible. And then always run your code and deployments through those before releasing to production.

Of course, deploying often is also part of not breaking things. Because the fewer changes that are deployed at once, the fewer things there are to go wrong. AND if something does go wrong, where to go to fix it is narrowed down considerably.

### 2. You need to make sure you have a way of rolling back a deployment swiftly in case of failure.

Failures can and do happen. You cannot avoid the occasional failure. So make sure you have a plan in place for rolling back. And go over it in detail occasionally. With your team. In most cases, if the system is down for a minute, you're not going to catch too much flack. If it's down for 10 minutes, you're going to get lots of messages. If its down for longer than that due to a bad deploy, you can kiss frequent deployments goodbye.

### 3. You need to have systems like feature flags in place that let you, the software team, deploy code whenever you want, even though the product team or other stake-holders may not be ready to "release" a feature.

On my team, we make copious use of feature flags to determine when features go live. We decouple deployment from release. You'll probably want to go in after release and remove conditionals and feature flags, and yes, this is a trade-off with having more code-paths in your software (at least, temporarily). But I promise you it's well worth it to keep the code inventory low.

## Be the software expert

I tell engineers not to ask for permission to deploy. If you ask for permission to deploy from non-technical stake-holders, you are eroding their confidence in your ability to do your job. Don't do that. Instead, be confident. And of course, as we've mentioned, be right. Don't break things.

So when announcing releases, I encourage my team to use language like, "this release adds the groundwork for 'x'" rather than saying, "I'm releasing feature 'x'." This removes the need to ask for permission. Then the conversation with the product team, or whoever controls _when_ features are released goes more like this: "when would you like to make feature 'x' available?"

Perhaps what I'm saying about confidence and not asking for permission to deploy applies only to mid-level and above engineers. Or maybe it only applies to senior-level and above engineers. I would encourage teams to still keep "permission" to deploy within the software engineering team. The engineers are the ones in the best position to know what's best for the software.

And for the junior and mid-level engineers, let this be an encouragement to level up your skills. This is part of becoming a senior engineer. As the engineer, you need to be the expert in your field. Half that battle is acting like the expert you are. Trust me, I know for many like myself, confidence is a learned behavior, but it's well worth learning.
