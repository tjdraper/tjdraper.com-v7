export type Page = {
    id: string;
    slug: string;
    body: string;
    collection: string;
    data: {
        title: string;
    };
    render: () => Promise<{ Content: string }>;
};

export type Pages = Array<Page>;
