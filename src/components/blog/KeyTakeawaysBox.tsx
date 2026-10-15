import { ListChecks } from 'lucide-react';

/** Highlighted TL;DR box shown under the article title */
export const KeyTakeawaysBox = ({ items }: { items: string[] }) => {
  const points = items.map((item) => item.trim()).filter(Boolean);
  if (points.length === 0) return null;

  return (
    <aside aria-label="Key takeaways" className="key-takeaways mb-8 sm:mb-10">
      <p className="key-takeaways-title">
        <ListChecks className="w-5 h-5" aria-hidden="true" />
        Key Takeaways
      </p>
      <ul>
        {points.map((point, index) => (
          <li key={index}>{point}</li>
        ))}
      </ul>
    </aside>
  );
};
