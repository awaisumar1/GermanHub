import { notFound, redirect } from "next/navigation";
import { getNodePageModel } from "@/lib/resolver";
import { SharedNodeRenderer } from "@/components/node/shared-node-renderer";
import { getNodeHref } from "@/lib/routes";
import type { Metadata } from "next";

const ALLOWED_TYPES = ["concept", "word", "grammar", "theme", "skill", "mistake", "level"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string; slug: string }>;
}): Promise<Metadata> {
  const { type, slug } = await params;
  
  if (!ALLOWED_TYPES.includes(type)) {
    return {};
  }

  const model = getNodePageModel(slug);
  
  if (!model) return {};

  return {
    title: `${model.node.title} | GermanHub`,
    description: model.node.summary,
  };
}

export default async function GenericNodePage({
  params,
}: {
  params: Promise<{ type: string; slug: string }>;
}) {
  const { type, slug } = await params;

  if (!ALLOWED_TYPES.includes(type)) {
    return notFound();
  }

  const model = getNodePageModel(slug);

  if (!model) return notFound();

  // If the requested generic route doesn't match the node type, redirect
  if (model.node.type !== type) {
    redirect(getNodeHref(slug, model.node.type));
  }

  // If the node type has a specific semantic route, redirect to it
  if (["concept", "word", "theme"].includes(model.node.type)) {
    redirect(getNodeHref(slug, model.node.type));
  }

  return <SharedNodeRenderer model={model} />;
}
