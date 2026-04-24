const TRENDING = [
  { category: "Sports \u00b7 Trending", topic: "Champions League", posts: "142K posts" },
  { category: "Technology \u00b7 Trending", topic: "#OpenSource", posts: "58.3K posts" },
  { category: "Trending in your area", topic: "Local Elections", posts: "31.1K posts" },
  { category: "Entertainment \u00b7 Trending", topic: "New Album Drop", posts: "204K posts" },
  { category: "Science \u00b7 Trending", topic: "#SpaceMission", posts: "19.7K posts" },
];

export default function TrendingSection() {
  return (
    <div className="overflow-hidden rounded-[14px] border border-base-300 bg-base-200">
      <h3 className="border-b border-base-300 px-4 pb-[10px] pt-[14px] text-[1rem] font-bold tracking-tight text-base-content">
        What's happening
      </h3>
      {TRENDING.map((item, i) => (
        <div
          key={i}
          className="cursor-pointer border-b border-base-300 px-4 py-3 transition-colors hover:bg-base-300/30 last:border-b-0"
        >
          <p className="mb-0.5 text-[11px] text-base-content/32">{item.category}</p>
          <p className="text-[14px] font-bold tracking-tight text-base-content">{item.topic}</p>
          <p className="text-[12px] text-base-content/50">{item.posts}</p>
        </div>
      ))}
      <div className="cursor-pointer px-4 py-3 transition-colors hover:bg-base-300/30">
        <span className="text-[13px] font-medium text-primary">Show more</span>
      </div>
    </div>
  );
}
