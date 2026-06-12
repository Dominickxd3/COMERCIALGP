import { ProductosView } from "@/components/comercial/productos/ProductosView";
import {
  getSubfamilyOptions,
  productFilterOptions,
} from "@/components/comercial/productos/product-data";

type ProductosPageProps = {
  searchParams: Promise<{ familia?: string; subfamilia?: string }>;
};

export default async function ProductosPage({ searchParams }: ProductosPageProps) {
  const params = await searchParams;
  const requestedFamily = params.familia;
  const initialFamily =
    requestedFamily && productFilterOptions.families.includes(requestedFamily as never)
      ? requestedFamily
      : productFilterOptions.families[0];

  const allowedSubfamilies = getSubfamilyOptions(initialFamily);
  const requestedSubfamily = params.subfamilia;
  const initialSubfamily =
    requestedSubfamily && allowedSubfamilies.includes(requestedSubfamily)
      ? requestedSubfamily
      : "Todas";

  return <ProductosView initialFamily={initialFamily} initialSubfamily={initialSubfamily} />;
}
