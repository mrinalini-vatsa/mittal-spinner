interface ProductCardProps {
  name: string;
  image: string;
  desc: string;
}

export const ProductCard = ({ name, image, desc }: ProductCardProps) => (
  <article className="group overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-elevated">
    <div className="aspect-[4/3] overflow-hidden bg-secondary">
      <img
        src={image}
        alt={name}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </div>
    <div className="p-5">
      <h3 className="font-semibold text-foreground">{name}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{desc}</p>
    </div>
  </article>
);

export default ProductCard;
