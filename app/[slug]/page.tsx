import GachaGallery from "../../components/GachaGallery";

export default async function AppPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <GachaGallery slug={slug} />;
}
