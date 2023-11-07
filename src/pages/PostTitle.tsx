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
            <a
                className="text-tjd-red-500 hover:text-tjd-red-600 inline-block align-middle"
                href={`/tjdraper.com-v7/blog/${post.slug}`}
            >
                {post.data.title}
            </a>
        );
    }

    return (
        <>
            <a
                className="text-tjd-red-500 hover:text-tjd-red-600 inline-block align-middle"
                href={`/tjdraper.com-v7/blog/${post.slug}`}
            >
                {post.data.title}
            </a>
            <span className="text-gray-500 text-xl inline-block ml-2 align-middle font-normal">
                (Link Post)
            </span>
        </>
    );
}
