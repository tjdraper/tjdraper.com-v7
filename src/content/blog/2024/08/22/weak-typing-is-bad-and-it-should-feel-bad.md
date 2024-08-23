---
title: Why Strong Typing Is Preferable To Weak Typing
slug: weak-typing-is-bad-and-it-should-feel-bad
preview: There are many software engineers and web developers who really feel like all this typing is just annoying and gets in the way. But if you learn to embrace strong typing, you will actually write fewer bugs and have a more resilient system.
---

There are many software engineers and web developers who really feel like all this [typing][Type System] is just annoying and gets in the way. Can't we just have the program or compiler or whatever figure out what the type should be, coerce what it can, etc.?

[Type system]: https://en.wikipedia.org/wiki/Type_system

I am in the "no" camp on that question. Strong types make for systems that are easier to reason about and have fewer bugs. And I'd like to use an illustration from an experience I've had recently on why that is. Keep in mind this is but one illustration among many of how weak typing causes bugs.

In a particular system my team is working on, the front-end is powered by [React] and [Typescript]. Of course, we chose Typescript for it's stronger typing in the Javascript ecosystem. Even so, it apparently is not strong enough to save us from the following scenario (and I wish it would).

[React]: https://react.dev/
[Typescript]: https://www.typescriptlang.org/

Our front-end React app makes API requests to a PHP back-end. The authentication of the request for the user happens with Tokens. The relevant code for this illustration looks about like this:

```typescript
interface Token {
    accessToken: string;
    accessTokenExpires: number;
    refreshToken: string;
}

export async function makeApiRequest (
    {
        uri,
        queryParams = new URLSearchParams(),
        payload = {},
        token,
    }: { 
        uri: string;
        queryParams?: URLSearchParams;
        payload?: Record<never, never>;
        token: Token;
    },
) {
    const baseUrl = getConfigStringServerSide(ConfigOptions.API_BASE_URL);

    return sendApiRequest({
        url: new URL(`${baseUrl}${uri}?${queryParams.toString()}`),
        payload,
        headers: new Headers({
            Authorization: `Bearer ${token.accessToken}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }),
    });
}
```

That's fine, but the problem with this function is that it requires an access token to be present. We have one or two API requests that we need to be able to make unauthenticated. But we need all the rest of the processing to happen on the request so the only thing we need to do is make the token optional.

So here's what the code was updated to:

```typescript
interface Token {
    accessToken: string;
    accessTokenExpires: number;
    refreshToken: string;
}

function createHeadersFromToken (token: Token | undefined): Headers {
    const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    } as Record<string, string>;

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return new Headers(headers);
}

export async function makeApiRequest (
    {
        uri,
        queryParams = new URLSearchParams(),
        payload = {},
        token,
    }: {
        uri: string;
        queryParams?: URLSearchParams;
        payload?: Record<never, never>;
        token?: Token;
    },
) {
    const baseUrl = getConfigStringServerSide(ConfigOptions.API_BASE_URL);

    return sendApiRequest({
        url: new URL(`${baseUrl}${uri}?${queryParams.toString()}`),
        payload,
        headers: createHeadersFromToken(token),
    });
}
```

We made the token optional, and we moved the headers creation out to a factory method to only add the `Authorization` header if the token was present.

But, can you spot the bug? I'll bet you can't (not quickly), and we didn't either. And no alarms are going off. No linters are complaining. Typescript isn't crying about it. Nothing is saying there's something wrong.

And yet, now authenticated API requests are broken in our local dev. Can you guess why yet?

Because the error is not easy to spot, and there's no underlines in the editor from the linter, and Typescript is compiling just fine, we start combing through the code, `console.log`ging here, step debugging in PHP and/or dumping and dying there. After tracing the request through the front-end and heading over to the PHP side, we finally got to the part in PHP that validates the Authorization header. And here's what the debugging output said the token was:

```
"Bearer [object Object]"
```

Let me be clear, that's a "string" of `[object Object]` which was sent as an Authorization header in the API request to the PHP application. And because it's a string in a header, there are no errors in the PHP application about types (the typing error would have needed to happen in Javascript/Typescript). So the PHP app looks at that header, tries to authenticate it as a token, and, what do you know, there is no valid `[object Object]` token, so the PHP app correctly returns an HTTP `401` status code response.

So by now you've spotted the error in the refactored code. No? Let me help. It's this bit right here:

```typescript
if (token) {
    headers.Authorization = `Bearer ${token}`;
}
```

Remember, if you read the code, that the `Token` type is an object:

```typescript
interface Token {
    accessToken: string;
    accessTokenExpires: number;
    refreshToken: string;
}
```

So what happened? What went wrong here? Weak typing is what went wrong. Typescript is apparently not strongly enough typed to flag this as an error. And the underlying Javascript will happily type coerce an object to a string as `[object Object]` when you put it into a string context rather than raising an error like strong typing advocates think it should.

An object cannot reasonably become a string and to try to do so should be a program error.

Strong typing solves this problem. In PHP, if you try to concatenate or interpolate an object into a string, PHP isn't going to be happy. And it will be very obvious how, why, and where it isn't happy.

In fact, here is an example in PHP. This is using a keyed array (which is [really a hash map or dictionary][Arrays in PHP] in most languages) because that is the closest analog to a Javascript object.

[Arrays in PHP]: /blog/arrays-collections-and-types-in-php/

```php
<?php

$testArray = ['foo' => 'bar'];

$testString = "test: $testArray";

echo $testString;
```

To be fair, PHP does type coerce the array into a string (I don't think it should do that at all). But, in PHP 8, it outputs a `Warning` [^1] (in PHP 5.6 and 7.x it outputs a `Notice` which isn't as great) that looks like this:

```
Warning: Array to string conversion in /path/to/file.php on line 5
test: Array
```

[^1]: I really wish it was and `Error`, but, warning at least can be seen in development.

And, perhaps most importantly, the offending code gets highlighted and underlined by PHPStorm as a program error, "Array to string conversion" so that the developer can see right away, without even running the program, that there's a program error.

Back to Javascript.

Javascript's type coercion in this case (and nearly every case I can think of) was an uncaught program error. It's a mistake any one of us on the team might have made during that refactor and which we would normally expect our tooling to catch so we could pull the correct property out of the object to put into that string. Here's what that code should look like:

```typescript
if (token) {
    headers.Authorization = `Bearer ${token.accessToken}`;
}
```

The fact that no part of the program was able to catch this program error is a failure of language and tooling. Yes, it was a mistake by a developer (a mistake the likes of which every single developer reading this article has made), but it was much more a failure of the language.

Now, perhaps there's a failure of our tooling to catch this, but man we've got as many dials as we can on Typescript and ESLint cranked up as high as they'll go, and yet nothing caught this.

What really prevents things like this is strong typing. This is one of many illustrations on why I am very much pro-strong typing.
