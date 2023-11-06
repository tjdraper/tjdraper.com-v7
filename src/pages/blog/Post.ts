export type Post = {
    id: string;
    slug: string;
    body: string;
    collection: string;
    data: {
        title: string;
    };
    render: () => Promise<{ Content: string }>;
};
