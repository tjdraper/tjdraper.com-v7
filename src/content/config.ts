// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
    schema: z.object({
        title: z.string(),
        link: z.string().optional(),
        preview: z.string(),
    }),
});

const pages = defineCollection({
    schema: z.object({
        title: z.string(),
    }),
});

// eslint-disable-next-line import/prefer-default-export
export const collections = {
    blog,
    pages,
};
