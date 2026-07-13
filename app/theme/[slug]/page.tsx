import { notFound, redirect } from "next/navigation";
import { getNodePageModel } from "@/lib/resolver";
import { SharedNodeRenderer } from "@/components/node/shared-node-renderer";
import { getNodeHref } from "@/lib/routes";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const model = getNodePageModel(slug);
  
  if (!model) return {};

  return {
    title: `${model.node.title} - Theme | GermanHub`,
    description: model.node.summary,
  };
}

export default async function ThemePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const model = getNodePageModel(slug);

  if (!model) return notFound();

  if (model.node.type !== "theme") {
    redirect(getNodeHref(slug, model.node.type));
  }

  return <SharedNodeRenderer model={model} />;
}
