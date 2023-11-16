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
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl text-center mb-10">
                {post.data.title}
            </h1>
        );
    }

    return (
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl text-center mb-10">
            <a href={post.data.link} className="text-tjd-red-500 hover:text-tjd-red-300 underline">
                {post.data.title}
                {' '}
                &rarr;
            </a>
        </h1>
    );
}
