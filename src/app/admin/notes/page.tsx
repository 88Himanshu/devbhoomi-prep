import { MaterialList } from "@/components/admin/material-list";
export const metadata = { title: "Notes" };
export default async function Page(props: PageProps<"/admin/notes">) {
  return <MaterialList kind="note" sp={await props.searchParams} />;
}
