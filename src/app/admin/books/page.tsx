import { MaterialList } from "@/components/admin/material-list";
export const metadata = { title: "Books" };
export default async function Page(props: PageProps<"/admin/books">) {
  return <MaterialList kind="book" sp={await props.searchParams} />;
}
