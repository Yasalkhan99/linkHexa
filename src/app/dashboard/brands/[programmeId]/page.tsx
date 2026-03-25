import type { Metadata } from "next";
import BrandDetailContent from "./BrandDetailContent";

type Props = { params: Promise<{ programmeId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { programmeId } = await params;
  return {
    title: `Brand ${programmeId} | LinkHexa`,
  };
}

export default async function Page({ params }: Props) {
  const { programmeId } = await params;
  return <BrandDetailContent programmeId={programmeId} />;
}
