import { getCv } from "@/lib/cv/queries";

export default async function Home() {
  const { profile } = await getCv();
  return (
    <main id="content">
      <h1>{profile.full_name}</h1>
      <p>{profile.headline}</p>
    </main>
  );
}
