---
title: SSR, Token Refreshes, and HTTP Streaming
slug: ssr-token-refreshes-streaming
preview: You can't set cookies via header with the HTTP Streaming API, which React makes copious use of for async data loading and suspense boundaries. What do you do when you need to update a token stored in a cookie then?
---

Up to this point, I've more or less written about PHP. But as a full-stack engineer, I do a lot of work all over the stack. And over the last few years, I've done a lot of work in React and Typescript. And most of that work has been in the [Next framework]. Next, like a lot of other things, has its good points and its bad points.

[Next framework]: https://nextjs.org/

Of late in the React world in general, SSR (server-side rendering) has been a big topic of discussion. And specifically in [Next's App Router], SSR is the default mode, and you have to take steps to make a component client-side rendered (CSR).

[Next's App Router]: https://nextjs.org/docs/app

While in some ways, SSR feels like getting back to my roots as a PHP engineer, building the page on the server and shipping it to the client, it also causes some problems. Particularly when using SSR combined with [HTTP Streaming], which is [what Next does][Next Loading UI and Streaming] — particularly if you're using [suspense boundaries]. What happens is, when you are waiting on an async data load, React/Next will deliver an initial payload, and stream the rest when the async process finishes. So what's the problem? My approach to OAuth token refreshes has had to change to accommodate SSR.

[HTTP Streaming]: https://developer.mozilla.org/en-US/docs/Web/API/Streams_API
[Next Loading UI and Streaming]:https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming
[suspense boundaries]: https://react.dev/reference/react/Suspense
[OAuth token refreshes]: https://oauth.net/2/refresh-tokens/

## The Problem with OAuth Token Refreshes and SSR/HTTP Streaming

So, it turns out, [you can't set cookies when streaming][why you can't set cookies in server components] after the initial payload, and so Next just disallows trying to set cookies at all in server-side rendered components. That's just as well because any time I would need to update a cookie from a token refresh, it would be after the suspense boundary and initial payload anyway.

[why you can't set cookies in server components]: https://youtu.be/ejO8V5vt-7I?si=7Tg8M4HR0F72ojXu

## The Old Way in CSR

So the first application my team and I built in Next was started before server-side components and streaming were things in Next. So it's entirely CSR. And it initially began life as a stateless front-end [^1]. As such, combined with the fact that we're using NextAuth to create the initial sign-in and token exchange, we stored the [JWT] in the NextAuth cookie (encrypted with a server-side secret).

[NextAuth]: https://next-auth.js.org/
[JWT]: https://jwt.io/

[^1]: We have since added [Redis] as a caching and temporary store mechanism to the front-end app's back-end (what a world we live in that I have to construct a sentence about a front-end's back-end).

[Redis]: https://redis.io/

This is the NextAuth `JWT` callback config we set up:

```typescript
jwt: async (
    {
        token,
        user,
        account,
    }: {
        token: JWT;
        user: User;
        account: Account;
    },
) => {
    // Initial sign in
    if (account && user) {
        token.user = user;

        return {
            accessToken: account.access_token,
            accessTokenExpires: account.expires_at,
            refreshToken: account.refresh_token,
            user,
        };
    }

    return token;
},
```

That stores the access token and refresh token in the cookie (encrypted).

NextAuth doesn't have a means of token refresh built in, and the recommended approach in their docs just flat-out doesn't work. So we built our own refresh system into our API Request Mechanism.

The long and short of it is, when an API request returns a `401` status, we use a [Redis] backed locking mechanism to pause any other request that might be in flight also trying to refresh the token, and do a token refresh, then release the lock and make the request with new token.

Most relevantly for this discussion, because the front-end makes requests by hitting a Next "back-end" endpoint (and the back-end endpoint makes the actual API request), we can send back cookie headers with that response to the client. Here's the relevant refresh code


```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { encode } from 'next-auth/jwt';
import { serialize } from 'cookie';
import NextAuthJwt from '../NextAuthJwt';
import { SetAccessTokenToTempStore } from './RefreshedAccessTokenTempStore';
import getRefreshAccessToken from './GetRefreshAccessToken';

export default async function RefreshAccessToken (
    req: NextApiRequest,
    res: NextApiResponse,
    token: NextAuthJwt,
) {
    const newToken = await getRefreshAccessToken(token);

    // If we were unable to get refreshed token, there's nothing else we can do
    if (newToken === null) {
        return;
    }

    // Encode the new token as a string for the cookie
    const newTokenString = await encode({
        token: newToken,
        secret: "wouldn't you like to know",
    });

    const cookieName = '__Secure-next-auth.session-token';

    req.cookies[cookieName] = newTokenString;

    res.setHeader(
        'Set-Cookie',
        [
            serialize(
                '__Secure-next-auth.session-token',
                String(newTokenString),
                {
                    httpOnly: true,
                    sameSite: 'lax',
                    path: '/',
                    secure: true,
                    // @see node_modules/next-auth/jwt/index.js DEFAULT_MAX_AGE
                    maxAge: 30 * 24 * 60 * 60,
                },
            ),
        ],
    );

    /**
     * Set the new access token to the temp store so other in-flight requests
     * can access it
     */
    await SetAccessTokenToTempStore(token.accessToken, newToken.accessToken);

    // Update the current token object with the new access token
    token.accessToken = newToken.accessToken;
}
```

## SSR Streaming Can't Set Cookies

Obviously none of that will work in the new SSR Streaming world, where these requests are happening after the initial payload, so what do we do?

The first approach was to create a dedicated back-end endpoint that could set cookie headers in the response when a new token was found in the Redis store. While this is not where I ultimately landed, it does work, and seems to work well. It just felt a tad "hacky" to me, which is why I ultimately rethought this whole thing. You may note that in the code above from the CSR methodology, we are making use of a `TokenTempStore` (backed by Redis) to store the token for 90 seconds, with the old token as the key, so other requests that may already be in-flight can pick up that token. So this first approach leverages that temporary token store.

Here's the updated `RefreshAccessToken` function:

```typescript
import NextAuthJwt from '../auth/[...nextauth]/NextAuthJwt';
import { SetTokenToTempStore } from './RefreshedAccessTokenTempStore';
import GetRefreshedAccessToken from './GetRefreshedAccessToken';

export default async function RefreshAccessToken (
    token: NextAuthJwt,
): Promise<NextAuthJwt | null> {
    const newToken = await GetRefreshedAccessToken(token);

    if (newToken === null) {
        return null;
    }

    await SetTokenToTempStore(
        token.accessToken,
        newToken,
    );

    return newToken;
}
```

Then I created an API route that the front-end could hit with an AJAX request that would check for a new token in that temp store and set a cookie in the response if needed:

```typescript
import { NextResponse } from 'next/server';
import { encode } from 'next-auth/jwt';
import GetTokenFromCookies from '../GetTokenFromCookies';
import { GetTokenFromTempStore } from '../RefreshedAccessTokenTempStore';

export async function GET () {
    const token = await GetTokenFromCookies();

    /**
     * This really shouldn't happen because we only call this endpoint from
     * authenticated pages, but…
     */
    if (!token) {
        return NextResponse.json({ status: 'OK' });
    }

    const newToken = await GetTokenFromTempStore(token.accessToken);

    // If new and existing are the same, we've already set the cookie
    if (!newToken || newToken.accessToken === token.accessToken) {
        return NextResponse.json({ status: 'OK' });
    }
    
    // Now we can send the new token in a cookie header

    const newTokenString = await encode({
        token: newToken,
        secret: "wouldn't you like to know",
    });

    const response = NextResponse.json({ status: 'OK' });

    response.cookies.set(
        '__Secure-next-auth.session-token',
        newTokenString,
        {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            secure: true,
            // @see rxeffect/web/node_modules/next-auth/jwt/index.js DEFAULT_MAX_AGE
            maxAge: 30 * 24 * 60 * 60,
        },
    );

    return response;
}
```

And here's the JSX component I included in the layout of any authenticated page:

```tsx
'use client';

import { useEffect } from 'react';

// This should be called from a server component
export default function CheckForNewTokenAndSetCookie () {
    const check = () => {
        fetch('/api/request/check-store-for-new-token', { cache: 'no-store' });
    };

    useEffect(() => {
        const timeout = setTimeout(check, 2000);

        const interval = setInterval(check, 60000);

        return () => {
            clearTimeout(timeout);
            clearInterval(interval);
        };
    // We actually don't want this to re-render ever, so, here we go
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

```

As I said, this worked, but it really felt a bit hacky, and like there must be another way. As it turns out, there is.

## Storing it all in Redis, full time

You see, the problem is we were still thinking about this front-end app as a stateless app, when in reality, we had already introduced a state storage mechanism via Redis. In the back-end world, in PHP, we store state in persisting mechanisms all the time. Why can't we do that here? What would that look like?

The solution I arrived at was to create a session ID, store that in the cookie, and then store the token under that session ID. Then you use the ID in the cookie to look up the storage. Here's what that looks like.

First, I updated the `NextAuth` JWT callback to store a session ID on the cookie, instead of the token values.


```typescript
jwt: async (
    {
        token,
        user,
        account,
    }: {
        token: JWT;
        user: User;
        account: Account;
    },
) => {
    // Initial sign in
    if (account && user) {
        const sessionId = await CreateTokenStore(account, user);

        return { sessionId };
    }

    return token;
},
```

As you can see, we have a new function we're calling that creates the token store and returns the session ID. Here's what that looks like:

```typescript
import { Account } from 'next-auth';
import { v4 as uuid } from 'uuid';
import { User } from './User';
import getRedisClient from '../../../cache/RedisClient';

/**
 * 4800 seconds is 80 minutes, which is how long refresh tokens are set for in
 * this application. Unfortunately this knowledge isn't available in the token,
 * we just have to know it as a magic value here, which means if we ever change
 * it there… ¯\_(ツ)_/¯
 */
const redisTokenExpireTimeInSeconds = 4800;

export async function CreateTokenStore (
    account: Account,
    user: User,
): Promise<string> {
    const redis = getRedisClient();

    const id = uuid();

    await redis.set(
        `user_token:${id}`,
        JSON.stringify({
            accessToken: account.access_token,
            accessTokenExpires: account.expires_at,
            refreshToken: account.refresh_token,
            user,
        }),
        'EX',
        redisTokenExpireTimeInSeconds,
    );

    return id;
}
```

Now the refresh function can just update the token in the Redis store:

```typescript
import {
    GetTokenFromCookies,
    SetTokenStoreBasedOnCookieKey,
} from '../../auth/[...nextauth]/TokenStore';
import { AcquireLock, ReleaseLock } from './RefreshLock';
import GetRefreshedAccessToken from './GetRefreshedAccessToken';

export default async function RefreshAccessToken () {
    const token = await GetTokenFromCookies();

    // To ensure that only one request is refreshing the token we await a lock
    await AcquireLock(token.accessToken);

    /**
     * Now we check the token in the store again to make sure the token wasn't
     * already refreshed by another request
     */
    const tokenCheck = await GetTokenFromCookies();

    // It looks like the token was already refreshed while we awaited a lock
    if (tokenCheck.accessToken !== token.accessToken) {
        await ReleaseLock(token.accessToken);

        return;
    }

    const newToken = await GetRefreshedAccessToken(token);

    // If there is no token, the refresh was unsuccessful, and so we won't save
    if (!newToken) {
        await ReleaseLock(token.accessToken);

        return;
    }

    // WE HAVE A NEW TOKEN! YAY! Now set it to the token store
    await SetTokenStoreBasedOnCookieKey(newToken);

    await ReleaseLock(token.accessToken);
}
```

Presto. Less hacking, less code, sleep better at night.

For completeness, I'll drop the entire `TokenStore` code, which contains some of the functions you see in the code above:

```typescript
import { cookies } from 'next/headers';
import { Account } from 'next-auth';
import { v4 as uuid } from 'uuid';
import { decode } from 'next-auth/jwt';
import { User } from './User';
import getRedisClient from '../../../cache/RedisClient';
import { NextAuthJwt, NextAuthJwtSchema } from './NextAuthJwt';

/**
 * 4800 seconds is 80 minutes, which is how long refresh tokens are set for in
 * auth0: see Applications > Quest > Settings > Refresh Token Expiration
 * Unfortunately this knowledge isn't available in the token, we just have to
 * know it as a magic value here, which means if we ever change it there… ¯\_(ツ)_/¯
 */
const redisTokenExpireTimeInSeconds = 4800;

export async function CreateTokenStore (
    account: Account,
    user: User,
): Promise<string> {
    const redis = getRedisClient();

    const id = uuid();

    await redis.set(
        `user_token:${id}`,
        JSON.stringify({
            accessToken: account.access_token,
            accessTokenExpires: account.expires_at,
            refreshToken: account.refresh_token,
            user,
        }),
        'EX',
        redisTokenExpireTimeInSeconds,
    );

    return id;
}

export async function GetTokenFromStore (
    sessionId: string,
): Promise<NextAuthJwt | null> {
    const redis = getRedisClient();

    const tokenString = await redis.get(`user_token:${sessionId}`);

    if (!tokenString) {
        return null;
    }

    const token = JSON.parse(tokenString) as NextAuthJwt;

    try {
        NextAuthJwtSchema.parse(token);

        return token;
    } catch (error) {
        return null;
    }
}

const getIdFromCookie = async (): Promise<string | null> => {
    const cookie = cookies().get('__Secure-next-auth.session-token');

    if (!cookie) {
        return null;
    }

    const cookieDecoded = await decode({
        token: cookie.value,
        secret: "wouldn't you like to know",
    });

    return cookieDecoded?.sessionId as string | null;
};

export async function SetTokenStoreBasedOnCookieKey (token: NextAuthJwt) {
    const sessionId = await getIdFromCookie();

    if (!sessionId) {
        return;
    }

    const redis = getRedisClient();

    await redis.set(
        `user_token:${sessionId}`,
        JSON.stringify(token),
        'EX',
        redisTokenExpireTimeInSeconds,
    );
}

export async function FindTokenFromCookies (): Promise <NextAuthJwt | null> {
    const sessionId = await getIdFromCookie();

    if (!sessionId) {
        return null;
    }

    return GetTokenFromStore(sessionId);
}

export async function GetTokenFromCookies (): Promise<NextAuthJwt> {
    const token = await FindTokenFromCookies();

    if (!token) {
        throw new Error('Unable to find token');
    }

    return token;
}
```

And here's the Redis lock code:

```typescript
import sleep from 'sleep-promise';
import getRedisClient from '../../../cache/RedisClient';

export async function AcquireLock (accessToken: string) {
    const redis = getRedisClient();

    let resp = null;

    let tries = 0;

    let acquiredLock = false;

    do {
        // eslint-disable-next-line no-await-in-loop
        resp = await redis.set(
            `refresh_token_lock:${accessToken}`,
            'true',
            'EX',
            60,
            'NX',
        );

        if (resp !== null && resp.toLowerCase() === 'ok') {
            acquiredLock = true;

            break;
        }

        tries += 1;

        // eslint-disable-next-line no-await-in-loop
        await sleep(1000);
    } while (tries < 65);

    if (acquiredLock) {
        return;
    }

    throw new Error('Could not acquire lock');
}

export async function ReleaseLock (accessToken: string) {
    const redis = getRedisClient();

    await redis.del(`refresh_token_lock:${accessToken}`);
}
```

I hope this may be helpful to anyone struggling with any of this.
