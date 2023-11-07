import { getCollection } from 'astro:content';
import type { Page, Pages } from './Page';

const getPage = async (slug: string): Promise<Page> => {
    const pages = await getCollection('pages') as unknown as Pages;

    const page = pages.filter((pageItem) => pageItem.slug === slug)[0];

    if (!page) {
        throw new Error('Could not find page');
    }

    return page;
};

export default getPage;
