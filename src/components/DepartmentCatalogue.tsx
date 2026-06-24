import CatalogueClient from "@/app/catalogue/CatalogueClient";
import {
  getDepartment,
  getDepartmentNavigationItems,
} from "@/lib/shopNavigation";
import { Suspense } from "react";
import DepartmentNav from "./DepartmentNav";

type DepartmentCatalogueProps = {
  departmentId: string;
};

export default function DepartmentCatalogue({
  departmentId,
}: DepartmentCatalogueProps) {
  const department = getDepartment(departmentId);

  if (!department) return null;

  const isCharacterPage = department.id === "personnages";

  return (
    <>
      <DepartmentNav
        title={department.label}
        homeHref={department.href}
        items={getDepartmentNavigationItems(department.id)}
      />
      <Suspense fallback={<main className="min-h-screen bg-[#faf8f4]" />}>
        <CatalogueClient
          allowedCategories={
            isCharacterPage ? undefined : department.categories
          }
          categoryOptions={
            isCharacterPage ? undefined : department.categories
          }
          theme={{
            eyebrow: department.eyebrow,
            title: department.title,
            description: department.description,
            variant: department.variant,
          }}
        />
      </Suspense>
    </>
  );
}
