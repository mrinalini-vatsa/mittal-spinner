import { PublicLayout } from "@/components/Layout";
import ProductCard from "@/components/ProductCard";

const IMAGE_URL = "https://woolandwaves.com/cdn/shop/articles/yarn-review-2021.jpg?v=1626293464&width=1600";

const products = [
  { name: "Combed Cotton Yarn", image: IMAGE_URL, desc: "Premium ring-spun combed cotton — 20s to 60s counts." },
  { name: "Carded Cotton Yarn", image: IMAGE_URL, desc: "Reliable everyday yarn for weaving and knitting." },
  { name: "Polyester Blend", image: IMAGE_URL, desc: "PC and CVC blends engineered for durability." },
  { name: "Open-End Yarn", image: IMAGE_URL, desc: "Rotor-spun yarn for denim and home textiles." },
  { name: "Mélange Yarn", image: IMAGE_URL, desc: "Pre-dyed fiber blends with consistent shade quality." },
  { name: "Compact Yarn", image: IMAGE_URL, desc: "Low-hairiness compact yarn for premium fabrics." },
  { name: "Slub Yarn", image: IMAGE_URL, desc: "Designer slub yarn for fashion fabrics." },
  { name: "Core-Spun Yarn", image: IMAGE_URL, desc: "Strength-enhanced yarn for sewing threads." },
];

const Products = () => (
  <PublicLayout>
    <section className="container py-16">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">Catalogue</p>
      <h1 className="mt-1 text-4xl font-semibold">Yarn Products</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Explore our complete range of cotton, blended and specialty yarns. Custom counts, blends and volumes available on request.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => <ProductCard key={p.name} {...p} />)}
      </div>
    </section>
  </PublicLayout>
);

export default Products;
