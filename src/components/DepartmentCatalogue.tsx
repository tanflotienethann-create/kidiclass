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

  return (
    <>
      <Suspense
        fallback={<div className="h-16 border-b border-gray-100 bg-[#fffdf7]" />}
      >
        <DepartmentNav
          title={department.label}
          homeHref={department.href}
          items={getDepartmentNavigationItems(department.id)}
          departmentId={department.id}
          palette={department.palette}
        />
      </Suspense>
      <Suspense fallback={<main className="min-h-screen bg-[#faf8f4]" />}>
        <CatalogueClient
          departmentId={department.id}
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
