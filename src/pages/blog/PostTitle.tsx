// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import smartypants from 'smartypants';
import type { Post } from './Post';

export default function Component (
    {
        post,
    }: {
        post: Post;
    },
) {
    if (!post.data.link) {
        return (
            <h1
                className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl text-center mb-10"
                dangerouslySetInnerHTML={{ __html: smartypants(post.data.title) }}
            />
        );
    }

    return (
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl text-center mb-10">
            {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
            <a
                href={post.data.link}
                className="text-tjd-red-500 hover:text-tjd-red-300 underline"
                dangerouslySetInnerHTML={{ __html: `${smartypants(post.data.title)} &rarr;` }}
            />
        </h1>
    );
}
