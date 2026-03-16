interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="max-w-2xl space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-espresso-500">{eyebrow}</p>
      <h2 className="font-display text-2xl text-espresso-900 sm:text-3xl lg:text-4xl">{title}</h2>
      <p className="text-sm leading-7 text-espresso-600 sm:text-base">{description}</p>
    </div>
  );
}
