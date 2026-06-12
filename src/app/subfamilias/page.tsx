import { SubfamiliasView } from "@/components/comercial/subfamilias/SubfamiliasView";
import { subfamilyFilterOptions } from "@/components/comercial/subfamilias/subfamily-data";

type SubfamiliasPageProps = {
  searchParams: Promise<{ familia?: string }>;
};

export default async function SubfamiliasPage({ searchParams }: SubfamiliasPageProps) {
  const params = await searchParams;
  const requestedFamily = params.familia;
  const initialFamily =
    requestedFamily && subfamilyFilterOptions.families.includes(requestedFamily as never)
      ? requestedFamily
      : subfamilyFilterOptions.families[0];

  return <SubfamiliasView initialFamily={initialFamily} />;
}
