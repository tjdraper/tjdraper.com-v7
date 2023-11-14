const YoutubeEmbed = ({ youTubeId }: { youTubeId: string }) => (
    /* <div className="video-responsive">
        <iframe
            width="853"
            height="480"
            src={`https://www.youtube.com/embed/${youTubeId}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Embedded youtube"
        />
    </div> */
    <div className="mx-auto max-w-6xl text-center pt-8">
        <div className="aspect-w-16 aspect-h-9">
            <iframe
                width="853"
                height="480"
                src={`https://www.youtube-nocookie.com/embed/${youTubeId}?modestbranding=1&color=white&showinfo=0&showsearch=0&iv_load_policy=3&rel=0`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            />
        </div>
    </div>
);

export default YoutubeEmbed;
