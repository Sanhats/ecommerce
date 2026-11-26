import { AdminTableSkeleton } from "@/components/loading-skeletons";

export default function Loading() {
  return <AdminTableSkeleton columns={5} showHeading={false} />;
}
