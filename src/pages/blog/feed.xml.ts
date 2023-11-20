import rss, { type RSSFeedItem } from '@astrojs/rss';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import type { Post, Posts } from './Post';

const mapPostToRssFeedItem = async (post: Post): Promise<RSSFeedItem> => {
    // const tmp = await import(`../../content/blog/${post.id}`);

    const idArray = post.id.split('/');

    const year = idArray[0];

    const month = idArray[1];

    const day = idArray[2];

    const link = `/blog/${post.slug}/`;

    let body = post.data.preview;

    const { title } = post.data;

    body = `
        ${body}
        <a href="https://www.tjdraper.com/blog/${post.slug}/">Read the full post →</a>
    `;

    return ({
        link,
        content: sanitizeHtml(body),
        title,
        pubDate: new Date(`${year}-${month}-${day} 13:00:00 UTC`),
        description: post.data.preview,
    });
};

// eslint-disable-next-line import/prefer-default-export
export async function GET () {
    const posts = (await getCollection('blog')).reverse().slice(0, 100) as unknown as Posts;

    const rssPosts = await Promise.all(
        posts.map(mapPostToRssFeedItem),
    );

    return rss({
        title: 'TJ Writes Software',
        description: 'The writing and ramblings of a software engineering veteran',
        site: 'https://www.tjdraper.com/',
        items: rssPosts,
        customData: '<language>en-us</language>',
    });
}
