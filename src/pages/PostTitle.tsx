// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import smartypants from 'smartypants';
import { type Post } from './blog/Post';

export default function Component (
    {
        post,
    }: {
        post: Post;
    },
) {
    if (!post.data.link) {
        return (
            // eslint-disable-next-line jsx-a11y/control-has-associated-label
            <a
                className="text-tjd-red-500 hover:text-tjd-red-600 inline-block align-middle"
                href={`/blog/${post.slug}/`}
                dangerouslySetInnerHTML={{ __html: smartypants(post.data.title) }}
            />
        );
    }

    return (
        <>
            {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
            <a
                className="text-tjd-red-500 hover:text-tjd-red-600 inline-block align-middle"
                href={`/blog/${post.slug}/`}
                dangerouslySetInnerHTML={{ __html: smartypants(post.data.title) }}
            />
            <span className="text-gray-500 text-xl inline-block ml-2 align-middle font-normal">
                (Link Post)
            </span>
        </>
    );
}
