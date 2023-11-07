export type Post = {
    id: string;
    slug: string;
    body: string;
    collection: string;
    data: {
        title: string;
        link: string | undefined;
        preview: string;
    };
    render: () => Promise<{ Content: string }>;
};

export type Posts = Array<Post>;
